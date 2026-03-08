import type { CoverTemplate, CoverTemplateOption } from "./types";

export const defaultTemplate: CoverTemplate = "modern";

export const coverTemplates: CoverTemplateOption[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Left-aligned hero title with the cleaner Apple Music auto-cover feel.",
    mood: "fresh"
  },
  {
    id: "normal",
    label: "Normal",
    description: "Centered stack with softer hierarchy and calmer spacing.",
    mood: "soft"
  },
  {
    id: "classic",
    label: "Classic",
    description: "Higher contrast with a more editorial top-label treatment.",
    mood: "timeless"
  }
];

export function isCoverTemplate(value: string): value is CoverTemplate {
  return coverTemplates.some((template) => template.id === value);
}

export function getTemplateOption(template: CoverTemplate) {
  return coverTemplates.find((option) => option.id === template) ?? coverTemplates[0];
}
