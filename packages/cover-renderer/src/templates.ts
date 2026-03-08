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

const displayFont =
  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const serifFont = "Georgia, 'Times New Roman', serif";

interface TemplateContext {
  input: Required<Pick<CoverRenderInput, "header" | "title" | "subtitle" | "footer">> &
    Pick<CoverRenderInput, "image"> & {
      date: string;
      size: number;
      template: CoverRenderResult["template"];
      shadow: boolean;
      blur: boolean;
    };
  date: ReturnType<typeof formatDateVariants> | null;
  ids: {
    blurFilter: string;
    textShadowFilter: string;
    topFade: string;
    bottomFade: string;
    bottomHeavyFade: string;
    centerShade: string;
    sideShade: string;
  };
}

function createTemplateContext(rawInput: CoverRenderInput): TemplateContext {
  const template = resolveTemplate(rawInput.template);
  const size = rawInput.size ?? defaultCoverSize;
  const header = sanitizeText(rawInput.header ?? "", "APPLE MUSIC");
  const title = sanitizeText(rawInput.title, "Untitled Memory");
  const subtitle = sanitizeText(rawInput.subtitle, "");
  const footer = sanitizeText(rawInput.footer ?? "", "");
  const rawDate = sanitizeText(rawInput.date, "");
  const date = rawDate ? formatDateVariants(rawDate) : null;
  const seed = hashString(
    `${template}-${header}-${title}-${subtitle}-${footer}-${rawDate}-${String(rawInput.blur)}-${String(rawInput.shadow)}`
  );

  return {
    input: {
      image: rawInput.image,
      header,
      title,
      subtitle,
      footer,
      date: rawDate,
      size,
      template,
      shadow: Boolean(rawInput.shadow),
      blur: Boolean(rawInput.blur)
    },
    date,
    ids: {
      blurFilter: `blur-${seed}`,
      textShadowFilter: `text-shadow-${seed}`,
      topFade: `top-fade-${seed}`,
      bottomFade: `bottom-fade-${seed}`,
      bottomHeavyFade: `bottom-heavy-fade-${seed}`,
      centerShade: `center-shade-${seed}`,
      sideShade: `side-shade-${seed}`
    }
  };
}

function createBaseDefs(context: TemplateContext) {
  return `
    <defs>
      <filter id="${context.ids.blurFilter}" x="-12%" y="-12%" width="124%" height="124%">
        <feGaussianBlur stdDeviation="36" />
      </filter>
      <filter id="${context.ids.textShadowFilter}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="rgba(0,0,0,0.44)" />
      </filter>
      <linearGradient id="${context.ids.topFade}" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.18)" />
        <stop offset="34%" stop-color="rgba(0,0,0,0.04)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0)" />
      </linearGradient>
      <linearGradient id="${context.ids.bottomFade}" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="66%" stop-color="rgba(0,0,0,0.04)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.28)" />
      </linearGradient>
      <linearGradient id="${context.ids.bottomHeavyFade}" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="54%" stop-color="rgba(0,0,0,0.08)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.42)" />
      </linearGradient>
      <radialGradient id="${context.ids.centerShade}" cx="50%" cy="62%" r="72%">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="72%" stop-color="rgba(0,0,0,0.04)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.12)" />
      </radialGradient>
      <linearGradient id="${context.ids.sideShade}" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.12)" />
        <stop offset="24%" stop-color="rgba(0,0,0,0.02)" />
        <stop offset="76%" stop-color="rgba(0,0,0,0.02)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.1)" />
      </linearGradient>
    </defs>
  `;
}

function textFilter(context: TemplateContext) {
  return context.input.shadow ? `url(#${context.ids.textShadowFilter})` : undefined;
}

function renderPhotoLayers(context: TemplateContext, foregroundOpacity = 1) {
  const { image, size, blur } = context.input;

  if (!blur) {
    return `
      <image
        href="${escapeXml(image.src)}"
        x="0"
        y="0"
        width="${size}"
        height="${size}"
        preserveAspectRatio="xMidYMid slice"
        opacity="${foregroundOpacity}"
      />
    `;
  }

  return `
    <image
      href="${escapeXml(image.src)}"
      x="-72"
      y="-72"
      width="${size + 144}"
      height="${size + 144}"
      preserveAspectRatio="xMidYMid slice"
      filter="url(#${context.ids.blurFilter})"
      opacity="0.9"
    />
    <image
      href="${escapeXml(image.src)}"
      x="0"
      y="0"
      width="${size}"
      height="${size}"
      preserveAspectRatio="xMidYMid slice"
      opacity="0.72"
    />
  `;
}

function renderMetaLine({
  context,
  x,
  y,
  anchor = "start",
  fill = "rgba(255,255,255,0.82)"
}: {
  context: TemplateContext;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  fill?: string;
}) {
  const parts = [context.input.subtitle, context.date?.compact].filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  return renderLabel({
    text: parts.join("  ·  "),
    x,
    y,
    fill,
    anchor,
    fontSize: 29,
    fontWeight: 500,
    letterSpacing: 0.4,
    filter: textFilter(context)
  });
}

function renderHeader(context: TemplateContext, x: number, y: number, anchor: "start" | "middle" | "end" = "start") {
  if (!context.input.header) {
    return "";
  }

  return renderLabel({
    text: context.input.header,
    x,
    y,
    fill: "rgba(255,255,255,0.9)",
    anchor,
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 2.2,
    filter: textFilter(context)
  });
}

function renderFooter(context: TemplateContext, x: number, y: number, anchor: "start" | "middle" | "end" = "start") {
  if (!context.input.footer) {
    return "";
  }

  return renderLabel({
    text: context.input.footer,
    x,
    y,
    fill: "rgba(255,255,255,0.88)",
    anchor,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: 2.6,
    filter: textFilter(context)
  });
}

function renderModernTemplate(context: TemplateContext) {
  const { size, title, subtitle } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: size - 132,
    maxHeight: 420,
    maxLines: 3,
    maxFontSize: 136,
    minFontSize: 70,
    lineHeight: 0.9,
    letterSpacing: -1.8
  });
  const titleTop = 132;
  const subtitleY = titleTop + titleBlock.height + 56;
  const footerY = size - 66;
  const dateText = context.date?.compact ?? context.input.date;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#0D0D0F" />
    ${renderPhotoLayers(context)}
    <rect x="0" y="0" width="${size}" height="${size}" fill="rgba(0,0,0,0.03)" />
    <rect x="0" y="0" width="${size}" height="320" fill="url(#${context.ids.topFade})" />
    ${renderHeader(context, 48, 64)}
    ${renderMultilineText({
      block: titleBlock,
      x: 48,
      y: titleTop,
      fill: "#FFFFFF",
      fontWeight: 700,
      letterSpacing: -1.8,
      fontFamily: displayFont,
      filter: textFilter(context)
    })}
    ${
      subtitle
        ? renderLabel({
            text: subtitle,
            x: 48,
            y: subtitleY,
            fill: "rgba(255,255,255,0.92)",
            fontSize: 58,
            fontWeight: 400,
            letterSpacing: -0.2,
            fontFamily: displayFont,
            filter: textFilter(context)
          })
        : ""
    }
    ${renderFooter(context, 48, footerY)}
    ${
      dateText
        ? renderLabel({
            text: dateText,
            x: size - 48,
            y: footerY,
            fill: "rgba(255,255,255,0.72)",
            anchor: "end",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 0.4,
            fontFamily: displayFont,
            filter: textFilter(context)
          })
        : ""
    }
  `;
}

function renderNormalTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: size - 220,
    maxHeight: 320,
    maxLines: 3,
    maxFontSize: 136,
    minFontSize: 64,
    lineHeight: 0.95,
    letterSpacing: -1.2
  });
  const titleTop = size * 0.44 - titleBlock.height / 2;
  const subtitleY = titleTop + titleBlock.height + 60;
  const dateY = subtitleY + 48;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#111214" />
    ${renderPhotoLayers(context, 0.94)}
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${context.ids.centerShade})" />
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${context.ids.topFade})" />
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${context.ids.bottomHeavyFade})" />
    ${renderHeader(context, size / 2, 92, "middle")}
    ${renderMultilineText({
      block: titleBlock,
      x: size / 2,
      y: titleTop,
      fill: "#FFFFFF",
      anchor: "middle",
      fontWeight: 700,
      letterSpacing: -1.2,
      fontFamily: serifFont,
      filter: textFilter(context)
    })}
    ${
      context.input.subtitle
        ? renderLabel({
            text: context.input.subtitle,
            x: size / 2,
            y: subtitleY,
            fill: "rgba(255,255,255,0.86)",
            anchor: "middle",
            fontSize: 31,
            fontWeight: 500,
            letterSpacing: 0.6,
            filter: textFilter(context)
          })
        : ""
    }
    ${
      context.date
        ? renderLabel({
            text: context.date.long,
            x: size / 2,
            y: context.input.subtitle ? dateY : subtitleY,
            fill: "rgba(255,255,255,0.72)",
            anchor: "middle",
            fontSize: 25,
            fontWeight: 500,
            letterSpacing: 0.4,
            filter: textFilter(context)
          })
        : ""
    }
    ${renderFooter(context, size / 2, size - 76, "middle")}
  `;
}

function renderClassicTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: 980,
    maxHeight: 320,
    maxLines: 3,
    maxFontSize: 142,
    minFontSize: 68,
    lineHeight: 0.93,
    letterSpacing: -1.8
  });
  const titleTop = size - 368 - titleBlock.height;
  const metaY = titleTop + titleBlock.height + 52;
  const dateLabel = context.date?.numeric ?? context.input.date;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#0B0B0D" />
    ${renderPhotoLayers(context)}
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${context.ids.sideShade})" />
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${context.ids.bottomHeavyFade})" />
    ${renderHeader(context, 72, 84)}
    ${renderFooter(context, size - 72, 84, "end")}
    <line x1="72" y1="${size - 430}" x2="${size - 72}" y2="${size - 430}" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
    ${renderMultilineText({
      block: titleBlock,
      x: 72,
      y: titleTop,
      fill: "#FFFFFF",
      fontWeight: 700,
      letterSpacing: -1.8,
      fontFamily: displayFont,
      filter: textFilter(context)
    })}
    ${renderMetaLine({
      context,
      x: 72,
      y: metaY
    })}
    ${
      dateLabel
        ? renderLabel({
            text: dateLabel,
            x: size - 72,
            y: size - 72,
            fill: "rgba(255,255,255,0.84)",
            anchor: "end",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 0.6,
            filter: textFilter(context)
          })
        : ""
    }
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
