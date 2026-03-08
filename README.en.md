# cover-generator

`cover-generator` is a local monorepo for creating Apple Music-style square covers from a single image. It includes a Next.js web studio and a CLI, both powered by the same shared renderer.

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
│   └── shared/              # Shared types, template metadata, shared utilities
├── package.json             # Root scripts and CLI bin exposure
├── README.md                # Language chooser
├── README.en.md             # English documentation
└── README.ko.md             # Korean documentation
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

- self upload and direct image URL paste
- multi-image import
- drag-and-drop grouping in the collection area
- per-image editing and per-group shared editing
- batch ZIP export with checkbox selection
- resolution selection: `1200`, `1600`, `2048`
- per-image crop position adjustment
- English and Korean UI switching
- editable `header`, `title`, `subtitle`, `date/meta`, and `footer`
- live square preview
- three templates: `modern`, `normal`, `classic`
- optional `shadow` and `blur`
- local PNG export

## Run The CLI

Build the CLI first:

```bash
npm run build
```

If you only want to verify the web app:

```bash
npm run build -w @cover-generator/web
```

Run the CLI directly from the repo:

```bash
./apps/cli/dist/index.js generate ./input/photo.jpg \
  --header "@mrpark219" \
  --title "SungHwan Park" \
  --subtitle "cover-generator" \
  --date "KOREA · 2026" \
  --footer "made by mrpark219"
```

Or expose the root `bin` locally:

```bash
npm link
cover-generator generate ./input/photo.jpg --title "SungHwan Park"
```

Useful CLI options:

- `--template <modern|normal|classic>`
- `--size <1200|1600|2048>`
- `--focus-x <0-100>`
- `--focus-y <0-100>`
- `--header <text>`
- `--subtitle <text>`
- `--footer <text>`
- `--text-color <hex>`
- `--shadow`
- `--blur`
- `-o, --output <path>`

Examples:

```bash
cover-generator generate ./input/photo.jpg --header "@mrpark219" --title "SungHwan Park" --subtitle "cover-generator" --date "KOREA · 2026" --footer "made by mrpark219"
cover-generator generate ./input/photo.jpg --template classic --title "Night Walk" --subtitle "Mapo" --date "VOL. 02" --shadow --blur
cover-generator generate ./input/photo.jpg --template normal --size 2048 --focus-x 45 --focus-y 35 --text-color "#F8FAFC" --output ./exports/cover.png
```

Default CLI output goes to `./output/<generated-file-name>.png`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

Useful workspace-level shortcuts:

```bash
npm run build -w @cover-generator/web
npm run lint -w @cover-generator/web
npm run build -w @cover-generator/cli
npm run lint -w @cover-generator/cli
```

## Rendering Architecture

The main design choice is that image composition lives in `packages/cover-renderer`, not in the web UI or CLI.

Flow:

1. The web app or CLI converts the source image into a data URL.
2. The shared renderer creates a square SVG with the selected template.
3. The web app previews that SVG directly and rasterizes it to PNG in the browser on export.
4. The CLI rasterizes the same SVG to PNG with Sharp.

Shared renderer responsibilities:

- template layout
- image crop and framing
- text wrapping
- font-size reduction
- text color and visual effects

UI copy is organized under `apps/web/lib/i18n/`, so adding another language later only requires another language file and registration.

## Templates

- `modern`: top-left title stack with a compact Apple Music-style hierarchy
- `normal`: centered composition with a softer visual rhythm
- `classic`: stronger editorial contrast with more pronounced top and bottom metadata

All templates share the same editable text model:

- `header`
- `title`
- `subtitle`
- `date`
- `footer`

## Text Handling

Long text is handled in the shared renderer with approximate text measurement:

- wrap by words first
- break very long tokens when needed
- reduce font size until the block fits
- truncate only as a final fallback

The goal is to keep the cover readable without overflow.

## Assumptions

- The `date` field is freeform meta text and is rendered exactly as entered.
- The implementation recreates the public feel of CoverX through an original local implementation.
- Rendering is fully local. No backend service is required.

## Verification

Verified locally:

- web lint
- web production build
- CLI lint
- CLI production build
- CLI PNG generation to `output/`
