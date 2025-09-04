import { h, render } from 'preact';
import { PDFViewer, PDFViewerConfig } from '@/components/app';

export class EmbedPdfContainer extends HTMLElement {
  private root: ShadowRoot;
  private _config?: PDFViewerConfig;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // If config isn’t provided via script, build it from attributes
    if (!this._config) {
      this._config = {
        src: this.getAttribute('src') || '/demo.pdf',
        worker: this.getAttribute('worker') !== 'false',
      };
    }
    this.renderViewer();
  }

  // Setter for config
  set config(newConfig: PDFViewerConfig) {
    this._config = newConfig;
    if (this.isConnected) {
      this.renderViewer();
    }
  }

  // Getter for config
  get config(): PDFViewerConfig | undefined {
    return this._config;
  }

  renderViewer() {
    if (!this._config) return;
    render(<PDFViewer config={this._config} />, this.root);
  }
}
