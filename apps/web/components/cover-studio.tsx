"use client";
/* eslint-disable @next/next/no-img-element */

import { renderCoverSvg } from "@cover-generator/cover-renderer";
import {
  buildOutputFileName,
  coverTemplates,
  defaultTemplate,
  supportedMimeTypes,
  type CoverTemplate
} from "@cover-generator/shared";
import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import {
  downloadBlob,
  fileToDataUrl,
  svgToPngBlob,
  type UploadedImageState
} from "../lib/browser-image";

interface FormState {
  header: string;
  title: string;
  date: string;
  subtitle: string;
  footer: string;
  template: CoverTemplate;
  shadow: boolean;
  blur: boolean;
}

interface PreviewState {
  url: string | null;
  svg: string | null;
  width: number;
  height: number;
  error: string | null;
}

type EditableField = keyof Pick<
  FormState,
  "header" | "title" | "subtitle" | "date" | "footer"
>;

const initialFormState: FormState = {
  header: "APPLE MUSIC",
  title: "Han River",
  date: "2026-03-01",
  subtitle: "Seoul",
  footer: "SELF UPLOAD",
  template: defaultTemplate,
  shadow: false,
  blur: false
};

const panelClass =
  "rounded-2xl border-[3px] border-[#e6e6e6] bg-white";

const templatePreviewBackground = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f06767" />
        <stop offset="45%" stop-color="#8f64ff" />
        <stop offset="100%" stop-color="#1b5dd6" />
      </linearGradient>
      <radialGradient id="glow-a" cx="22%" cy="18%" r="54%">
        <stop offset="0%" stop-color="#ffcf70" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#ffcf70" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow-b" cx="78%" cy="78%" r="58%">
        <stop offset="0%" stop-color="#091e6b" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#091e6b" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="600" height="600" fill="url(#base)" />
    <rect width="600" height="600" fill="url(#glow-a)" />
    <rect width="600" height="600" fill="url(#glow-b)" />
  </svg>
`)}`;

const templatePreviewTitles: Record<CoverTemplate, string> = {
  modern: "Blue Hour",
  normal: "Morning Air",
  classic: "Late Drive"
};

const templatePreviewImages = Object.fromEntries(
  coverTemplates.map((template) => [
    template.id,
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      renderCoverSvg({
        image: { src: templatePreviewBackground, mimeType: "image/svg+xml" },
        header: template.id === "classic" ? "@slowlydev" : "APPLE MUSIC",
        title: templatePreviewTitles[template.id],
        date: template.id === "classic" ? "Classical" : "",
        subtitle: "Seoul",
        footer: template.id === "normal" ? "Playlist" : "SELF UPLOAD",
        template: template.id,
        shadow: false,
        blur: false
      }).svg
    )}`
  ])
) as Record<CoverTemplate, string>;

const quickSymbols: Array<{
  label: string;
  value: string;
  title: string;
}> = [
  { label: "", value: "", title: "Apple" },
  { label: "⌘", value: "⌘", title: "Command" },
  { label: "⌥", value: "⌥", title: "Option" },
  { label: "⌃", value: "⌃", title: "Control" },
  { label: "⇧", value: "⇧", title: "Shift" },
  { label: "⊞", value: "⊞", title: "Windows key" },
  { label: "🪟", value: "🪟", title: "Window" },
  { label: "↩", value: "↩", title: "Return" },
  { label: "⇥", value: "⇥", title: "Tab" },
  { label: "⌫", value: "⌫", title: "Delete" },
  { label: "♪", value: "♪", title: "Note" },
  { label: "♫", value: "♫", title: "Music" },
  { label: "♥", value: "♥", title: "Heart" },
  { label: "♡", value: "♡", title: "Outline heart" },
  { label: "★", value: "★", title: "Star" },
  { label: "✦", value: "✦", title: "Sparkle" }
];

const fieldLabels: Record<EditableField, string> = {
  header: "Header",
  title: "Main Title",
  subtitle: "Subtitle",
  date: "Date Or Meta",
  footer: "Footer"
};

function FieldLabel({
  htmlFor,
  children
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label
      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function OptionToggle({
  checked,
  label,
  description,
  onChange
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-[3px] border-[#e6e6e6] bg-[#fcfcfd] p-3 transition hover:border-[#d4d4d8]">
      <input
        checked={checked}
        className="mt-0.5 h-5 w-5 rounded-md border-[#d4d4d8] text-[#027fff] focus:ring-[#027fff]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="block">
        <span className="block text-sm font-semibold text-[#111111]">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-black/55">
          {description}
        </span>
      </span>
    </label>
  );
}

function TemplateMini({ template }: { template: CoverTemplate }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#eceef2]">
      <img
        alt={`${template} template preview`}
        className="block h-28 w-full object-cover"
        src={templatePreviewImages[template]}
      />
    </div>
  );
}

function TemplateCard({
  template,
  active,
  onSelect
}: {
  template: (typeof coverTemplates)[number];
  active: boolean;
  onSelect: (template: CoverTemplate) => void;
}) {
  return (
    <button
      className={[
        "rounded-2xl border-[3px] p-3 text-left transition",
        active
          ? "border-[#027fff] bg-[#f7fbff]"
          : "border-[#e6e6e6] bg-white hover:border-[#d3d3d7]"
      ].join(" ")}
      onClick={() => onSelect(template.id)}
      type="button"
    >
      <TemplateMini template={template.id} />
      <div className="mt-3">
        <p className="text-sm font-semibold text-[#111111]">{template.label}</p>
        <p className="mt-1 text-sm leading-5 text-black/55">
          {template.description}
        </p>
      </div>
    </button>
  );
}

function EmptyPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[28px] border-[3px] border-dashed border-[#d8d8de] bg-[#fafafc] p-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/38">
        Not Selected Yet
      </p>
      <p className="mt-3 max-w-[14rem] text-sm leading-6 text-black/55">
        Upload one image to render a local Apple Music-style cover preview.
      </p>
    </div>
  );
}

function quoteCliValue(value: string) {
  return JSON.stringify(value);
}

export function CoverStudio() {
  const inputId = useId();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [activeField, setActiveField] = useState<EditableField>("title");
  const deferredForm = useDeferredValue(form);
  const [image, setImage] = useState<UploadedImageState | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    url: null,
    svg: null,
    width: 1600,
    height: 1600,
    error: null
  });
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fieldRefs = useRef<
    Record<EditableField, HTMLInputElement | HTMLTextAreaElement | null>
  >({
    header: null,
    title: null,
    subtitle: null,
    date: null,
    footer: null
  });

  useEffect(() => {
    if (!image) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setPreview({
        url: null,
        svg: null,
        width: 1600,
        height: 1600,
        error: null
      });
      return;
    }

    try {
      const result = renderCoverSvg({
        image: { src: image.dataUrl, mimeType: image.mimeType },
        header: deferredForm.header,
        title: deferredForm.title,
        date: deferredForm.date,
        subtitle: deferredForm.subtitle,
        footer: deferredForm.footer,
        template: deferredForm.template,
        shadow: deferredForm.shadow,
        blur: deferredForm.blur
      });

      const nextUrl = URL.createObjectURL(
        new Blob([result.svg], { type: "image/svg+xml;charset=utf-8" })
      );

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      previewUrlRef.current = nextUrl;
      setPreview({
        url: nextUrl,
        svg: result.svg,
        width: result.width,
        height: result.height,
        error: null
      });
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Preview rendering failed."
      }));
    }
  }, [deferredForm, image]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setTextField(field: EditableField, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function setFieldRef(field: EditableField) {
    return (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRefs.current[field] = node;
    };
  }

  function insertSymbol(value: string) {
    const field = activeField;
    const element = fieldRefs.current[field];
    const currentValue = form[field];
    const selectionStart = element?.selectionStart ?? currentValue.length;
    const selectionEnd = element?.selectionEnd ?? currentValue.length;
    const nextValue =
      currentValue.slice(0, selectionStart) +
      value +
      currentValue.slice(selectionEnd);

    setTextField(field, nextValue);

    requestAnimationFrame(() => {
      const nextElement = fieldRefs.current[field];
      if (!nextElement) {
        return;
      }

      const caret = selectionStart + value.length;
      nextElement.focus();
      nextElement.setSelectionRange(caret, caret);
    });
  }

  async function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!supportedMimeTypes.has(file.type)) {
      setPreview((current) => ({
        ...current,
        error: "Upload a JPG, PNG, WebP, or AVIF image."
      }));
      return;
    }

    setBusyMessage("Preparing image...");

    try {
      const dataUrl = await fileToDataUrl(file);
      setImage({
        dataUrl,
        fileName: file.name,
        mimeType: file.type
      });
      setPreview((current) => ({
        ...current,
        error: null
      }));
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "The file could not be read."
      }));
    } finally {
      setBusyMessage(null);
    }
  }

  async function handleDownload() {
    if (!preview.svg) {
      return;
    }

    setBusyMessage("Exporting PNG...");

    try {
      const pngBlob = await svgToPngBlob(preview.svg, preview.width, preview.height);
      downloadBlob(
        pngBlob,
        buildOutputFileName(form.title, form.date, form.template)
      );
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "PNG export failed."
      }));
    } finally {
      setBusyMessage(null);
    }
  }

  const cliCommand = [
    "cover-generator generate ./input/photo.jpg",
    `--header ${quoteCliValue(form.header)}`,
    `--title ${quoteCliValue(form.title)}`,
    `--date ${quoteCliValue(form.date)}`,
    `--subtitle ${quoteCliValue(form.subtitle)}`,
    `--footer ${quoteCliValue(form.footer)}`,
    `--template ${form.template}`,
    form.shadow ? "--shadow" : "",
    form.blur ? "--blur" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-5 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className={`${panelClass} p-4`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/42">
                  Cover Preview
                </p>
                <p className="mt-1 text-sm text-black/58">
                  {image ? image.fileName : "not selected yet"}
                </p>
              </div>
              <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/42">
                1600
              </span>
            </div>

            <div className="mt-4 flex min-h-[21rem] items-center justify-center overflow-hidden rounded-[24px] bg-[#eef0f4] p-4">
              {preview.url ? (
                <div className="relative flex items-center justify-center">
                  <img
                    alt=""
                    className="absolute inset-[-12%] h-[124%] w-[124%] scale-105 rounded-[36px] object-cover blur-3xl opacity-60"
                    src={image?.dataUrl ?? preview.url}
                  />
                  <img
                    alt="Cover preview"
                    className="relative h-[17rem] w-[17rem] rounded-[28px] object-cover shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
                    src={preview.url}
                  />
                </div>
              ) : (
                <EmptyPreview />
              )}
            </div>

            <div className="mt-4 rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#111111]">Source</p>
                <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
                  Self upload
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-black/55">
                {image
                  ? `${image.fileName} is ready for preview and export.`
                  : "Choose one photo to unlock preview and PNG export."}
              </p>
            </div>

            {preview.error ? (
              <div className="mt-4 rounded-xl border-[3px] border-[#f1c7bc] bg-[#fff4f1] px-3 py-2.5 text-sm text-[#a24a32]">
                {preview.error}
              </div>
            ) : null}

            <button
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-[3px] border-[#027fff] bg-[#027fff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
              disabled={!preview.svg || Boolean(busyMessage)}
              onClick={() => {
                void handleDownload();
              }}
              type="button"
            >
              {busyMessage ?? "Download PNG"}
            </button>
          </section>

          <section className={`${panelClass} p-4`}>
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="header">Header</FieldLabel>
                <input
                  className="w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-sm font-medium uppercase tracking-[0.16em] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="header"
                  maxLength={48}
                  onChange={(event) => setTextField("header", event.target.value)}
                  onFocus={() => setActiveField("header")}
                  placeholder="APPLE MUSIC"
                  ref={setFieldRef("header")}
                  type="text"
                  value={form.header}
                />
              </div>

              <div>
                <FieldLabel htmlFor="title">Main Title</FieldLabel>
                <textarea
                  className="min-h-[92px] w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-lg font-semibold text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="title"
                  maxLength={120}
                  onChange={(event) => setTextField("title", event.target.value)}
                  onFocus={() => setActiveField("title")}
                  placeholder="Han River"
                  ref={setFieldRef("title")}
                  value={form.title}
                />
              </div>

              <div>
                <FieldLabel htmlFor="subtitle">Subtitle</FieldLabel>
                <input
                  className="w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-sm font-medium text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="subtitle"
                  maxLength={80}
                  onChange={(event) => setTextField("subtitle", event.target.value)}
                  onFocus={() => setActiveField("subtitle")}
                  placeholder="Seoul"
                  ref={setFieldRef("subtitle")}
                  type="text"
                  value={form.subtitle}
                />
              </div>

              <div>
                <FieldLabel htmlFor="date">Date Or Meta</FieldLabel>
                <input
                  className="w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-sm font-medium text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="date"
                  maxLength={80}
                  onChange={(event) => setTextField("date", event.target.value)}
                  onFocus={() => setActiveField("date")}
                  placeholder="2026-03-01 or Vol. 01"
                  ref={setFieldRef("date")}
                  type="text"
                  value={form.date}
                />
              </div>

              <div>
                <FieldLabel htmlFor="footer">Footer</FieldLabel>
                <input
                  className="w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-sm font-medium uppercase tracking-[0.16em] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="footer"
                  maxLength={48}
                  onChange={(event) => setTextField("footer", event.target.value)}
                  onFocus={() => setActiveField("footer")}
                  placeholder="SELF UPLOAD"
                  ref={setFieldRef("footer")}
                  type="text"
                  value={form.footer}
                />
              </div>

              <div className="rounded-2xl border-[3px] border-[#e6e6e6] bg-[#fafafc] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      Quick Symbols
                    </p>
                    <p className="mt-1 text-xs text-black/52">
                      Inserts into {fieldLabels[activeField]}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/42">
                    Palette
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {quickSymbols.map((symbol) => (
                    <button
                      className="inline-flex h-11 items-center justify-center rounded-xl border-[3px] border-[#e6e6e6] bg-white text-lg font-semibold text-[#111111] transition hover:border-[#cfd6df] hover:bg-[#fefefe]"
                      key={`${symbol.title}-${symbol.value}`}
                      onClick={() => insertSymbol(symbol.value)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      title={symbol.title}
                      type="button"
                    >
                      {symbol.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <OptionToggle
                  checked={form.shadow}
                  description="Add text shadow for stronger contrast on bright photos."
                  label="Use shadow"
                  onChange={(shadow) =>
                    setForm((current) => ({
                      ...current,
                      shadow
                    }))
                  }
                />
                <OptionToggle
                  checked={form.blur}
                  description="Soften the background photo for a more CoverX-like treatment."
                  label="Use blur"
                  onChange={(blur) =>
                    setForm((current) => ({
                      ...current,
                      blur
                    }))
                  }
                />
              </div>
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <section className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                CoverX-inspired
              </span>
              <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                Local only
              </span>
              <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                Shared renderer
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-black/62">
              This version keeps the same local workflow but shifts the UI and
              cover output closer to the public CoverX feel: smaller utility
              panels, simpler Apple-like typography, and cleaner full-bleed
              image compositions.
            </p>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <section
              className={`${panelClass} p-5`}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleFile(event.dataTransfer.files.item(0));
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    Self Upload
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                    Drag one photo here or choose from disk.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-black/58">
                    The renderer uses one square composition path for both the
                    live preview and the CLI export. Long text is wrapped and
                    resized inside the shared package.
                  </p>
                </div>
                <label
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border-[3px] border-[#027fff] bg-[#027fff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0]"
                  htmlFor={inputId}
                >
                  Choose Image
                </label>
              </div>

              <input
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                id={inputId}
                onChange={(event) => {
                  void handleFile(event.target.files?.item(0) ?? null);
                }}
                type="file"
              />

              <div className="mt-5 rounded-2xl border-[3px] border-dashed border-[#d4d4d8] bg-[#fafafc] p-5">
                <div className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-[#eceef2]">
                    {image ? (
                      <img
                        alt="Uploaded source"
                        className="h-full w-full object-cover"
                        src={image.dataUrl}
                      />
                    ) : (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                        none
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111]">
                      {image ? image.fileName : "No image selected"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/58">
                      {image
                        ? "Your uploaded photo is now driving the preview and the exported cover."
                        : "JPG, PNG, WebP, and AVIF are supported. The image stays local in your browser."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${panelClass} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    Templates
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/58">
                    All three templates now follow a simpler Apple Music-like
                    cover structure instead of the previous editorial layouts.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {coverTemplates.map((template) => (
                  <TemplateCard
                    active={template.id === form.template}
                    key={template.id}
                    onSelect={(templateId) =>
                      setForm((current) => ({
                        ...current,
                        template: templateId
                      }))
                    }
                    template={template}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-black/58">
                Template selection lives here only, matching the utility flow of
                the reference site.
              </p>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className={`${panelClass} p-5`}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                CLI Parity
              </p>
              <code className="mt-3 block break-all whitespace-pre-wrap rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-4 text-sm leading-7 text-black/72">
                {cliCommand}
              </code>
              <p className="mt-3 text-sm leading-6 text-black/58">
                The CLI uses the same renderer package. If you keep the same
                image, header, footer, text, template, and effect flags, the
                output composition matches the browser export.
              </p>
            </section>

            <section className={`${panelClass} p-5`}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                Rendering Notes
              </p>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-black/58">
                <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                  Full-bleed image crops are handled inside the shared SVG
                  renderer, not in the UI components.
                </div>
                <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                  Text is wrapped and reduced until it fits the safe area for
                  each template.
                </div>
                <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                  Blur and shadow are optional, just like the public CoverX
                  interface.
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
