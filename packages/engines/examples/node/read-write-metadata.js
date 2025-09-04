import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { init } from '@embedpdf/pdfium';
import { PdfiumEngine } from '@embedpdf/engines/pdfium';
import { createNodeImageDataToBufferConverter } from '@embedpdf/engines/converters';
import { ConsoleLogger } from '@embedpdf/models';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runExample() {
  const consoleLogger = new ConsoleLogger();

  const imageConverter = createNodeImageDataToBufferConverter(sharp);

  // Initialize PDFium
  const pdfiumInstance = await init();
  const engine = new PdfiumEngine(pdfiumInstance, {
    logger: consoleLogger,
    imageDataConverter: imageConverter,
  });
  engine.initialize();

  const pdfPath = process.argv[2] || join(__dirname, 'ebook.pdf');
  const pdfBuffer = await readFile(pdfPath);
  const document = await engine
    .openDocumentBuffer({
      id: 'sample',
      content: pdfBuffer,
    })
    .toPromise();

  const metadata = await engine.getMetadata(document).toPromise();
  console.log(metadata);

  await engine
    .setMetadata(document, {
      title: 'New Title',
      author: 'New Author',
      producer: 'EmbedPDF',
      creator: 'EmbedPDF',
      modificationDate: new Date(),
    })
    .toPromise();

  const metadata2 = await engine.getMetadata(document).toPromise();
  console.log(metadata2);

  await engine.closeDocument(document).toPromise();

  process.exit(0);
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}
