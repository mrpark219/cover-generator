import { defaultTemplate, isCoverTemplate } from "./templates";
import type { CoverTemplate, DateDisplayVariants } from "./types";

export const defaultCoverSize = 1600;
export const defaultTextColor = "#FFFFFF";
export const coverSizeOptions = [1200, 1600, 2048] as const;
export const supportedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif"
]);

export function isSupportedCoverSize(value: number) {
  return coverSizeOptions.includes(value as (typeof coverSizeOptions)[number]);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sanitizeText(value: string, fallback = "") {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

export function normalizeHexColor(value?: string, fallback = defaultTextColor) {
  const candidate = (value ?? "").trim();
  const hex = candidate.startsWith("#") ? candidate.slice(1) : candidate;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const expanded = hex
      .split("")
      .map((part) => `${part}${part}`)
      .join("")
      .toUpperCase();
    return `#${expanded}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toUpperCase()}`;
  }

  return fallback;
}

export function hexColorToRgba(value: string, alpha = 1) {
  const normalized = normalizeHexColor(value);
  const hex = normalized.slice(1);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}

function parseDateInput(dateInput: string) {
  const trimmed = dateInput.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const candidate = new Date(trimmed);
  return Number.isNaN(candidate.valueOf()) ? null : candidate;
}

export function formatDateVariants(dateInput: string): DateDisplayVariants {
  const raw = sanitizeText(dateInput, "DATE");
  const parsed = parseDateInput(raw);

  if (!parsed) {
    return {
      weekday: "DATE",
      long: raw.toUpperCase(),
      compact: raw.toUpperCase(),
      numeric: raw.toUpperCase(),
      monthYear: raw.toUpperCase(),
      monthShort: raw.toUpperCase(),
      day: "00",
      year: "0000",
      raw
    };
  }

  const formatter = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: "UTC"
    })
      .format(parsed)
      .toUpperCase();

  return {
    weekday: formatter({ weekday: "long" }),
    long: formatter({ month: "long", day: "numeric", year: "numeric" }),
    compact: formatter({ month: "short", day: "numeric", year: "numeric" }),
    numeric: formatter({ month: "2-digit", day: "2-digit", year: "numeric" }).replace(
      /\//g,
      " · "
    ),
    monthYear: formatter({ month: "long", year: "numeric" }),
    monthShort: formatter({ month: "short" }),
    day: formatter({ day: "2-digit" }),
    year: formatter({ year: "numeric" }),
    raw
  };
}

export function resolveTemplate(template?: string): CoverTemplate {
  return template && isCoverTemplate(template) ? template : defaultTemplate;
}

export function slugifyFilePart(value: string) {
  return sanitizeText(value, "cover")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildOutputFileName(
  title: string,
  date: string,
  template: CoverTemplate = defaultTemplate
) {
  const titlePart = slugifyFilePart(title);
  const datePart = slugifyFilePart(date);
  return `${titlePart || "cover"}-${datePart || "date"}-${template}.png`;
}

export function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
