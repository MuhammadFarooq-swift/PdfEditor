import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { init } from '@embedpdf/pdfium';
import { PdfiumEngine } from '@embedpdf/engines/pdfium';
import { createNodeImageDataToBufferConverter } from '@embedpdf/engines/converters';
import { ConsoleLogger, Rotation } from '@embedpdf/models';

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

  const pdfPath = process.argv[2] || join(__dirname, 'sample.pdf');
  const pdfBuffer = await readFile(pdfPath);
  const document = await engine
    .openDocumentBuffer({
      id: 'sample',
      content: pdfBuffer,
    })
    .toPromise();

  const annotations = await engine.getPageAnnotations(document, document.pages[0]).toPromise();
  console.log('annotations', annotations);

  if (annotations.length === 0) {
    console.log('No annotations found');
    process.exit(0);
  }

  const pdfImage = await engine
    .renderPageAnnotation(document, document.pages[0], annotations[0], {
      rotation: Rotation.Degree0,
      imageType: 'image/png',
    })
    .toPromise();
  await writeFile(join(__dirname, 'annotation-output.png'), pdfImage);

  await engine.closeDocument(document).toPromise();

  process.exit(0);
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}
