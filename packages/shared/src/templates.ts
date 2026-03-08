import type { CoverTemplate, CoverTemplateOption } from "./types";

export const defaultTemplate: CoverTemplate = "modern";

export const coverTemplates: CoverTemplateOption[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Large title, small header, and a clean Apple Music-style overlay.",
    mood: "fresh"
  },
  {
    id: "normal",
    label: "Normal",
    description: "Centered text stack with soft contrast and balanced spacing.",
    mood: "soft"
  },
  {
    id: "classic",
    label: "Classic",
    description: "Bolder contrast with a more nostalgic playlist-cover composition.",
    mood: "timeless"
  }
];

export function isCoverTemplate(value: string): value is CoverTemplate {
  return coverTemplates.some((template) => template.id === value);
}

export function getTemplateOption(template: CoverTemplate) {
  return coverTemplates.find((option) => option.id === template) ?? coverTemplates[0];
}
