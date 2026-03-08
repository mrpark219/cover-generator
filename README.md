# cover-generator

`cover-generator` is a local monorepo that produces Apple Music-style square date covers from local photos. It includes a polished Next.js web UI and a CLI, both powered by the same shared SVG renderer.

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

- multi-image upload with active preview switching
- select/include per image and batch ZIP download
- header, title, freeform date/meta, subtitle, and footer input
- live square preview
- three templates: `modern`, `normal`, `classic`
- optional `shadow` and `blur` effects
- local PNG export

## Run The CLI

Build the CLI first:

```bash
npm run build
```

Run it directly from the repo:

```bash
./apps/cli/dist/index.js generate ./input/photo.jpg --header "APPLE MUSIC" --title "Han River" --date "2026-03-01" --subtitle "Seoul" --footer "SELF UPLOAD"
```

Or install the root package locally so the `cover-generator` command is exposed through the root `bin` field:

```bash
npm link
cover-generator generate ./input/photo.jpg --title "Han River" --date "2026-03-01" --subtitle "Seoul"
```

Useful CLI options:

- `--template <modern|normal|classic>`
- `--header <text>`
- `--subtitle <text>`
- `--footer <text>`
- `--shadow`
- `--blur`
- `-o, --output <path>`

Examples:

```bash
cover-generator generate ./input/photo.jpg --header "APPLE MUSIC" --title "Han River" --date "2026-03-01" --subtitle "Seoul" --footer "SELF UPLOAD"
cover-generator generate ./input/photo.jpg --header "@slowlydev" --title "Night Walk" --date "2026-03-04" --subtitle "Mapo" --footer "PLAYLIST" --template classic --shadow --blur
cover-generator generate ./input/photo.jpg --header "MARCH EDIT" --title "Morning Air" --date "2026-03-05" --subtitle "Busan" --footer "VOL. 02" --template normal --output ./exports
cover-generator generate ./input/photo.jpg --header "STUDIO LOG" --title "Studio Day" --date "2026-03-06" --subtitle "Seongsu" --footer "SELF UPLOAD" --output ./exports/studio-day.png
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

- `modern`: large title in the lower third with small Apple Music header text
- `normal`: centered text stack with softer contrast and calmer hierarchy
- `classic`: stronger contrast, large date accent, and a heavier bottom panel

All templates now share the same editable text model:

- `header`
- `title`
- `date`
- `subtitle`
- `footer`

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
