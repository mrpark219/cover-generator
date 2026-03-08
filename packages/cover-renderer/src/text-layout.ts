import { clamp, sanitizeText } from "@cover-generator/shared";

interface FitTextBlockOptions {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxLines: number;
  maxFontSize: number;
  minFontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface FittedTextBlock {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  widestLine: number;
  height: number;
}

function characterWidthFactor(character: string) {
  if (/\s/.test(character)) {
    return 0.34;
  }

  if (/[ilI1'`|]/.test(character)) {
    return 0.3;
  }

  if (/[fjt]/.test(character)) {
    return 0.38;
  }

  if (/[mwMW@#%&]/.test(character)) {
    return 0.92;
  }

  if (/[A-Z0-9]/.test(character)) {
    return 0.68;
  }

  if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u3400-\u9fff]/.test(character)) {
    return 1;
  }

  return 0.58;
}

export function estimateTextWidth(
  text: string,
  fontSize: number,
  letterSpacing = 0
) {
  if (!text) {
    return 0;
  }

  const characters = Array.from(text);
  const widthUnits = characters.reduce(
    (total, character) => total + characterWidthFactor(character),
    0
  );

  return widthUnits * fontSize + Math.max(characters.length - 1, 0) * letterSpacing;
}

function breakLongToken(token: string, maxWidth: number, fontSize: number, letterSpacing = 0) {
  const segments: string[] = [];
  let current = "";

  for (const character of Array.from(token)) {
    const next = `${current}${character}`;
    if (estimateTextWidth(next, fontSize, letterSpacing) <= maxWidth || !current) {
      current = next;
      continue;
    }

    segments.push(current);
    current = character;
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

function wrapText(
  rawText: string,
  maxWidth: number,
  fontSize: number,
  letterSpacing = 0
) {
  const text = sanitizeText(rawText);
  if (!text) {
    return [""];
  }

  const paragraphs = text.split(/\n+/).filter(Boolean);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const tokens = paragraph.split(/\s+/).filter(Boolean);
    let currentLine = "";

    for (const token of tokens) {
      const candidate = currentLine ? `${currentLine} ${token}` : token;
      if (estimateTextWidth(candidate, fontSize, letterSpacing) <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      if (estimateTextWidth(token, fontSize, letterSpacing) <= maxWidth) {
        currentLine = token;
        continue;
      }

      const tokenParts = breakLongToken(token, maxWidth, fontSize, letterSpacing);
      currentLine = tokenParts.pop() ?? "";
      lines.push(...tokenParts);
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [text];
}

function truncateLine(line: string, maxWidth: number, fontSize: number, letterSpacing = 0) {
  const characters = Array.from(line);
  let current = "";

  for (const character of characters) {
    const candidate = `${current}${character}`;
    if (estimateTextWidth(`${candidate}…`, fontSize, letterSpacing) > maxWidth) {
      break;
    }

    current = candidate;
  }

  return current ? `${current}…` : "…";
}

export function fitTextBlock(options: FitTextBlockOptions): FittedTextBlock {
  const {
    text,
    maxWidth,
    maxHeight,
    maxLines,
    maxFontSize,
    minFontSize,
    lineHeight,
    letterSpacing = 0
  } = options;

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 2) {
    const lines = wrapText(text, maxWidth, fontSize, letterSpacing);
    const trimmedLines = lines.slice(0, maxLines);
    const lineHeightPx = fontSize * lineHeight;
    const height = trimmedLines.length * lineHeightPx;
    const widestLine = trimmedLines.reduce(
      (current, line) => Math.max(current, estimateTextWidth(line, fontSize, letterSpacing)),
      0
    );

    if (lines.length <= maxLines && height <= maxHeight && widestLine <= maxWidth) {
      return {
        lines: trimmedLines,
        fontSize,
        lineHeight,
        widestLine,
        height
      };
    }
  }

  const finalFontSize = clamp(minFontSize, 12, maxFontSize);
  const wrappedLines = wrapText(text, maxWidth, finalFontSize, letterSpacing);
  const finalLines = wrappedLines.slice(0, maxLines);

  if (wrappedLines.length > maxLines) {
    const lastIndex = finalLines.length - 1;
    finalLines[lastIndex] = truncateLine(
      finalLines[lastIndex] ?? "",
      maxWidth,
      finalFontSize,
      letterSpacing
    );
  }

  return {
    lines: finalLines,
    fontSize: finalFontSize,
    lineHeight,
    widestLine: finalLines.reduce(
      (current, line) => Math.max(current, estimateTextWidth(line, finalFontSize, letterSpacing)),
      0
    ),
    height: finalLines.length * finalFontSize * lineHeight
  };
}

