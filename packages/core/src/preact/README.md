# Preact Integration for PDF Viewer

This directory contains the Preact version of the PDF Viewer components, which is a port of the React implementation.

## Installation

Make sure you have both the core package and Preact installed:

```bash
npm install @embedpdf/core preact
# or
yarn add @embedpdf/core preact
# or
pnpm add @embedpdf/core preact
```

## Usage

Import the Preact components from the Preact entry point:

```tsx
import { EmbedPDF, Viewport } from '@embedpdf/core/preact';
import { somePlugin } from '@embedpdf/plugin-some-plugin';

function MyPDFViewer() {
  return (
    <EmbedPDF
      engine={/* your PDF engine */}
      onInitialized={async (registry) => {
        // Initialize your viewer
      }}
      plugins={(viewportElement) => [
        // Your plugins
      ]}
    >
      <Viewport className="my-viewport" />
    </EmbedPDF>
  );
}
```

## Hooks

You can also use the provided hooks:

```tsx
import { useCapability } from '@embedpdf/core/preact';

function MyComponent() {
  const zoom = useCapability('zoom');

  return <button onClick={() => zoom.zoomIn()}>Zoom In</button>;
}
```
