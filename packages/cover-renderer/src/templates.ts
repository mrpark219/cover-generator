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
      shadow: boolean;
      blur: boolean;
    };
  date: ReturnType<typeof formatDateVariants>;
  ids: {
    photoClip: string;
    blurFilter: string;
    softBlurFilter: string;
    textShadowFilter: string;
  };
}

function createTemplateContext(rawInput: CoverRenderInput): TemplateContext {
  const template = resolveTemplate(rawInput.template);
  const size = rawInput.size ?? defaultCoverSize;
  const title = sanitizeText(rawInput.title, "Untitled Memory");
  const subtitle = sanitizeText(rawInput.subtitle, "Somewhere");
  const date = formatDateVariants(rawInput.date);
  const seed = hashString(
    `${template}-${title}-${subtitle}-${date.raw}-${String(rawInput.blur)}-${String(rawInput.shadow)}`
  );

  return {
    input: {
      image: rawInput.image,
      title,
      date: date.raw,
      subtitle,
      size,
      template,
      shadow: Boolean(rawInput.shadow),
      blur: Boolean(rawInput.blur)
    },
    date,
    ids: {
      photoClip: `photo-${seed}`,
      blurFilter: `blur-${seed}`,
      softBlurFilter: `soft-blur-${seed}`,
      textShadowFilter: `text-shadow-${seed}`
    }
  };
}

function createBaseDefs(context: TemplateContext) {
  const { size } = context.input;
  const radius = 88;

  return `
    <defs>
      <clipPath id="${context.ids.photoClip}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" />
      </clipPath>
      <filter id="${context.ids.blurFilter}">
        <feGaussianBlur stdDeviation="34" />
      </filter>
      <filter id="${context.ids.softBlurFilter}">
        <feGaussianBlur stdDeviation="12" />
      </filter>
      <filter id="${context.ids.textShadowFilter}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="rgba(0,0,0,0.42)" />
      </filter>
      <linearGradient id="coverx-vignette-${context.ids.photoClip}" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.08)" />
        <stop offset="46%" stop-color="rgba(0,0,0,0.12)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.68)" />
      </linearGradient>
      <linearGradient id="coverx-soft-vignette-${context.ids.photoClip}" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgba(12,12,14,0.08)" />
        <stop offset="65%" stop-color="rgba(12,12,14,0.18)" />
        <stop offset="100%" stop-color="rgba(12,12,14,0.52)" />
      </linearGradient>
      <linearGradient id="coverx-classic-vignette-${context.ids.photoClip}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(8,8,10,0.12)" />
        <stop offset="45%" stop-color="rgba(8,8,10,0.18)" />
        <stop offset="100%" stop-color="rgba(8,8,10,0.74)" />
      </linearGradient>
      <linearGradient id="coverx-bottom-panel-${context.ids.photoClip}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(22,22,24,0.08)" />
        <stop offset="100%" stop-color="rgba(22,22,24,0.36)" />
      </linearGradient>
    </defs>
  `;
}

function textFilter(context: TemplateContext) {
  return context.input.shadow ? `url(#${context.ids.textShadowFilter})` : undefined;
}

function renderPhotoLayers(context: TemplateContext, opacity = 1) {
  const { image, size, blur } = context.input;

  return `
    <g clip-path="url(#${context.ids.photoClip})">
      ${
        blur
          ? `
            <image
              href="${escapeXml(image.src)}"
              x="-48"
              y="-48"
              width="${size + 96}"
              height="${size + 96}"
              preserveAspectRatio="xMidYMid slice"
              filter="url(#${context.ids.blurFilter})"
              opacity="0.92"
            />
            <image
              href="${escapeXml(image.src)}"
              x="0"
              y="0"
              width="${size}"
              height="${size}"
              preserveAspectRatio="xMidYMid slice"
              opacity="0.58"
            />
          `
          : `
            <image
              href="${escapeXml(image.src)}"
              x="0"
              y="0"
              width="${size}"
              height="${size}"
              preserveAspectRatio="xMidYMid slice"
              opacity="${opacity}"
            />
          `
      }
    </g>
  `;
}

function renderMetaLine({
  context,
  x,
  y,
  anchor = "start",
  fill = "rgba(255,255,255,0.84)",
  opacity = 1
}: {
  context: TemplateContext;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  fill?: string;
  opacity?: number;
}) {
  return renderLabel({
    text: `${context.input.subtitle.toUpperCase()}  ·  ${context.date.long}`,
    x,
    y,
    fill,
    opacity,
    anchor,
    fontSize: 24,
    fontWeight: 500,
    letterSpacing: 1.2,
    filter: textFilter(context)
  });
}

function renderModernTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 1160,
    maxHeight: 320,
    maxLines: 3,
    maxFontSize: 152,
    minFontSize: 72,
    lineHeight: 0.94,
    letterSpacing: -1.7
  });

  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="#121315" />
    ${renderPhotoLayers(context)}
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="url(#coverx-vignette-${context.ids.photoClip})" />
    <rect x="52" y="52" width="${size - 104}" height="${size - 104}" rx="68" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
    ${renderLabel({
      text: "APPLE MUSIC",
      x: 92,
      y: 122,
      fill: "#FFFFFF",
      opacity: 0.92,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: 6,
      filter: textFilter(context)
    })}
    ${renderLabel({
      text: context.date.compact,
      x: 92,
      y: 166,
      fill: "rgba(255,255,255,0.74)",
      fontSize: 26,
      fontWeight: 500,
      letterSpacing: 1.4,
      filter: textFilter(context)
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: 92,
      y: 1064,
      fill: "#FFFFFF",
      fontWeight: 700,
      letterSpacing: -1.7,
      filter: textFilter(context)
    })}
    ${renderMetaLine({
      context,
      x: 92,
      y: 1132 + titleBlock.height
    })}
    ${renderLabel({
      text: context.date.year,
      x: size - 92,
      y: size - 92,
      fill: "rgba(255,255,255,0.88)",
      anchor: "end",
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: 2.8,
      filter: textFilter(context)
    })}
  `;
}

function renderNormalTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 1120,
    maxHeight: 270,
    maxLines: 3,
    maxFontSize: 128,
    minFontSize: 64,
    lineHeight: 0.98,
    letterSpacing: -1.4
  });

  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="#16181C" />
    ${renderPhotoLayers(context, 0.94)}
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="url(#coverx-soft-vignette-${context.ids.photoClip})" />
    <rect x="58" y="58" width="${size - 116}" height="${size - 116}" rx="70" fill="none" stroke="rgba(255,255,255,0.11)" stroke-width="3" />
    <rect x="196" y="134" width="${size - 392}" height="60" rx="30" fill="rgba(255,255,255,0.14)" />
    ${renderLabel({
      text: `${context.date.monthShort} ${context.date.day}  ·  ${context.date.year}`,
      x: size / 2,
      y: 172,
      fill: "#FFFFFF",
      anchor: "middle",
      fontSize: 23,
      fontWeight: 600,
      letterSpacing: 4,
      filter: textFilter(context)
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: size / 2,
      y: 980,
      fill: "#FFFFFF",
      anchor: "middle",
      fontWeight: 700,
      letterSpacing: -1.4,
      filter: textFilter(context)
    })}
    ${renderLabel({
      text: context.input.subtitle.toUpperCase(),
      x: size / 2,
      y: 1072 + titleBlock.height,
      fill: "rgba(255,255,255,0.82)",
      anchor: "middle",
      fontSize: 28,
      fontWeight: 500,
      letterSpacing: 4.4,
      filter: textFilter(context)
    })}
    ${renderLabel({
      text: context.date.long,
      x: size / 2,
      y: 1132 + titleBlock.height,
      fill: "rgba(255,255,255,0.72)",
      anchor: "middle",
      fontSize: 24,
      fontWeight: 500,
      letterSpacing: 1.2,
      filter: textFilter(context)
    })}
    ${renderLabel({
      text: "SELF UPLOAD",
      x: size / 2,
      y: size - 92,
      fill: "rgba(255,255,255,0.84)",
      anchor: "middle",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: 6,
      filter: textFilter(context)
    })}
  `;
}

function renderClassicTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 980,
    maxHeight: 280,
    maxLines: 3,
    maxFontSize: 138,
    minFontSize: 68,
    lineHeight: 0.95,
    letterSpacing: -1.6
  });

  return `
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="#0F1012" />
    ${renderPhotoLayers(context)}
    <rect x="0" y="0" width="${size}" height="${size}" rx="88" fill="url(#coverx-classic-vignette-${context.ids.photoClip})" />
    <rect x="50" y="50" width="${size - 100}" height="${size - 100}" rx="66" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
    <text
      x="88"
      y="326"
      fill="rgba(255,255,255,0.16)"
      font-family="'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="248"
      font-weight="700"
      letter-spacing="-10"
    >${escapeXml(context.date.day)}</text>
    <rect x="72" y="1042" width="${size - 144}" height="360" rx="46" fill="url(#coverx-bottom-panel-${context.ids.photoClip})" filter="url(#${context.ids.softBlurFilter})" />
    <rect x="72" y="1042" width="${size - 144}" height="360" rx="46" fill="rgba(12,12,14,0.18)" stroke="rgba(255,255,255,0.12)" />
    ${renderLabel({
      text: `${context.date.monthShort} ${context.date.year}`,
      x: 108,
      y: 1098,
      fill: "rgba(255,255,255,0.88)",
      fontSize: 25,
      fontWeight: 600,
      letterSpacing: 4.6,
      filter: textFilter(context)
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: 108,
      y: 1124,
      fill: "#FFFFFF",
      fontWeight: 700,
      letterSpacing: -1.6,
      filter: textFilter(context)
    })}
    ${renderMetaLine({
      context,
      x: 108,
      y: 1208 + titleBlock.height
    })}
    ${renderLabel({
      text: "APPLE MUSIC",
      x: size - 108,
      y: 1098,
      fill: "rgba(255,255,255,0.88)",
      anchor: "end",
      fontSize: 21,
      fontWeight: 600,
      letterSpacing: 5.6,
      filter: textFilter(context)
    })}
  `;
}

function renderTemplate(context: TemplateContext) {
  switch (context.input.template) {
    case "normal":
      return renderNormalTemplate(context);
    case "classic":
      return renderClassicTemplate(context);
    case "modern":
    default:
      return renderModernTemplate(context);
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
