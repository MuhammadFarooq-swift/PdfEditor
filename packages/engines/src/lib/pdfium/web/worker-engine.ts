import { Logger, serializeLogger } from '@embedpdf/models';

import { WebWorkerEngine } from '../../webworker/engine';

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore injected at build time
declare const __WEBWORKER_BODY__: string;

/**
 * Zero-config helper:
 *   const engine = createDefaultWorkerEngine('/wasm/pdfium.wasm');
 */
export function createPdfiumEngine(wasmUrl: string, logger?: Logger) {
  const worker = new Worker(
    URL.createObjectURL(new Blob([__WEBWORKER_BODY__], { type: 'application/javascript' })),
    {
      type: 'module',
    },
  );

  // Send initialization message with WASM URL
  worker.postMessage({
    type: 'wasmInit',
    wasmUrl,
    logger: logger ? serializeLogger(logger) : undefined,
  });

  return new WebWorkerEngine(worker, logger);
}
