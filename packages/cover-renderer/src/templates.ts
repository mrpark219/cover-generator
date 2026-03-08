import {
  defaultCoverSize,
  escapeXml,
  formatDateVariants,
  hashString,
  resolveTemplate,
  sanitizeText
} from "@cover-generator/shared";
import type { CoverRenderInput, CoverRenderResult } from "@cover-generator/shared";
import { fitTextBlock } from "./text-layout";
import { renderLabel, renderMultilineText } from "./svg";

interface TemplateContext {
  input: Required<Pick<CoverRenderInput, "title" | "date" | "subtitle">> &
    Pick<CoverRenderInput, "image"> & {
      size: number;
      template: CoverRenderResult["template"];
    };
  date: ReturnType<typeof formatDateVariants>;
  ids: {
    photoClip: string;
    matteClip: string;
    shadowFilter: string;
  };
}

function createTemplateContext(rawInput: CoverRenderInput): TemplateContext {
  const template = resolveTemplate(rawInput.template);
  const size = rawInput.size ?? defaultCoverSize;
  const title = sanitizeText(rawInput.title, "Untitled Memory");
  const subtitle = sanitizeText(rawInput.subtitle, "Somewhere");
  const date = formatDateVariants(rawInput.date);
  const seed = hashString(`${template}-${title}-${subtitle}-${date.raw}`);

  return {
    input: {
      image: rawInput.image,
      title,
      date: date.raw,
      subtitle,
      size,
      template
    },
    date,
    ids: {
      photoClip: `photo-${seed}`,
      matteClip: `matte-${seed}`,
      shadowFilter: `shadow-${seed}`
    }
  };
}

function createBaseDefs(context: TemplateContext) {
  const { size } = context.input;
  return `
    <defs>
      <clipPath id="${context.ids.photoClip}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="86" ry="86" />
      </clipPath>
      <clipPath id="${context.ids.matteClip}">
        <rect x="120" y="104" width="${size - 240}" height="1018" rx="56" ry="56" />
      </clipPath>
      <filter id="${context.ids.shadowFilter}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="30" stdDeviation="36" flood-color="rgba(8, 15, 30, 0.25)" />
      </filter>
      <linearGradient id="classicGlow-${context.ids.photoClip}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F7E7C6" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#0D0F17" stop-opacity="0.02" />
      </linearGradient>
      <linearGradient id="classicFade-${context.ids.photoClip}" x1="50%" y1="12%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="#05070B" stop-opacity="0" />
        <stop offset="55%" stop-color="#05070B" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#05070B" stop-opacity="0.92" />
      </linearGradient>
      <linearGradient id="darkTint-${context.ids.photoClip}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#04070D" stop-opacity="0.28" />
        <stop offset="60%" stop-color="#0C1018" stop-opacity="0.68" />
        <stop offset="100%" stop-color="#020306" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="panelStroke-${context.ids.photoClip}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.48)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.08)" />
      </linearGradient>
      <linearGradient id="minimalMatte-${context.ids.photoClip}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8F4EC" />
        <stop offset="100%" stop-color="#EEE5D7" />
      </linearGradient>
    </defs>
  `;
}

function createFullBleedPhoto(context: TemplateContext) {
  const { image, size } = context.input;
  return `
    <g clip-path="url(#${context.ids.photoClip})">
      <image
        href="${escapeXml(image.src)}"
        x="0"
        y="0"
        width="${size}"
        height="${size}"
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
  `;
}

function renderClassicTemplate(context: TemplateContext) {
  const { size, title, subtitle } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 1080,
    maxHeight: 320,
    maxLines: 3,
    maxFontSize: 152,
    minFontSize: 72,
    lineHeight: 0.98,
    letterSpacing: -1.5
  });

  const subtitleBlock = fitTextBlock({
    text: subtitle,
    maxWidth: 680,
    maxHeight: 86,
    maxLines: 2,
    maxFontSize: 40,
    minFontSize: 24,
    lineHeight: 1.16,
    letterSpacing: 0.2
  });

  const panelY = size - 474;
  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="#12151E" />
    ${createFullBleedPhoto(context)}
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="url(#classicGlow-${context.ids.photoClip})" />
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="url(#classicFade-${context.ids.photoClip})" />
    <rect x="38" y="38" width="${size - 76}" height="${size - 76}" rx="64" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
    <rect x="92" y="92" width="244" height="52" rx="26" fill="rgba(249, 241, 228, 0.18)" stroke="rgba(255,255,255,0.16)" />
    ${renderLabel({
      text: "APPLE MUSIC MEMORY",
      x: 214,
      y: 125,
      fill: "#F6F2EA",
      fontSize: 17,
      anchor: "middle",
      letterSpacing: 4.8,
      opacity: 0.94,
      fontWeight: 600
    })}
    <rect x="92" y="${panelY}" width="${size - 184}" height="314" rx="42" fill="rgba(8,12,18,0.34)" stroke="rgba(255,255,255,0.12)" />
    ${renderMultilineText({
      block: titleBlock,
      x: 126,
      y: panelY + 40,
      fill: "#FFF9F0",
      fontWeight: 700,
      letterSpacing: -1.5
    })}
    ${renderMultilineText({
      block: subtitleBlock,
      x: 126,
      y: panelY + 200 + titleBlock.height,
      fill: "rgba(255,249,240,0.82)",
      fontWeight: 500,
      letterSpacing: 0.2
    })}
    ${renderLabel({
      text: context.date.long,
      x: size - 126,
      y: size - 126,
      fill: "#FFF9F0",
      fontSize: 25,
      anchor: "end",
      letterSpacing: 2.2,
      opacity: 0.88,
      fontWeight: 500
    })}
  `;
}

function renderMinimalTemplate(context: TemplateContext) {
  const { size, title, subtitle } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 1100,
    maxHeight: 220,
    maxLines: 2,
    maxFontSize: 108,
    minFontSize: 56,
    lineHeight: 1.02,
    letterSpacing: -1.4
  });

  const subtitleBlock = fitTextBlock({
    text: subtitle,
    maxWidth: 640,
    maxHeight: 70,
    maxLines: 1,
    maxFontSize: 30,
    minFontSize: 20,
    lineHeight: 1.12,
    letterSpacing: 2
  });

  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="url(#minimalMatte-${context.ids.photoClip})" />
    <rect x="44" y="44" width="${size - 88}" height="${size - 88}" rx="66" fill="none" stroke="rgba(17, 17, 17, 0.08)" stroke-width="2" />
    <g clip-path="url(#${context.ids.matteClip})" filter="url(#${context.ids.shadowFilter})">
      <image
        href="${escapeXml(context.input.image.src)}"
        x="120"
        y="104"
        width="${size - 240}"
        height="1018"
        preserveAspectRatio="xMidYMid slice"
      />
      <rect x="120" y="104" width="${size - 240}" height="1018" rx="56" fill="rgba(255,255,255,0.04)" />
    </g>
    <rect x="120" y="104" width="${size - 240}" height="1018" rx="56" fill="none" stroke="rgba(17,17,17,0.08)" stroke-width="2" />
    ${renderLabel({
      text: context.date.monthYear,
      x: size / 2,
      y: 1320,
      fill: "#6C5E4D",
      fontSize: 22,
      anchor: "middle",
      letterSpacing: 8,
      opacity: 0.9,
      fontWeight: 600
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: size / 2,
      y: 1356,
      fill: "#181613",
      fontWeight: 700,
      anchor: "middle",
      letterSpacing: -1.4
    })}
    ${renderMultilineText({
      block: subtitleBlock,
      x: size / 2,
      y: 1468 + titleBlock.height,
      fill: "#7A6B59",
      fontWeight: 500,
      anchor: "middle",
      letterSpacing: 2
    })}
    <line x1="216" y1="1518" x2="654" y2="1518" stroke="rgba(24,22,19,0.16)" />
    <line x1="946" y1="1518" x2="1384" y2="1518" stroke="rgba(24,22,19,0.16)" />
    ${renderLabel({
      text: context.date.compact,
      x: size / 2,
      y: 1530,
      fill: "#4C4034",
      fontSize: 24,
      anchor: "middle",
      letterSpacing: 3.2,
      opacity: 0.92,
      fontWeight: 500
    })}
  `;
}

function renderDarkTemplate(context: TemplateContext) {
  const { size, title, subtitle } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 950,
    maxHeight: 280,
    maxLines: 3,
    maxFontSize: 136,
    minFontSize: 66,
    lineHeight: 0.98,
    letterSpacing: -1.6
  });

  const subtitleBlock = fitTextBlock({
    text: subtitle,
    maxWidth: 560,
    maxHeight: 80,
    maxLines: 2,
    maxFontSize: 36,
    minFontSize: 22,
    lineHeight: 1.14,
    letterSpacing: 0.6
  });

  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="#080B11" />
    ${createFullBleedPhoto(context)}
    <rect x="0" y="0" width="${size}" height="${size}" rx="86" fill="url(#darkTint-${context.ids.photoClip})" />
    <rect x="72" y="72" width="${size - 144}" height="${size - 144}" rx="58" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
    <text
      x="122"
      y="330"
      fill="rgba(255,255,255,0.08)"
      font-family="'SF Pro Display', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
      font-size="184"
      font-weight="700"
      letter-spacing="-10"
    >${escapeXml(context.date.numeric)}</text>
    <rect x="92" y="1064" width="${size - 184}" height="360" rx="48" fill="rgba(6,9,15,0.42)" stroke="url(#panelStroke-${context.ids.photoClip})" />
    <rect x="118" y="1100" width="314" height="54" rx="27" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" />
    ${renderLabel({
      text: context.date.weekday,
      x: 275,
      y: 1134,
      fill: "#EFF3F8",
      fontSize: 18,
      anchor: "middle",
      letterSpacing: 4.6,
      opacity: 0.92
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: 118,
      y: 1168,
      fill: "#F8FBFF",
      fontWeight: 700,
      letterSpacing: -1.6
    })}
    ${renderMultilineText({
      block: subtitleBlock,
      x: 118,
      y: 1248 + titleBlock.height,
      fill: "rgba(248,251,255,0.82)",
      fontWeight: 500,
      letterSpacing: 0.6
    })}
    ${renderLabel({
      text: context.date.long,
      x: size - 118,
      y: 1358,
      fill: "#F8FBFF",
      fontSize: 24,
      anchor: "end",
      letterSpacing: 2.4,
      opacity: 0.88,
      fontWeight: 500
    })}
  `;
}

function renderTemplate(context: TemplateContext) {
  switch (context.input.template) {
    case "minimal":
      return renderMinimalTemplate(context);
    case "dark":
      return renderDarkTemplate(context);
    case "classic":
    default:
      return renderClassicTemplate(context);
  }
}

export function renderCoverSvg(input: CoverRenderInput): CoverRenderResult {
  const context = createTemplateContext(input);
  const { size, template } = context.input;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
      ${createBaseDefs(context)}
      ${renderTemplate(context)}
    </svg>
  `.trim();

  return {
    svg,
    width: size,
    height: size,
    template
  };
}

