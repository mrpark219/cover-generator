import { escapeXml } from "@cover-generator/shared";
import type { FittedTextBlock } from "./text-layout";

export function renderMultilineText({
  block,
  x,
  y,
  fill,
  opacity = 1,
  fontWeight = 600,
  letterSpacing = 0,
  anchor = "start",
  fontFamily = "'SF Pro Display', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
}: {
  block: FittedTextBlock;
  x: number;
  y: number;
  fill: string;
  opacity?: number;
  fontWeight?: number;
  letterSpacing?: number;
  anchor?: "start" | "middle" | "end";
  fontFamily?: string;
}) {
  const baseline = y + block.fontSize;

  return `
    <text
      x="${x}"
      y="${baseline}"
      fill="${fill}"
      opacity="${opacity}"
      font-family="${fontFamily}"
      font-size="${block.fontSize}"
      font-weight="${fontWeight}"
      letter-spacing="${letterSpacing}"
      text-anchor="${anchor}"
    >
      ${block.lines
        .map(
          (line, index) =>
            `<tspan x="${x}" dy="${index === 0 ? 0 : block.fontSize * block.lineHeight}">${escapeXml(
              line
            )}</tspan>`
        )
        .join("")}
    </text>
  `;
}

export function renderLabel({
  text,
  x,
  y,
  fill,
  fontSize,
  letterSpacing = 10,
  opacity = 1,
  anchor = "start",
  fontWeight = 600
}: {
  text: string;
  x: number;
  y: number;
  fill: string;
  fontSize: number;
  letterSpacing?: number;
  opacity?: number;
  anchor?: "start" | "middle" | "end";
  fontWeight?: number;
}) {
  return `
    <text
      x="${x}"
      y="${y}"
      fill="${fill}"
      opacity="${opacity}"
      font-family="'SF Pro Display', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      letter-spacing="${letterSpacing}"
      text-anchor="${anchor}"
    >${escapeXml(text)}</text>
  `;
}

