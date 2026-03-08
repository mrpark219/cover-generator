import type { StudioCopy } from "./types";

export const enUiText: StudioCopy = {
  pageEyebrow: "cover-generator",
  pageTitle: "Turn one photo into a cover.",
  pageDescription: "Edit text, adjust crop, and save PNG or ZIP locally.",
  steps: ["1 Upload", "2 Edit", "3 Batch", "4 Download"],
  language: "Language",
  preview: "Preview",
  noActiveImage: "No active image",
  noPreviewTitle: "No Preview Yet",
  noPreviewDescription: "Upload one or more images to start rendering covers.",
  selectedCount: (selected, total) =>
    total > 0 ? `${selected}/${total} selected` : "No upload",
  selectedGroup: "Selected Group",
  selectedGroupHint: (activeIndex, count) =>
    activeIndex >= 0
      ? `Previewing ${activeIndex + 1} of ${count} selected images.`
      : `${count} images are selected. Focus the group to preview them in order.`,
  shared: "Shared",
  previous: "Previous",
  next: "Next",
  focusSelectedGroup: "Focus Group",
  selectedGroupFocused: "Group Focused",
  downloadCurrentPng: "Save PNG",
  downloadSelectedZip: (count) =>
    count > 0 ? `Save ZIP (${count})` : "Save ZIP",
  exportCurrentBusy: "Exporting PNG...",
  exportBatchBusy: (count) =>
    count > 1 ? `Exporting ${count} covers...` : "Exporting selected cover...",
  settings: "Layout",
  settingsDescription:
    "Text and template can be shared. Crop stays per image.",
  fields: {
    header: "Header",
    title: "Title",
    subtitle: "Subtitle",
    date: "Date / Meta",
    footer: "Footer"
  },
  placeholders: {
    header: "APPLE MUSIC",
    title: "Han River",
    subtitle: "Seoul",
    date: "2026-03-01 or Vol. 01",
    footer: "SELF UPLOAD"
  },
  templates: {
    modern: {
      label: "Modern",
      description: "Top-left title stack with a clean Apple Music-style balance."
    },
    normal: {
      label: "Normal",
      description: "Centered composition with a softer, calmer text hierarchy."
    },
    classic: {
      label: "Classic",
      description: "More editorial contrast with stronger header and footer framing."
    }
  },
  template: "Template",
  resolution: "Resolution",
  position: "Image Position",
  positionDescription: "Crop stays per image.",
  horizontal: "Horizontal",
  vertical: "Vertical",
  resetPosition: "Reset",
  quickSymbols: "Quick Symbols",
  insertsInto: (fieldLabel) => `Inserts into ${fieldLabel}`,
  effects: "Effects",
  useShadow: "Use shadow",
  useShadowDescription: "Adds contrast on bright photos.",
  useBlur: "Use blur",
  useBlurDescription: "Softens the background treatment.",
  images: "Images",
  sourceModes: {
    upload: "Self Upload",
    url: "Paste URL"
  },
  imagesTitle: "Upload images or paste URLs",
  imagesDescription:
    "Click to preview. Double-click to move a card into the shared batch.",
  uploadDropHint: "Drop image files here or choose them from disk.",
  urlTitle: "Paste one or more image URLs",
  urlDescription:
    "Use one URL per line. The browser can import only URLs that allow direct image access.",
  urlPlaceholder:
    "https://images.example.com/cover.jpg\nhttps://cdn.example.com/another.webp",
  addUrls: "Add URLs",
  chooseImages: "Choose Images",
  selectAll: "Select All",
  deselectAll: "Deselect All",
  clearAll: "Clear All",
  collection: "Collection",
  collectionHint: "Click for preview, double-click for batch.",
  uploadedCount: (count) => (count > 0 ? `${count} uploaded` : "Empty"),
  selectedProgress: (activeIndex, count) =>
    activeIndex >= 0 ? `${activeIndex + 1}/${count} in group` : `${count} selected`,
  active: "Active",
  selected: "Selected",
  draft: "Draft",
  emptyCollection:
    "Upload multiple images to start. Each card keeps its own settings until you double-click it into the shared batch.",
  selectedIndex: (index) => `#${index}`,
  detailsSummary: "CLI parity and rendering notes",
  cliParity: "CLI Parity",
  renderingNotes: "Rendering Notes",
  renderingNoteOne: "Full-bleed image cropping stays inside the shared SVG renderer.",
  renderingNoteTwo: "Text wraps and shrinks until it fits each template safe area.",
  renderingNoteThree: "Blur and shadow remain optional and match the CLI flags.",
  cardActiveHint: "Active preview inside the shared group.",
  cardSelectedHint: "Shared batch settings",
  cardDraftHint: "Own settings",
  urlEmptyError: "Paste at least one valid image URL.",
  urlFetchError:
    "One or more URLs could not be imported. The host may block direct browser access.",
  uploadError: "Upload JPG, PNG, WebP, or AVIF images.",
  readError: "The file could not be read.",
  previewError: "Preview rendering failed.",
  pngError: "PNG export failed.",
  zipError: "ZIP export failed.",
  preparingImages: (count) =>
    count > 1 ? `Preparing ${count} images...` : "Preparing image...",
  importingUrls: (count) =>
    count > 1 ? `Importing ${count} URLs...` : "Importing URL...",
  coverPreviewAlt: "Cover preview",
  uploadedSourceAlt: "Uploaded source",
  templatePreviewAlt: (label) => `${label} template preview`
};
