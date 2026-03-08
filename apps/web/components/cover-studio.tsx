"use client";
/* eslint-disable @next/next/no-img-element */

import { renderCoverSvg } from "@cover-generator/cover-renderer";
import {
  buildOutputFileName,
  coverTemplates,
  coverSizeOptions,
  defaultCoverSize,
  defaultTemplate,
  slugifyFilePart,
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
  zipFilesToBlob,
  type UploadedImageState
} from "../lib/browser-image";

interface FormState {
  header: string;
  title: string;
  date: string;
  subtitle: string;
  footer: string;
  template: CoverTemplate;
  size: number;
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

interface UploadedImageItem extends UploadedImageState {
  id: string;
  selected: boolean;
  draftForm: FormState;
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
  size: defaultCoverSize,
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
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border-[3px] border-[#e6e6e6] bg-[#fcfcfd] p-3 transition hover:border-[#d4d4d8]">
      <span className="block min-w-0">
        <span className="block text-sm font-semibold text-[#111111]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-black/52">
          {description}
        </span>
      </span>
      <input
        checked={checked}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-[#d4d4d8] text-[#027fff] focus:ring-[#027fff]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

function TemplateMini({ template }: { template: CoverTemplate }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#eceef2]">
      <img
        alt={`${template} template preview`}
        className="block h-16 w-full object-cover"
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
        "rounded-xl border-[3px] p-2 text-left transition",
        active
          ? "border-[#027fff] bg-[#f7fbff]"
          : "border-[#e6e6e6] bg-white hover:border-[#d3d3d7]"
      ].join(" ")}
      onClick={() => onSelect(template.id)}
      type="button"
    >
      <TemplateMini template={template.id} />
      <p className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#111111]">
        {template.label}
      </p>
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
        Upload one or more images to render a local Apple Music-style cover preview.
      </p>
    </div>
  );
}

function quoteCliValue(value: string) {
  return JSON.stringify(value);
}

function createUploadId(file: File, index: number) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${index}`;

  return `${file.name}-${file.lastModified}-${file.size}-${randomPart}`;
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function cloneFormState(value: FormState): FormState {
  return {
    ...value
  };
}

export function CoverStudio() {
  const inputId = useId();
  const [sharedForm, setSharedForm] = useState<FormState>(initialFormState);
  const [activeField, setActiveField] = useState<EditableField>("title");
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    url: null,
    svg: null,
    width: defaultCoverSize,
    height: defaultCoverSize,
    error: null
  });
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"upload" | "single" | "batch" | null>(
    null
  );
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
  const activeImage =
    images.find((candidate) => candidate.id === activeImageId) ?? null;
  const selectedImages = images.filter((candidate) => candidate.selected);
  const selectedImageCount = selectedImages.length;
  const totalImageCount = images.length;
  const form = activeImage
    ? activeImage.selected
      ? sharedForm
      : activeImage.draftForm
    : sharedForm;
  const deferredForm = useDeferredValue(form);
  const isSharedEditing = activeImage?.selected ?? false;

  useEffect(() => {
    if (!activeImage) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setPreview({
        url: null,
        svg: null,
        width: defaultCoverSize,
        height: defaultCoverSize,
        error: null
      });
      return;
    }

    try {
      const result = renderCoverSvg({
        image: { src: activeImage.dataUrl, mimeType: activeImage.mimeType },
        header: deferredForm.header,
        title: deferredForm.title,
        date: deferredForm.date,
        subtitle: deferredForm.subtitle,
        footer: deferredForm.footer,
        template: deferredForm.template,
        size: deferredForm.size,
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
  }, [activeImage, deferredForm]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setFieldRef(field: EditableField) {
    return (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRefs.current[field] = node;
    };
  }

  function updateFormState(updater: (current: FormState) => FormState) {
    if (!activeImage) {
      setSharedForm(updater);
      return;
    }

    if (activeImage.selected) {
      setSharedForm(updater);
      return;
    }

    setImages((current) =>
      current.map((imageItem) =>
        imageItem.id === activeImage.id
          ? {
              ...imageItem,
              draftForm: updater(imageItem.draftForm)
            }
          : imageItem
      )
    );
  }

  function setTextField(field: EditableField, value: string) {
    updateFormState((current) => ({
      ...current,
      [field]: value
    }));
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

  function createCoverFileName(imageItem: UploadedImageState, settings: FormState) {
    const baseName = buildOutputFileName(
      settings.title,
      settings.date,
      settings.template
    ).replace(
      /\.png$/,
      ""
    );
    const imagePart = slugifyFilePart(stripExtension(imageItem.fileName));

    return `${baseName}-${imagePart || "image"}.png`;
  }

  function clearImages() {
    setImages([]);
    setActiveImageId(null);
    setPreview({
      url: null,
      svg: null,
      width: defaultCoverSize,
      height: defaultCoverSize,
      error: null
    });
  }

  function toggleImageSelection(imageId: string) {
    const targetImage = images.find((imageItem) => imageItem.id === imageId);
    if (!targetImage) {
      return;
    }

    if (!targetImage.selected && selectedImageCount === 0) {
      setSharedForm(cloneFormState(targetImage.draftForm));
    }

    setImages((current) =>
      current.map((imageItem) =>
        imageItem.id === imageId
          ? {
              ...imageItem,
              selected: !imageItem.selected
            }
          : imageItem
      )
    );
  }

  function setAllSelections(selected: boolean) {
    if (selected && selectedImageCount === 0) {
      const seedForm = activeImage?.draftForm ?? images[0]?.draftForm ?? sharedForm;
      setSharedForm(cloneFormState(seedForm));
    }

    setImages((current) =>
      current.map((imageItem) => ({
        ...imageItem,
        selected
      }))
    );
  }

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) {
      return;
    }

    const candidates = Array.from(files);
    const validFiles = candidates.filter((file) => supportedMimeTypes.has(file.type));

    if (validFiles.length === 0) {
      setPreview((current) => ({
        ...current,
        error: "Upload JPG, PNG, WebP, or AVIF images."
      }));
      return;
    }

    setBusyAction("upload");
    setBusyMessage(
      validFiles.length > 1
        ? `Preparing ${validFiles.length} images...`
        : "Preparing image..."
    );

    try {
      const seedForm = cloneFormState(form);
      const uploads = await Promise.all(
        validFiles.map(async (file, index) => ({
          id: createUploadId(file, index),
          dataUrl: await fileToDataUrl(file),
          fileName: file.name,
          mimeType: file.type,
          selected: false,
          draftForm: cloneFormState(seedForm)
        }))
      );

      setImages((current) => [...current, ...uploads]);
      setActiveImageId((current) => current ?? uploads[0]?.id ?? null);
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
      setBusyAction(null);
    }
  }

  async function handleDownload() {
    if (!preview.svg || !activeImage) {
      return;
    }

    setBusyAction("single");
    setBusyMessage("Exporting PNG...");

    try {
      const pngBlob = await svgToPngBlob(preview.svg, preview.width, preview.height);
      downloadBlob(pngBlob, createCoverFileName(activeImage, form));
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "PNG export failed."
      }));
    } finally {
      setBusyMessage(null);
      setBusyAction(null);
    }
  }

  async function handleBatchDownload() {
    if (selectedImages.length === 0) {
      return;
    }

    setBusyAction("batch");
    setBusyMessage(
      selectedImages.length > 1
        ? `Exporting ${selectedImages.length} covers...`
        : "Exporting selected cover..."
    );

    try {
      const files: Array<{ fileName: string; blob: Blob }> = [];

      for (const imageItem of selectedImages) {
        const selectedForm = sharedForm;
        const renderResult = renderCoverSvg({
          image: { src: imageItem.dataUrl, mimeType: imageItem.mimeType },
          header: selectedForm.header,
          title: selectedForm.title,
          date: selectedForm.date,
          subtitle: selectedForm.subtitle,
          footer: selectedForm.footer,
          template: selectedForm.template,
          size: selectedForm.size,
          shadow: selectedForm.shadow,
          blur: selectedForm.blur
        });
        const pngBlob = await svgToPngBlob(
          renderResult.svg,
          renderResult.width,
          renderResult.height
        );

        files.push({
          fileName: createCoverFileName(imageItem, sharedForm),
          blob: pngBlob
        });
      }

      const zipBlob = await zipFilesToBlob(files);
      const zipName = `${buildOutputFileName(
        sharedForm.title,
        sharedForm.date,
        sharedForm.template
      ).replace(/\.png$/, "")}-selected.zip`;
      downloadBlob(zipBlob, zipName);
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "ZIP export failed."
      }));
    } finally {
      setBusyMessage(null);
      setBusyAction(null);
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
    form.size !== defaultCoverSize ? `--size ${form.size}` : "",
    form.shadow ? "--shadow" : "",
    form.blur ? "--blur" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="mx-auto max-w-[1400px] px-3 py-4 sm:px-5 lg:px-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <aside className="grid gap-4 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] xl:sticky xl:top-4 xl:block xl:self-start xl:space-y-4">
          <section className={`${panelClass} p-3 sm:p-4`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/42">
                  Cover Preview
                </p>
                <p className="mt-1 truncate text-sm text-black/58">
                  {activeImage ? activeImage.fileName : "not selected yet"}
                </p>
              </div>
              <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/42">
                {form.size} x {form.size}
              </span>
            </div>

            <div className="mt-3 flex min-h-[12rem] items-center justify-center overflow-hidden rounded-[24px] bg-[#eef0f4] p-3 sm:min-h-[14rem] md:min-h-[15rem] xl:min-h-[16rem]">
              {preview.url ? (
                <div className="relative flex items-center justify-center">
                  <img
                    alt=""
                    className="absolute inset-[-12%] h-[124%] w-[124%] scale-105 rounded-[36px] object-cover blur-3xl opacity-60"
                    src={activeImage?.dataUrl ?? preview.url}
                  />
                  <img
                    alt="Cover preview"
                    className="relative h-[12.5rem] w-[12.5rem] rounded-[26px] object-cover shadow-[0_24px_60px_rgba(15,23,42,0.22)] sm:h-[14rem] sm:w-[14rem] md:h-[15rem] md:w-[15rem] xl:h-[16rem] xl:w-[16rem]"
                    src={preview.url}
                  />
                </div>
              ) : (
                <EmptyPreview />
              )}
            </div>

            <div className="mt-3 rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#111111]">Source</p>
                <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
                  {totalImageCount > 0 ? `${selectedImageCount}/${totalImageCount} selected` : "Self upload"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-black/55">
                {activeImage
                  ? activeImage.selected
                    ? "Active and inside the selected set. Left-side edits are shared."
                    : "Active with its own draft settings. Double-click below to move it into the shared set."
                  : "Upload one or more photos to unlock preview and export."}
              </p>
            </div>

            {preview.error ? (
              <div className="mt-3 rounded-xl border-[3px] border-[#f1c7bc] bg-[#fff4f1] px-3 py-2.5 text-sm text-[#a24a32]">
                {preview.error}
              </div>
            ) : null}

            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border-[3px] border-[#027fff] bg-[#027fff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
                disabled={!preview.svg || Boolean(busyMessage)}
                onClick={() => {
                  void handleDownload();
                }}
                type="button"
              >
                {busyAction === "single" && busyMessage
                  ? busyMessage
                  : "Download Current PNG"}
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border-[3px] border-[#d7dbe3] bg-[#fafafc] px-4 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#c3cad5] hover:bg-white disabled:cursor-not-allowed disabled:border-[#e4e8ef] disabled:text-black/35"
                disabled={selectedImageCount === 0 || Boolean(busyMessage)}
                onClick={() => {
                  void handleBatchDownload();
                }}
                type="button"
              >
                {busyAction === "batch" && busyMessage
                  ? busyMessage
                  : selectedImageCount > 0
                    ? `Download Selected ZIP (${selectedImageCount})`
                    : "Download Selected ZIP"}
              </button>
            </div>
          </section>

          <section className={`${panelClass} p-3 sm:p-4`}>
            <div className="space-y-3">
              <div className="rounded-2xl border-[3px] border-[#e6e6e6] bg-[#fafafc] p-3">
                <p className="text-sm font-semibold text-[#111111]">
                  {isSharedEditing
                    ? `Shared Edit Mode for ${selectedImageCount} images`
                    : activeImage
                      ? `Single Edit Mode for ${activeImage.fileName}`
                      : "Default Edit Mode"}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-black/58">
                  {isSharedEditing
                    ? "Left-side changes are shared by the selected set."
                    : activeImage
                      ? "This image keeps its own settings until you double-click it in the collection."
                      : "These values seed new uploads and the next shared selection."}
                </p>
              </div>

              <div>
                <FieldLabel htmlFor="title">Main Title</FieldLabel>
                <textarea
                  className="min-h-[76px] w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-lg font-semibold text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="title"
                  maxLength={120}
                  onChange={(event) => setTextField("title", event.target.value)}
                  onFocus={() => setActiveField("title")}
                  placeholder="Han River"
                  ref={setFieldRef("title")}
                  value={form.title}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem] xl:grid-cols-1">
                <div>
                  <FieldLabel htmlFor="template-modern">Template</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {coverTemplates.map((template) => (
                      <TemplateCard
                        active={template.id === form.template}
                        key={template.id}
                        onSelect={(templateId) =>
                          updateFormState((current) => ({
                            ...current,
                            template: templateId
                          }))
                        }
                        template={template}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-black/52">
                    {
                      coverTemplates.find((template) => template.id === form.template)
                        ?.description
                    }
                  </p>
                </div>

                <div>
                  <FieldLabel htmlFor="size">Resolution</FieldLabel>
                  <select
                    className="w-full rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-3 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#027fff]"
                    id="size"
                    onChange={(event) =>
                      updateFormState((current) => ({
                        ...current,
                        size: Number(event.target.value)
                      }))
                    }
                    value={form.size}
                  >
                    {coverSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size} x {size}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-black/52">
                    Shared by preview, browser export, ZIP export, and CLI.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem] xl:grid-cols-1">
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
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-8">
                    {quickSymbols.map((symbol) => (
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border-[3px] border-[#e6e6e6] bg-white text-base font-semibold text-[#111111] transition hover:border-[#cfd6df] hover:bg-[#fefefe]"
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

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <OptionToggle
                    checked={form.shadow}
                    description="Adds contrast on brighter photos."
                    label="Use shadow"
                    onChange={(shadow) =>
                      updateFormState((current) => ({
                        ...current,
                        shadow
                      }))
                    }
                  />
                  <OptionToggle
                    checked={form.blur}
                    description="Softens the background treatment."
                    label="Use blur"
                    onChange={(blur) =>
                      updateFormState((current) => ({
                        ...current,
                        blur
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="space-y-4 xl:flex xl:h-[calc(100svh-2rem)] xl:min-h-0 xl:flex-col">
          <section className={`${panelClass} shrink-0 p-3 sm:p-4`}>
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
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/62 sm:text-base sm:leading-7">
              Local workflow, shared renderer, smaller utility panels, and the
              same image export path for browser and CLI.
            </p>
          </section>

          <section
            className={`${panelClass} p-4 sm:p-5 xl:flex-1 xl:min-h-0 xl:overflow-hidden`}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              void handleFiles(event.dataTransfer.files);
            }}
          >
            <div className="flex flex-col gap-4 xl:h-full xl:min-h-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    Self Upload
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#111111] sm:text-2xl">
                    Drag multiple photos here or choose from disk.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-black/58">
                    Single click previews. Double-click adds or removes that
                    image from the shared selected group.
                  </p>
                </div>
                <label
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border-[3px] border-[#027fff] bg-[#027fff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0]"
                  htmlFor={inputId}
                >
                  Choose Images
                </label>
              </div>

              <input
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                id={inputId}
                onChange={(event) => {
                  void handleFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
                multiple
                type="file"
              />

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-2xl border-[3px] border-dashed border-[#d4d4d8] bg-[#fafafc] p-4">
                  <div className="grid gap-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
                    <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-xl bg-[#eceef2]">
                      {activeImage ? (
                        <img
                          alt="Uploaded source"
                          className="h-full w-full object-cover"
                          src={activeImage.dataUrl}
                        />
                      ) : (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                          none
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111111]">
                        {activeImage ? activeImage.fileName : "No image selected"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-black/58">
                        {activeImage
                          ? activeImage.selected
                            ? `${selectedImageCount} images now share the left-side settings.`
                            : "This image keeps its own settings until you double-click it."
                          : "JPG, PNG, WebP, and AVIF stay local in your browser."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-[3px] border-[#e6e6e6] bg-[#fafafc] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                      disabled={images.length === 0}
                      onClick={() => setAllSelections(true)}
                      type="button"
                    >
                      Select All
                    </button>
                    <button
                      className="rounded-xl border-[3px] border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                      disabled={images.length === 0}
                      onClick={() => setAllSelections(false)}
                      type="button"
                    >
                      Deselect All
                    </button>
                    <button
                      className="rounded-xl border-[3px] border-[#f0d2ca] bg-[#fff6f4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a24a32] transition hover:border-[#e6beb2] hover:bg-white disabled:cursor-not-allowed disabled:text-[#d3a69b]"
                      disabled={images.length === 0}
                      onClick={clearImages}
                      type="button"
                    >
                      Clear All
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-black/58">
                    Draft images keep their own text and template. Selected
                    images share the left-side settings.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border-[3px] border-[#e6e6e6] bg-white p-4 xl:flex-1 xl:min-h-0 xl:overflow-hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      Image Collection
                    </p>
                    <p className="mt-1 text-sm leading-6 text-black/58">
                      Click for preview. Double-click for selected mode.
                    </p>
                  </div>
                  <span className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
                    {totalImageCount > 0 ? `${totalImageCount} uploaded` : "Empty"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:max-h-full xl:grid-cols-3 xl:overflow-y-auto xl:pr-1 2xl:grid-cols-4">
                  {images.length > 0 ? (
                    images.map((imageItem) => {
                      const isActive = imageItem.id === activeImageId;

                      return (
                        <div
                          className={[
                            "overflow-hidden rounded-2xl border-[3px] bg-[#fafafc] transition",
                            imageItem.selected
                              ? "border-[#111111] shadow-[0_14px_28px_rgba(17,17,17,0.08)]"
                              : isActive
                                ? "border-[#027fff] shadow-[0_12px_28px_rgba(2,127,255,0.12)]"
                                : "border-[#e6e6e6]"
                          ].join(" ")}
                          key={imageItem.id}
                        >
                          <button
                            className="block w-full"
                            onClick={() => setActiveImageId(imageItem.id)}
                            onDoubleClick={() => {
                              setActiveImageId(imageItem.id);
                              toggleImageSelection(imageItem.id);
                            }}
                            type="button"
                          >
                            <img
                              alt={imageItem.fileName}
                              className="h-28 w-full object-cover"
                              src={imageItem.dataUrl}
                            />
                          </button>
                          <div className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {isActive ? (
                                <span className="rounded-lg bg-[#ebf5ff] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#027fff]">
                                  Active
                                </span>
                              ) : null}
                              {imageItem.selected ? (
                                <span className="rounded-lg bg-[#111111] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                                  Selected
                                </span>
                              ) : (
                                <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/46">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="mt-2 truncate text-sm font-semibold text-[#111111]">
                              {imageItem.fileName}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-black/46">
                              {imageItem.selected
                                ? "Uses the shared title, template, and effects from the left panel."
                                : "Keeps its own title, template, and effects until you double-click it."}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border-[3px] border-dashed border-[#d8d8de] bg-[#fafafc] px-4 py-6 text-sm leading-6 text-black/52 sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                      Upload multiple images to build a batch. Each card keeps
                      its own settings until you move it into the shared selected
                      group with a double-click.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <details className={`${panelClass} shrink-0`}>
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#111111] sm:px-5 sm:py-4">
              CLI parity and rendering notes
            </summary>
            <div className="border-t-[3px] border-[#e6e6e6] p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <section>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    CLI Parity
                  </p>
                  <code className="mt-3 block break-all whitespace-pre-wrap rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-4 text-sm leading-7 text-black/72">
                    {cliCommand}
                  </code>
                </section>

                <section>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    Rendering Notes
                  </p>
                  <div className="mt-3 grid gap-3 text-sm leading-6 text-black/58">
                    <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                      Full-bleed image crops stay inside the shared SVG renderer.
                    </div>
                    <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                      Text wraps and shrinks until it fits each template safe area.
                    </div>
                    <div className="rounded-xl border-[3px] border-[#e6e6e6] bg-[#fafafc] px-4 py-3">
                      Blur and shadow remain optional and match the CLI flags.
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
