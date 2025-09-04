import { WrappedPdfiumModule } from '@embedpdf/pdfium';

export class PdfCache {
  private readonly docs = new Map<string, DocumentContext>();

  constructor(private readonly pdfium: WrappedPdfiumModule) {}

  /** Open (or re-use) a document */
  setDocument(id: string, filePtr: number, docPtr: number) {
    let ctx = this.docs.get(id);
    if (!ctx) {
      ctx = new DocumentContext(filePtr, docPtr, this.pdfium);
      this.docs.set(id, ctx);
    }
  }

  /** Retrieve the DocumentContext for a given PdfDocumentObject */
  getContext(docId: string): DocumentContext | undefined {
    return this.docs.get(docId);
  }

  /** Close & fully release a document and all its pages */
  closeDocument(docId: string): boolean {
    const ctx = this.docs.get(docId);
    if (!ctx) return false;
    ctx.dispose(); // tears down pages first, then FPDF_CloseDocument, free()
    this.docs.delete(docId);
    return true;
  }
}

export class DocumentContext {
  private readonly pageCache: PageCache;

  constructor(
    public readonly filePtr: number,
    public readonly docPtr: number,
    pdfium: WrappedPdfiumModule,
  ) {
    this.pageCache = new PageCache(pdfium, docPtr);
  }

  /** Main accessor for pages */
  acquirePage(pageIdx: number): PageContext {
    return this.pageCache.acquire(pageIdx);
  }

  /** Scoped accessor for one-off / bulk operations */
  borrowPage<T>(pageIdx: number, fn: (ctx: PageContext) => T): T {
    return this.pageCache.borrowPage(pageIdx, fn);
  }

  /** Tear down all pages + this document */
  dispose(): void {
    // 1️⃣ release all pages (with their TTL or immediate)
    this.pageCache.forceReleaseAll();

    // 2️⃣ close the PDFium document
    this.pageCache.pdf.FPDF_CloseDocument(this.docPtr);

    // 3️⃣ free the file handle
    this.pageCache.pdf.pdfium.wasmExports.free(this.filePtr);
  }
}

export class PageCache {
  private readonly cache = new Map<number, PageContext>();

  constructor(
    public readonly pdf: WrappedPdfiumModule,
    private readonly docPtr: number,
  ) {}

  acquire(pageIdx: number): PageContext {
    let ctx = this.cache.get(pageIdx);
    if (!ctx) {
      const pagePtr = this.pdf.FPDF_LoadPage(this.docPtr, pageIdx);
      ctx = new PageContext(this.pdf, this.docPtr, pageIdx, pagePtr, () => {
        this.cache.delete(pageIdx);
      });
      this.cache.set(pageIdx, ctx);
    }
    ctx.clearExpiryTimer(); // cancel any pending teardown
    ctx.bumpRefCount(); // bump ref‐count
    return ctx;
  }

  /** Helper: run a function “scoped” to a page.
   *    – if the page was already cached  → .release() (keeps TTL logic)
   *    – if the page was loaded just now → .disposeImmediate() (free right away)
   */
  borrowPage<T>(pageIdx: number, fn: (ctx: PageContext) => T): T {
    const existed = this.cache.has(pageIdx);
    const ctx = this.acquire(pageIdx);
    try {
      return fn(ctx);
    } finally {
      existed ? ctx.release() : ctx.disposeImmediate();
    }
  }

  forceReleaseAll(): void {
    for (const ctx of this.cache.values()) {
      ctx.disposeImmediate();
    }
    this.cache.clear();
  }
}

const PAGE_TTL = 5000; // 5 seconds

export class PageContext {
  private refCount = 0;
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private disposed = false;

  // lazy helpers
  private textPagePtr?: number;
  private formInfoPtr?: number;
  private formHandle?: number;

  constructor(
    private readonly pdf: WrappedPdfiumModule,
    public readonly docPtr: number,
    public readonly pageIdx: number,
    public readonly pagePtr: number,
    private readonly onFinalDispose: () => void,
  ) {}

  /** Called by PageCache.acquire() */
  bumpRefCount() {
    if (this.disposed) throw new Error('Context already disposed');
    this.refCount++;
  }

  /** Called by PageCache.acquire() */
  clearExpiryTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  /** Called by PageCache.release() internally */
  release() {
    if (this.disposed) return;
    this.refCount--;
    if (this.refCount === 0) {
      // schedule the one-and-only timer for the page
      this.expiryTimer = setTimeout(() => this.disposeImmediate(), PAGE_TTL);
    }
  }

  /** Tear down _all_ sub-pointers & the page. */
  disposeImmediate() {
    if (this.disposed) return;
    this.disposed = true;

    // 2️⃣ close text-page if opened
    if (this.textPagePtr !== undefined) {
      this.pdf.FPDFText_ClosePage(this.textPagePtr);
    }

    // 3️⃣ close form-fill if opened
    if (this.formHandle !== undefined) {
      this.pdf.FORM_OnBeforeClosePage(this.pagePtr, this.formHandle);
      this.pdf.PDFiumExt_ExitFormFillEnvironment(this.formHandle);
    }
    if (this.formInfoPtr !== undefined) {
      this.pdf.PDFiumExt_CloseFormFillInfo(this.formInfoPtr);
    }

    // 4️⃣ finally close the page itself
    this.pdf.FPDF_ClosePage(this.pagePtr);

    // 5️⃣ remove from the cache
    this.onFinalDispose();
  }

  // ── public helpers ──

  /** Always safe: opens (once) and returns the text-page ptr. */
  getTextPage(): number {
    this.ensureAlive();
    if (this.textPagePtr === undefined) {
      this.textPagePtr = this.pdf.FPDFText_LoadPage(this.pagePtr);
    }
    return this.textPagePtr;
  }

  /** Always safe: opens (once) and returns the form-fill handle. */
  getFormHandle(): number {
    this.ensureAlive();
    if (this.formHandle === undefined) {
      this.formInfoPtr = this.pdf.PDFiumExt_OpenFormFillInfo();
      this.formHandle = this.pdf.PDFiumExt_InitFormFillEnvironment(this.docPtr, this.formInfoPtr);
      this.pdf.FORM_OnAfterLoadPage(this.pagePtr, this.formHandle);
    }
    return this.formHandle;
  }

  /**
   * Safely execute `fn` with an annotation pointer.
   * Pointer is ALWAYS closed afterwards.
   */
  withAnnotation<T>(annotIdx: number, fn: (annotPtr: number) => T): T {
    this.ensureAlive();
    const annotPtr = this.pdf.FPDFPage_GetAnnot(this.pagePtr, annotIdx);
    try {
      return fn(annotPtr);
    } finally {
      this.pdf.FPDFPage_CloseAnnot(annotPtr);
    }
  }

  private ensureAlive() {
    if (this.disposed) throw new Error('PageContext already disposed');
  }
}
