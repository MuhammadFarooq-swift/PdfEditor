# React Integration for PDF Viewer

This directory contains the React version of the PDF Viewer components.

## Installation

Make sure you have both the core package and React installed:

```bash
npm install @embedpdf/core react react-dom
# or
yarn add @embedpdf/core react react-dom
# or
pnpm add @embedpdf/core react react-dom
```

## Usage

Import the React components from the React entry point:

```tsx
import { EmbedPDF, Viewport } from '@embedpdf/core/react';
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
import { useCapability } from '@embedpdf/core/react';

function MyComponent() {
  const zoom = useCapability('zoom');

  return <button onClick={() => zoom.zoomIn()}>Zoom In</button>;
}
```
