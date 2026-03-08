#!/usr/bin/env node

import { renderCoverSvg } from "@cover-generator/cover-renderer";
import {
  buildOutputFileName,
  coverTemplates,
  coverSizeOptions,
  defaultCoverSize,
  defaultTemplate,
  defaultTextColor,
  isSupportedCoverSize,
  isCoverTemplate,
  normalizeHexColor,
  sanitizeText,
  supportedMimeTypes,
  type CoverTemplate
} from "@cover-generator/shared";
import { Command, InvalidArgumentError } from "commander";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const templateChoices = coverTemplates.map((template) => template.id);
const program = new Command();

program
  .name("cover-generator")
  .description("Generate Apple Music-style date cover artwork from a single photo.")
  .version("0.1.0");

program
  .command("generate")
  .argument("<input>", "Path to the source image")
  .requiredOption("--title <title>", "Cover title")
  .requiredOption("--date <date>", "Cover date or meta text")
  .option("--header <header>", "Small header text", "APPLE MUSIC")
  .option("--subtitle <subtitle>", "Subtitle or location", "Somewhere")
  .option("--footer <footer>", "Small footer text", "SELF UPLOAD")
  .option("--text-color <textColor>", "Hex text color, for example #FFFFFF", parseTextColor, defaultTextColor)
  .option(
    "--template <template>",
    `Template: ${templateChoices.join(", ")}`,
    parseTemplate,
    defaultTemplate
  )
  .option(
    "--size <size>",
    `Square output size: ${coverSizeOptions.join(", ")}`,
    parseSize,
    defaultCoverSize
  )
  .option("--shadow", "Add text shadow for stronger contrast")
  .option("--blur", "Blur the cover background for a softer look")
  .option("--focus-x <focusX>", "Horizontal crop focus: 0 left, 50 center, 100 right", parseFocus, 50)
  .option("--focus-y <focusY>", "Vertical crop focus: 0 top, 50 center, 100 bottom", parseFocus, 50)
  .option("-o, --output <output>", "Output PNG file path or target directory")
  .action(async (input, options) => {
    await generateCover({
      inputPath: input,
      header: options.header,
      title: options.title,
      date: options.date,
      subtitle: options.subtitle,
      footer: options.footer,
      textColor: options.textColor,
      template: options.template,
      size: options.size,
      shadow: Boolean(options.shadow),
      blur: Boolean(options.blur),
      focusX: options.focusX / 100,
      focusY: options.focusY / 100,
      output: options.output
    });
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

function parseTemplate(value: string) {
  if (!isCoverTemplate(value)) {
    throw new InvalidArgumentError(
      `Unknown template "${value}". Use one of: ${templateChoices.join(", ")}.`
    );
  }

  return value;
}

function parseSize(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || !isSupportedCoverSize(parsed)) {
    throw new InvalidArgumentError(
      `Unknown size "${value}". Use one of: ${coverSizeOptions.join(", ")}.`
    );
  }

  return parsed;
}

function parseFocus(value: string) {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new InvalidArgumentError(`Unknown focus "${value}". Use a value from 0 to 100.`);
  }

  return parsed;
}

function parseTextColor(value: string) {
  const normalized = normalizeHexColor(value, "");

  if (!normalized) {
    throw new InvalidArgumentError(
      `Unknown text color "${value}". Use a 3 or 6 digit hex color like #FFFFFF.`
    );
  }

  return normalized;
}

async function generateCover({
  inputPath,
  header,
  title,
  date,
  subtitle,
  footer,
  textColor,
  template,
  size,
  shadow,
  blur,
  focusX,
  focusY,
  output
}: {
  inputPath: string;
  header: string;
  title: string;
  date: string;
  subtitle: string;
  footer: string;
  textColor: string;
  template: CoverTemplate;
  size: number;
  shadow: boolean;
  blur: boolean;
  focusX: number;
  focusY: number;
  output?: string;
}) {
  const absoluteInputPath = path.resolve(process.cwd(), inputPath);
  await ensureReadableFile(absoluteInputPath);

  const image = await loadInputImage(absoluteInputPath);
  const renderResult = renderCoverSvg({
    image: {
      ...image,
      focusX,
      focusY
    },
    header,
    title,
    date,
    subtitle,
    footer,
    textColor,
    template,
    size,
    shadow,
    blur
  });

  const outputPath = resolveOutputPath({
    inputPath: absoluteInputPath,
    title,
    date,
    template,
    output
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(renderResult.svg))
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputPath);

  const relativePath = path.relative(process.cwd(), outputPath) || path.basename(outputPath);
  console.log(`Success: cover saved to ${relativePath}`);
  console.log(`Template: ${template}`);
  console.log(`Header/Footer: ${header || "-"} / ${footer || "-"}`);
  console.log(`Text color: ${textColor}`);
  console.log(`Effects: shadow=${shadow ? "on" : "off"}, blur=${blur ? "on" : "off"}`);
  console.log(`Focus: x=${Math.round(focusX * 100)}, y=${Math.round(focusY * 100)}`);
  console.log(`Size: ${renderResult.width}x${renderResult.height}`);
}

async function ensureReadableFile(filePath: string) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Input image not found: ${filePath}`);
  }
}

async function loadInputImage(filePath: string) {
  const buffer = await readFile(filePath);
  const metadata = await sharp(buffer).metadata();
  const mimeType = resolveMimeType(metadata.format, filePath);

  if (!supportedMimeTypes.has(mimeType)) {
    throw new Error(
      `Unsupported image format for "${path.basename(filePath)}". Use JPG, PNG, WebP, or AVIF.`
    );
  }

  return {
    src: `data:${mimeType};base64,${buffer.toString("base64")}`,
    mimeType,
    width: metadata.width,
    height: metadata.height
  };
}

function resolveMimeType(format: string | undefined, filePath: string) {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default: {
      const extension = path.extname(filePath).toLowerCase();

      switch (extension) {
        case ".jpg":
        case ".jpeg":
          return "image/jpeg";
        case ".png":
          return "image/png";
        case ".webp":
          return "image/webp";
        case ".avif":
          return "image/avif";
        default:
          return "application/octet-stream";
      }
    }
  }
}

function resolveOutputPath({
  inputPath,
  title,
  date,
  template,
  output
}: {
  inputPath: string;
  title: string;
  date: string;
  template: CoverTemplate;
  output?: string;
}) {
  const fallbackFileName = buildOutputFileName(title, date, template);
  const baseOutputDir = path.resolve(process.cwd(), "output");

  if (!output) {
    return path.join(baseOutputDir, fallbackFileName);
  }

  const absoluteOutput = path.resolve(process.cwd(), output);
  const extension = path.extname(absoluteOutput).toLowerCase();

  if (extension === ".png") {
    return absoluteOutput;
  }

  const inputName = sanitizeText(path.basename(inputPath, path.extname(inputPath)), "cover");
  const customFileName = buildOutputFileName(`${title} ${inputName}`, date, template);
  return path.join(absoluteOutput, customFileName);
}
