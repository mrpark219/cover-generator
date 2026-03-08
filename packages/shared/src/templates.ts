import type { CoverTemplateOption, CoverTemplate } from "./types";

export const defaultTemplate: CoverTemplate = "classic";

export const coverTemplates: CoverTemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Full-bleed photography with cinematic bottom typography.",
    mood: "warm"
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Editorial matte layout with centered title and quiet spacing.",
    mood: "calm"
  },
  {
    id: "dark",
    label: "Dark",
    description: "Moody glass-card composition with deeper contrast.",
    mood: "night"
  }
];

export function isCoverTemplate(value: string): value is CoverTemplate {
  return coverTemplates.some((template) => template.id === value);
}

export function getTemplateOption(template: CoverTemplate) {
  return coverTemplates.find((option) => option.id === template) ?? coverTemplates[0];
}

