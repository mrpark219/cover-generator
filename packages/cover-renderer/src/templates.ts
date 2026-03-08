import {
  defaultCoverSize,
  escapeXml,
  hashString,
  resolveTemplate,
  sanitizeText
} from "@cover-generator/shared";
import type { CoverRenderInput, CoverRenderResult } from "@cover-generator/shared";
import { fitTextBlock, type FittedTextBlock } from "./text-layout";
import { renderMultilineText } from "./svg";

const displayFont =
  "'SFUIDisplay', 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const textFont =
  "'SFUIText', 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const serifFont =
  "'NewYorkMedium', 'New York', Georgia, 'Times New Roman', serif";
const serifSmallFont =
  "'NewYorkSmall', 'New York', Georgia, 'Times New Roman', serif";

interface TemplateContext {
  input: Required<Pick<CoverRenderInput, "header" | "title" | "subtitle" | "footer">> &
    Pick<CoverRenderInput, "image"> & {
      date: string;
      size: number;
      template: CoverRenderResult["template"];
      shadow: boolean;
      blur: boolean;
    };
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
  const blurStdDeviation = scaleDesign(context, 10);
  const shadowBlur = scaleDesign(context, 18);

  return `
    <defs>
      <filter id="${context.ids.blurFilter}" x="-12%" y="-12%" width="124%" height="124%">
        <feGaussianBlur stdDeviation="${blurStdDeviation}" />
      </filter>
      <filter id="${context.ids.textShadowFilter}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="${shadowBlur}" flood-color="rgba(0,0,0,0.75)" />
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
      x="0"
      y="0"
      width="${size}"
      height="${size}"
      preserveAspectRatio="xMidYMid slice"
      filter="url(#${context.ids.blurFilter})"
      opacity="${foregroundOpacity}"
    />
  `;
}

function scaleDesign(context: TemplateContext, value: number) {
  return (context.input.size / 600) * value;
}

function fitSingleLineBlock({
  text,
  maxWidth,
  maxFontSize,
  minFontSize
}: {
  text: string;
  maxWidth: number;
  maxFontSize: number;
  minFontSize: number;
}) {
  return fitTextBlock({
    text,
    maxWidth,
    maxHeight: maxFontSize * 1.2,
    maxLines: 1,
    maxFontSize,
    minFontSize,
    lineHeight: 1,
    letterSpacing: 0
  });
}

function renderFittedBlock({
  block,
  x,
  baselineY,
  fill,
  anchor = "start",
  fontWeight = 600,
  fontFamily = displayFont,
  opacity = 1,
  context
}: {
  block: FittedTextBlock;
  x: number;
  baselineY: number;
  fill: string;
  anchor?: "start" | "middle" | "end";
  fontWeight?: number;
  fontFamily?: string;
  opacity?: number;
  context: TemplateContext;
}) {
  return renderMultilineText({
    block,
    x,
    y: baselineY - block.fontSize,
    fill,
    opacity,
    anchor,
    fontWeight,
    fontFamily,
    letterSpacing: 0,
    filter: textFilter(context)
  });
}

function renderModernTemplate(context: TemplateContext) {
  const { size, title, subtitle } = context.input;
  const margin = scaleDesign(context, 60);
  const headerBaseline = scaleDesign(context, 91);
  const titleBaseline = scaleDesign(context, 207);
  const subtitleBaseline = scaleDesign(context, 290);
  const footerBaseline = scaleDesign(context, 530);
  const contentWidth = size - margin * 2;
  const headerBlock = fitSingleLineBlock({
    text: context.input.header,
    maxWidth: contentWidth,
    maxFontSize: scaleDesign(context, 40),
    minFontSize: scaleDesign(context, 20)
  });
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: contentWidth,
    maxHeight: size * 0.4,
    maxLines: 3,
    maxFontSize: scaleDesign(context, 90),
    minFontSize: scaleDesign(context, 38),
    lineHeight: 0.88,
    letterSpacing: 0
  });
  const titleTop = titleBaseline - titleBlock.fontSize;
  const subtitleBlock = subtitle
    ? fitTextBlock({
        text: subtitle,
        maxWidth: contentWidth,
        maxHeight: size * 0.24,
        maxLines: 2,
        maxFontSize: scaleDesign(context, 90),
        minFontSize: scaleDesign(context, 28),
        lineHeight: 0.86,
        letterSpacing: 0
      })
    : null;
  const subtitleTop = subtitleBlock
    ? Math.max(
        titleTop + titleBlock.height,
        subtitleBaseline - subtitleBlock.fontSize
      )
    : 0;
  const footerBlock = context.input.footer
    ? fitSingleLineBlock({
        text: context.input.footer,
        maxWidth: size * 0.5,
        maxFontSize: scaleDesign(context, 30),
        minFontSize: scaleDesign(context, 16)
      })
    : null;
  const dateBlock = context.input.date
    ? fitSingleLineBlock({
        text: context.input.date,
        maxWidth: size * 0.42,
        maxFontSize: scaleDesign(context, 24),
        minFontSize: scaleDesign(context, 14)
      })
    : null;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#0D0D0F" />
    ${renderPhotoLayers(context)}
    ${renderFittedBlock({
      block: headerBlock,
      x: margin,
      baselineY: headerBaseline,
      fill: "#FFFFFF",
      fontWeight: 600,
      fontFamily: textFont,
      context
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: margin,
      y: titleTop,
      fill: "#FFFFFF",
      fontWeight: 700,
      letterSpacing: 0,
      fontFamily: displayFont,
      filter: textFilter(context)
    })}
    ${
      subtitleBlock
        ? renderMultilineText({
            block: subtitleBlock,
            x: margin,
            y: subtitleTop,
            fill: "#FFFFFF",
            fontWeight: 200,
            letterSpacing: 0,
            fontFamily: displayFont,
            filter: textFilter(context)
          })
        : ""
    }
    ${
      footerBlock
        ? renderFittedBlock({
            block: footerBlock,
            x: margin,
            baselineY: footerBaseline,
            fill: "rgba(255,255,255,0.49)",
            fontWeight: 600,
            fontFamily: textFont,
            context
          })
        : ""
    }
    ${
      dateBlock
        ? renderFittedBlock({
            block: dateBlock,
            x: size - margin,
            baselineY: footerBaseline,
            fill: "rgba(255,255,255,0.42)",
            anchor: "end",
            fontWeight: 500,
            fontFamily: textFont,
            context
          })
        : ""
    }
  `;
}

function renderNormalTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const headerInset = scaleDesign(context, 20);
  const headerBaseline = scaleDesign(context, 50);
  const titleBaseline = scaleDesign(context, 310);
  const footerBaseline = scaleDesign(context, 500);
  const headerBlock = fitSingleLineBlock({
    text: context.input.header,
    maxWidth: size * 0.45,
    maxFontSize: scaleDesign(context, 35),
    minFontSize: scaleDesign(context, 18)
  });
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: size - scaleDesign(context, 72),
    maxHeight: size * 0.34,
    maxLines: 3,
    maxFontSize: scaleDesign(context, 120),
    minFontSize: scaleDesign(context, 44),
    lineHeight: 0.88,
    letterSpacing: 0
  });
  const titleTop = titleBaseline - titleBlock.fontSize;
  const subtitleBlock = context.input.subtitle
    ? fitTextBlock({
        text: context.input.subtitle,
        maxWidth: size - scaleDesign(context, 96),
        maxHeight: size * 0.2,
        maxLines: 2,
        maxFontSize: scaleDesign(context, 35),
        minFontSize: scaleDesign(context, 18),
        lineHeight: 0.9,
        letterSpacing: 0
      })
    : null;
  const subtitleTop = subtitleBlock
    ? titleTop + titleBlock.height + scaleDesign(context, 40)
    : 0;
  const footerBlock = context.input.footer
    ? fitSingleLineBlock({
        text: context.input.footer,
        maxWidth: size * 0.6,
        maxFontSize: scaleDesign(context, 35),
        minFontSize: scaleDesign(context, 18)
      })
    : null;
  const dateBlock = context.input.date
    ? fitSingleLineBlock({
        text: context.input.date,
        maxWidth: size * 0.6,
        maxFontSize: scaleDesign(context, 26),
        minFontSize: scaleDesign(context, 14)
      })
    : null;
  const dateBaseline = footerBlock ? scaleDesign(context, 548) : footerBaseline;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#111214" />
    ${renderPhotoLayers(context)}
    ${renderFittedBlock({
      block: headerBlock,
      x: size - headerInset,
      baselineY: headerBaseline,
      fill: "#FFFFFF",
      anchor: "end",
      fontWeight: 500,
      fontFamily: textFont,
      context
    })}
    ${renderMultilineText({
      block: titleBlock,
      x: size / 2,
      y: titleTop,
      fill: "#FFFFFF",
      anchor: "middle",
      fontWeight: 600,
      letterSpacing: 0,
      fontFamily: displayFont,
      filter: textFilter(context)
    })}
    ${
      subtitleBlock
        ? renderMultilineText({
            block: subtitleBlock,
            x: size / 2,
            y: subtitleTop,
            fill: "#FFFFFF",
            anchor: "middle",
            fontWeight: 600,
            letterSpacing: 0,
            fontFamily: displayFont,
            filter: textFilter(context)
          })
        : ""
    }
    ${
      footerBlock
        ? renderFittedBlock({
            block: footerBlock,
            x: size / 2,
            baselineY: footerBaseline,
            fill: "rgba(255,255,255,0.49)",
            anchor: "middle",
            fontWeight: 500,
            fontFamily: displayFont,
            context
          })
        : ""
    }
    ${
      dateBlock
        ? renderFittedBlock({
            block: dateBlock,
            x: size / 2,
            baselineY: dateBaseline,
            fill: "rgba(255,255,255,0.42)",
            anchor: "middle",
            fontWeight: 500,
            fontFamily: textFont,
            context
          })
        : ""
    }
  `;
}

function renderClassicTemplate(context: TemplateContext) {
  const { size, title } = context.input;
  const leftInset = scaleDesign(context, 55);
  const rightInset = scaleDesign(context, 20);
  const headerBaseline = scaleDesign(context, 50);
  const metaBaseline = scaleDesign(context, 90);
  const titleBaseline = scaleDesign(context, 380);
  const subtitleBaseline = scaleDesign(context, 450);
  const footerBaseline = scaleDesign(context, 550);
  const headerBlock = fitSingleLineBlock({
    text: context.input.header,
    maxWidth: size * 0.42,
    maxFontSize: scaleDesign(context, 35),
    minFontSize: scaleDesign(context, 18)
  });
  const titleBlock = fitTextBlock({
    text: title,
    maxWidth: size - leftInset * 2,
    maxHeight: size * 0.28,
    maxLines: 3,
    maxFontSize: scaleDesign(context, 70),
    minFontSize: scaleDesign(context, 32),
    lineHeight: 0.92,
    letterSpacing: 0
  });
  const titleTop = titleBaseline - titleBlock.fontSize;
  const subtitleBlock = context.input.subtitle
    ? fitTextBlock({
        text: context.input.subtitle,
        maxWidth: size - leftInset * 2,
        maxHeight: size * 0.24,
        maxLines: 2,
        maxFontSize: scaleDesign(context, 70),
        minFontSize: scaleDesign(context, 26),
        lineHeight: 0.92,
        letterSpacing: 0
      })
    : null;
  const subtitleTop = subtitleBlock
    ? Math.max(
        titleTop + titleBlock.height + scaleDesign(context, 18),
        subtitleBaseline - subtitleBlock.fontSize
      )
    : 0;
  const footerBlock = context.input.footer
    ? fitSingleLineBlock({
        text: context.input.footer,
        maxWidth: size * 0.55,
        maxFontSize: scaleDesign(context, 35),
        minFontSize: scaleDesign(context, 18)
      })
    : null;
  const dateBlock = context.input.date
    ? fitSingleLineBlock({
        text: context.input.date,
        maxWidth: size * 0.38,
        maxFontSize: scaleDesign(context, 35),
        minFontSize: scaleDesign(context, 16)
      })
    : null;

  return `
    <rect x="0" y="0" width="${size}" height="${size}" fill="#0B0B0D" />
    ${renderPhotoLayers(context)}
    ${renderFittedBlock({
      block: headerBlock,
      x: size - rightInset,
      baselineY: headerBaseline,
      fill: "#FFFFFF",
      anchor: "end",
      fontWeight: 500,
      fontFamily: textFont,
      context
    })}
    ${
      dateBlock
        ? renderFittedBlock({
            block: dateBlock,
            x: size - scaleDesign(context, 30),
            baselineY: metaBaseline,
            fill: "#FFFFFF",
            anchor: "end",
            fontWeight: 500,
            fontFamily: textFont,
            context
          })
        : ""
    }
    ${renderMultilineText({
      block: titleBlock,
      x: leftInset,
      y: titleTop,
      fill: "#FFFFFF",
      fontWeight: 400,
      letterSpacing: 0,
      fontFamily: serifFont,
      filter: textFilter(context)
    })}
    ${
      subtitleBlock
        ? renderMultilineText({
            block: subtitleBlock,
            x: leftInset,
            y: subtitleTop,
            fill: "#FFFFFF",
            fontWeight: 400,
            letterSpacing: 0,
            fontFamily: serifFont,
            filter: textFilter(context)
          })
        : ""
    }
    ${
      footerBlock
        ? renderFittedBlock({
            block: footerBlock,
            x: leftInset,
            baselineY: footerBaseline,
            fill: "rgba(255,255,255,0.49)",
            fontWeight: 500,
            fontFamily: serifSmallFont,
            context
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
