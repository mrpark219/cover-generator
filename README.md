# cover-generator

`cover-generator` is a local monorepo that produces Apple Music-style square date covers from a single photo. It includes a polished Next.js web UI and a CLI, both powered by the same shared SVG renderer.

## Stack

- `npm` workspaces
- Next.js App Router
- TypeScript
- Tailwind CSS
- Sharp
- Commander

## Project Structure

```text
cover-generator/
├── apps/
│   ├── cli/                 # Node.js CLI entry and output handling
│   └── web/                 # Next.js one-page cover studio
├── packages/
│   ├── cover-renderer/      # Shared SVG composition and template logic
│   └── shared/              # Shared types, templates, date/file utilities
├── package.json             # Root scripts and CLI bin exposure
└── README.md
```

## Requirements

- Node.js `20.18+`
- npm `11+`

## Install

```bash
npm install
```

## Run The Web App

```bash
npm run dev
```

Open `http://localhost:3000`.

The web app supports:

- one image upload
- title, date, and subtitle input
- live square preview
- three templates: `classic`, `minimal`, `dark`
- local PNG export

## Run The CLI

Build the CLI first:

```bash
npm run build
```

Run it directly from the repo:

```bash
./apps/cli/dist/index.js generate ./input/photo.jpg --title "Han River" --date "2026-03-01" --subtitle "Seoul"
```

Or install the root package locally so the `cover-generator` command is exposed through the root `bin` field:

```bash
npm link
cover-generator generate ./input/photo.jpg --title "Han River" --date "2026-03-01" --subtitle "Seoul"
```

Useful CLI options:

- `--template <classic|minimal|dark>`
- `--subtitle <text>`
- `-o, --output <path>`

Examples:

```bash
cover-generator generate ./input/photo.jpg --title "Han River" --date "2026-03-01" --subtitle "Seoul"
cover-generator generate ./input/photo.jpg --title "Night Walk" --date "2026-03-04" --subtitle "Mapo" --template dark
cover-generator generate ./input/photo.jpg --title "Morning Air" --date "2026-03-05" --subtitle "Busan" --template minimal --output ./exports
cover-generator generate ./input/photo.jpg --title "Studio Day" --date "2026-03-06" --subtitle "Seongsu" --output ./exports/studio-day.png
```

Default CLI output goes to `./output/<generated-file-name>.png`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Rendering Architecture

The key design choice is that image composition lives in `packages/cover-renderer`, not in the web UI or CLI.

Flow:

1. The web app or CLI turns the input photo into a data URL.
2. The shared renderer generates a square SVG using the selected template.
3. The web app previews that SVG directly and rasterizes it to PNG in the browser on export.
4. The CLI rasterizes the same SVG to PNG with Sharp.

This keeps layout logic in one place:

- template styling
- image framing and crop behavior
- text wrapping
- text shrinking
- date formatting

## Templates

- `classic`: full-bleed photo, cinematic dark fade, bold bottom typography
- `minimal`: editorial matte frame, centered title, soft neutral palette
- `dark`: moody overlay, glass panel, stronger contrast

## How Text Handling Works

Long text is handled in the shared renderer with an approximate text measurement system:

- wraps text by words
- breaks oversized tokens by character when needed
- reduces font size until the block fits the available area
- truncates the final line with an ellipsis only as a last fallback

The goal is to keep the cover readable without letting text overflow outside the canvas.

## Assumptions

- Date formatting is normalized to uppercase English labels for a consistent Apple Music-inspired look.
- The implementation recreates the public behavior and visual feel of CoverX with an original local renderer.
- Rendering is fully local. No backend service is required.

## Verification

Verified locally during implementation:

- shared renderer TypeScript lint
- web lint
- web production build
- CLI TypeScript lint
- CLI production build
- CLI PNG generation to `output/`
