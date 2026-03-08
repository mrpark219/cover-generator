import { enUiText } from "./en";
import { koUiText } from "./ko";
import type { Language, LanguageOption, StudioCopy } from "./types";

export type { Language, LanguageOption, StudioCopy } from "./types";

export const languageStorageKey = "cover-generator-language";
export const languageOptions: LanguageOption[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" }
];

export const uiText: Record<Language, StudioCopy> = {
  en: enUiText,
  ko: koUiText
};
