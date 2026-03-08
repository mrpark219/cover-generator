import type { StudioCopy } from "./types";

export const enUiText: StudioCopy = {
  pageEyebrow: "cover-generator",
  pageTitle: "Cover Studio",
  pageDescription: "",
  steps: ["1 Upload", "2 Edit", "3 Batch", "4 Download"],
  language: "Language",
  preview: "Preview",
  noActiveImage: "No active image",
  noPreviewTitle: "No Preview Yet",
  noPreviewDescription: "Add an image and the cover preview appears right away.",
  selectedCount: (selected, total) =>
    total > 0 ? `${selected}/${total} selected` : "No upload",
  selectedGroup: "Selected Group",
  selectedGroupHint: (activeIndex, count) =>
    activeIndex >= 0
      ? `Viewing ${activeIndex + 1} of ${count} in the batch.`
      : `${count} images are grouped. Focus the batch to review them in order.`,
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
    "Text and template can move together. Crop stays unique to each image.",
  fields: {
    header: "Header",
    title: "Title",
    subtitle: "Subtitle",
    date: "Date / Meta",
    footer: "Footer"
  },
  placeholders: {
    header: "@mrpark219",
    title: "SungHwan Park",
    subtitle: "cover-generator",
    date: "KOREA · 2026",
    footer: "made by mrpark219"
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
  textColor: "Text Color",
  resetColor: "Reset",
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
  imagesTitle: "Drop in images or paste links",
  imagesDescription:
    "Click to preview. Double-click to move a card into the shared batch.",
  uploadDropHint: "Drop image files here or pick them from disk.",
  urlTitle: "Paste image links, one per line",
  urlDescription:
    "Most public image links work. Some hosts may still block remote fetches.",
  urlPlaceholder:
    "https://images.example.com/cover.jpg\nhttps://cdn.example.com/another.webp",
  addUrls: "Add URLs",
  chooseImages: "Choose Images",
  selectAll: "Select All",
  deselectAll: "Deselect All",
  clearAll: "Clear All",
  collection: "Collection",
  collectionHint: "Click to preview, double-click to batch.",
  uploadedCount: (count) => (count > 0 ? `${count} uploaded` : "Empty"),
  selectedProgress: (activeIndex, count) =>
    activeIndex >= 0 ? `${activeIndex + 1}/${count} in group` : `${count} selected`,
  active: "Active",
  selected: "Selected",
  draft: "Draft",
  emptyCollection:
    "Add a few images to get started. Each card keeps its own settings until you double-click it into the shared batch.",
  selectedIndex: (index) => `#${index}`,
  detailsSummary: "CLI command and rendering tips",
  detailsHint: "Open panel",
  cliParity: "CLI Parity",
  renderingNotes: "Rendering Tips",
  renderingNoteOne:
    "Cropping happens in the shared renderer, so the web app and CLI frame the image the same way.",
  renderingNoteTwo:
      "Long text wraps first, then scales down so it still fits the layout cleanly.",
  renderingNoteThree:
    "Blur softens the photo treatment. Shadow helps text stand out on brighter images.",
  cardActiveHint: "Currently in focus inside the batch.",
  cardSelectedHint: "Uses the shared batch settings",
  cardDraftHint: "Keeps its own settings",
  urlEmptyError: "Paste at least one valid image URL.",
  urlFetchError:
    "One or more URLs could not be imported. The host may block remote fetches or the URL may not be an image.",
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
