<div align="center">
  <a href="https://www.embedpdf.com">
    <img alt="EmbedPDF logo" src="https://www.embedpdf.com/logo-192.png" height="96">
  </a>

  <h1>EmbedPDF</h1>

  <!-- Badges -->

<a href="https://github.com/embedpdf/embed-pdf-viewer/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@embedpdf/pdfium.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/embedpdf/embed-pdf-viewer/discussions"><img alt="Join the community on GitHub" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&labelColor=000000"></a>

</div>

# React MUI PDF Viewer Example

This example shows how to build a fully‑featured PDF viewer with **EmbedPDF**, **React 18** and **Material UI v7**. It demonstrates how to combine EmbedPDF’s plugin system with MUI components to create a polished reading experience that feels right at home in any React + MUI project.

- **Live demo:** [https://mui.embedpdf.com/](https://mui.embedpdf.com/)
- **Docs:** [https://www.embedpdf.com](https://www.embedpdf.com)

---

## Key features on display

| Feature                                                    | Plugin(s)                                             |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| Virtualised scrolling with smooth page rendering           | `@embedpdf/plugin-scroll` + `@embedpdf/plugin-render` |
| Zoom controls (fit page, fit width, marquee zoom, presets) | `@embedpdf/plugin-zoom`                               |
| Pan/hand tool                                              | `@embedpdf/plugin-pan`                                |
| Rotate pages                                               | `@embedpdf/plugin-rotate`                             |
| Single and spread layouts                                  | `@embedpdf/plugin-spread`                             |
| Thumbnail sidebar                                          | `@embedpdf/plugin-thumbnail`                          |
| In‑document text search                                    | `@embedpdf/plugin-search`                             |
| File picker & download                                     | `@embedpdf/plugin-loader`, `@embedpdf/plugin-export`  |
| Fullscreen support                                         | `@embedpdf/plugin-fullscreen`                         |

The UI around these plugins is built with MUI’s `AppBar`, `Toolbar`, `Drawer`, `Menu`, `IconButton`, and other components. On mobile the side drawers collapse into a bottom sheet for a more native feel.

---

## Quick start

> **Prerequisites**
>
> - Node 18 or newer
> - **pnpm** 10 (recommended) or a recent pnpm 8/9

1. **Clone the repo** (or your fork) and install dependencies:

   ```bash
   git clone https://github.com/embedpdf/embed-pdf-viewer.git
   cd embed-pdf-viewer
   pnpm install
   ```

2. **Build the core packages** once so that the example can import them:

   ```bash
   pnpm run build --filter "./packages/*"
   # or keep them rebuilt automatically while you work:
   pnpm watch build --filter "./packages/*"
   ```

3. **Run the example dev server**:

   ```bash
   pnpm --filter @embedpdf/example-react-mui run dev
   ```

   Vite will start on [http://localhost:3000](http://localhost:3000) and open the browser automatically.

---

## Building a production bundle

To create an optimized build (under `examples/react-mui/dist`):

```bash
pnpm --filter @embedpdf/example-react-mui run build
```

The output is a static site you can deploy to any CDN or static host.

---

## Folder layout

```
examples/react-mui
├── public/           # Static assets (if any)
└── src/
    ├── components/   # MUI‑based UI parts (toolbar, drawers, …)
    ├── hooks/        # Small shared hooks (eg. use‑is‑mobile)
    ├── application.tsx  # Main viewer shell and plugin wiring
    └── main.tsx      # React entry + theming + worker setup
```

The worker (`src/webworker.ts`) loads the PDFium WebAssembly bundle from jsDelivr and passes it to EmbedPDF’s **WebWorkerEngine**.

---

## Customisation tips

- **Swap icons or colours:** The UI uses MUI’s `sx` prop everywhere, so styling tweaks are one line away.
- **Add or remove plugins:** Open `src/application.tsx` and edit the `plugins` array.

For deep dives check the [EmbedPDF documentation](https://www.embedpdf.com) and the source of this example.

---

## License

Example code is released under the MIT license, the same as EmbedPDF itself.
