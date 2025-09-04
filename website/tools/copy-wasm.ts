const fs = require('fs-extra')

const copyFiles = async (): Promise<void> => {
  try {
    await fs.copy(
      './node_modules/@embedpdf/pdfium/dist/pdfium.wasm',
      './public/wasm/pdfium.wasm',
    )
    console.log('PDFium files copied over successfully')
  } catch (err) {
    console.error(err)
  }
}

copyFiles()
