import { renderCoverSvg } from "@cover-generator/cover-renderer";
import {
  coverTemplates,
  defaultTextColor,
  defaultCoverSize,
  defaultTemplate,
  type CoverTemplate
} from "@cover-generator/shared";
import type { FormState, TemplateFieldLayoutItem } from "./types";

export const initialFormState: FormState = {
  header: "",
  title: "",
  date: "",
  subtitle: "",
  footer: "",
  textColor: defaultTextColor,
  template: defaultTemplate,
  size: defaultCoverSize,
  shadow: false,
  blur: false
};

export const panelClass =
  "rounded-[22px] border-2 border-[#e6e6e6] bg-white shadow-[0_1px_0_rgba(255,255,255,0.7)]";

const templatePreviewBackground = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f06767" />
        <stop offset="45%" stop-color="#8f64ff" />
        <stop offset="100%" stop-color="#1b5dd6" />
      </linearGradient>
      <radialGradient id="glow-a" cx="22%" cy="18%" r="54%">
        <stop offset="0%" stop-color="#ffcf70" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#ffcf70" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-b" cx="78%" cy="78%" r="58%">
        <stop offset="0%" stop-color="#091e6b" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#091e6b" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="600" height="600" fill="url(#base)" />
    <rect width="600" height="600" fill="url(#glow-a)" />
    <rect width="600" height="600" fill="url(#glow-b)" />
  </svg>
`)}`;

const templatePreviewTitles: Record<CoverTemplate, string> = {
  modern: "Blue Hour",
  normal: "Morning Air",
  classic: "Late Drive"
};

export const templatePreviewImages = Object.fromEntries(
  coverTemplates.map((template) => [
    template.id,
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      renderCoverSvg({
        image: { src: templatePreviewBackground, mimeType: "image/svg+xml" },
        header: template.id === "classic" ? "@slowlydev" : "APPLE MUSIC",
        title: templatePreviewTitles[template.id],
        date: template.id === "classic" ? "Classical" : "",
        subtitle: "Seoul",
        footer: template.id === "normal" ? "Playlist" : "SELF UPLOAD",
        template: template.id,
        shadow: false,
        blur: false
      }).svg
    )}`
  ])
) as Record<CoverTemplate, string>;

export const quickSymbols: Array<{
  label: string;
  value: string;
  title: string;
}> = [
  { label: "", value: "", title: "Apple" },
  { label: "⌘", value: "⌘", title: "Command" },
  { label: "⌥", value: "⌥", title: "Option" },
  { label: "⌃", value: "⌃", title: "Control" },
  { label: "⇧", value: "⇧", title: "Shift" },
  { label: "⊞", value: "⊞", title: "Windows" },
  { label: "↩", value: "↩", title: "Return" },
  { label: "⇥", value: "⇥", title: "Tab" },
  { label: "⌫", value: "⌫", title: "Delete" },
  { label: "▶", value: "▶", title: "YouTube Music" },
  { label: "◉", value: "◉", title: "Spotify" },
  { label: "◎", value: "◎", title: "Instagram" },
  { label: "♪", value: "♪", title: "Note" },
  { label: "♫", value: "♫", title: "Music" },
  { label: "♥", value: "♥", title: "Heart" },
  { label: "♡", value: "♡", title: "Outline heart" },
  { label: "★", value: "★", title: "Star" },
  { label: "✦", value: "✦", title: "Sparkle" }
];

export const textColorSwatches = [
  "#FFFFFF",
  "#F8FAFC",
  "#FACC15",
  "#FCA5A5",
  "#93C5FD",
  "#86EFAC",
  "#E9D5FF",
  "#111827"
];

export const templateFieldLayout: TemplateFieldLayoutItem[] = [
  { field: "header", span: "full", align: "left", tone: "meta" },
  { field: "title", span: "full", align: "left", tone: "title" },
  { field: "subtitle", span: "full", align: "left", tone: "body" },
  { field: "date", align: "left", tone: "meta" },
  { field: "footer", align: "left", tone: "meta" }
];
