# Mindloom

Mindloom is a small, private, browser-based mind map editor for one person. It implements the everyday loop of adding and arranging topics, connecting them, saving editable maps as JSON on ArkOS/NAS, and exporting portable files. It is a personal replacement for the core loop of Xmind, not a feature-for-feature clone.

## Web app or desktop app?

The browser app is built and published with the Wealth Dashboard GitHub Pages site. It keeps a local IndexedDB cache and reads maps from ArkOS; edits are written to NAS after connecting with the dedicated Mindloom write token. It reuses the Wangfu read token already saved by the parent site and does not reuse the financial API key or ArkOS-wide upload token.

## Get started

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm run install:deps
npm run dev
```

Open the local URL printed by Vite. `.env.example` documents the ArkOS API base URL; production builds default to `https://api.ark-os26.cc`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run install:deps` | Install project dependencies |
| `npm run dev` | Start the local development server |
| `npm test` | Run data model and editor workflow unit tests |
| `npm run test:e2e` | Run the browser smoke test (requires Playwright Chromium) |
| `npm run build` | Type-check and create the Pages app in the repository's `mindloom/` output folder |
| `npm run preview` | Serve the production build locally |
| `npm run start:local` | Build, then serve the production build locally |

For a production-style local run: `npm run start:local`.

## Permissions and privacy

- The app requests no browser permissions. Reads use the Wangfu read token; a separate Mindloom write token is requested when connecting and, after successful verification, kept in this browser's `localStorage` so it works across tabs and browser restarts. Use the X button beside the NAS control to forget it. Browser storage is not encrypted; anyone with access to this browser profile or same-origin scripts can access it.
- Maps are mirrored in IndexedDB (`mindloom-local`, `maps`) and stored on NAS as one `data/mindmaps/<id>.json` file per map. The server validates the JSON shape and atomically replaces each file.
- The app makes no analytics or telemetry requests. Map contents are sent only to the configured ArkOS API.
- Browser storage is not an encrypted vault. Device access, browser profile access, and operating-system protections remain the user's responsibility.
- Imported JSON is size-limited and shape-validated before use. Files above 2 MB, unknown formats, invalid coordinates, unresolved edges, or excessive node counts are rejected.

## Backup and portability

Use **Export → JSON backup** regularly. JSON is the editable, portable backup that can be imported later. SVG and PNG are presentation exports and do not preserve the editable map structure. Import creates a separate map copy with an “(imported)” title; it does not overwrite the current map.

## Architecture

- `src/model.ts`: map types, safe import validation, and pure graph operations.
- `src/db.ts`: IndexedDB storage boundary.
- `src/App.tsx`: editor workflow and SVG canvas.
- `src/style.css`: responsive editor presentation and focus states.
- `src/model.test.ts`, `src/workflow.test.tsx`: focused model and autosave checks.
- `e2e/core-loop.spec.ts`: browser smoke test for create, edit, and export.

## Current limits

- Single-user editing; there is no collaboration or conflict resolution between simultaneous editors.
- This is a focused editor, not a full Xmind clone. Large template libraries, high-fidelity Xmind import/export, comments, multiplayer cursors, and presentation features are deliberately excluded.
- The first run opens a clearly labeled sample map. Delete it from the left sidebar when ready to start fresh.
- Layout is manual. Nodes can be dragged and resized; automatic layout, minimap, undo history, and touch-optimized mobile editing are not included.
- Existing local maps upload to NAS when the dedicated write token is connected. Keep JSON backups before deleting maps or clearing browser storage.

## ArkOS setup

The ArkOS API adds `GET /api/mindmaps`, `PUT /api/mindmaps/:id`, `DELETE /api/mindmaps/:id`, and `POST /api/mindmaps/verify`. Reads use the existing `ARKOS_READ_TOKEN`; writes require a separate `ARKOS_MINDMAP_WRITE_TOKEN` and cannot modify other ArkOS data. Set that variable in the NAS's private runtime configuration before enabling writes. Never put its value in this repository or a public release record.
