import { PdfImage } from '@embedpdf/models';

export type LazyImageData = () => PdfImage;

/**
 * Function type for converting ImageData to Blob
 * In browser: uses OffscreenCanvas
 * In Node.js: can use Sharp or other image processing libraries
 */
export type ImageDataConverter<T = Blob> = (
  getImageData: LazyImageData,
  imageType?: ImageConversionTypes,
  imageQuality?: number,
) => Promise<T>;

export type ImageConversionTypes = 'image/webp' | 'image/png' | 'image/jpeg';
