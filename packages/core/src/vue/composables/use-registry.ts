import { inject } from 'vue';
import { pdfKey } from '../context';

export function useRegistry() {
  const ctx = inject(pdfKey);
  if (!ctx) throw new Error('useRegistry must be used inside <EmbedPDF>');
  return ctx;
}
