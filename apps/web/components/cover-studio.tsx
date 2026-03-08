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
  createUploadStateFromFile,
  fetchImageUrlAsUpload,
  svgToPngBlob,
  zipFilesToBlob,
  type UploadedImageState
} from "../lib/browser-image";
import {
  languageOptions,
  languageStorageKey,
  uiText,
  type Language
} from "../lib/i18n";

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
  focusX: number;
  focusY: number;
  draftForm: FormState;
}

type EditableField = keyof Pick<
  FormState,
  "header" | "title" | "subtitle" | "date" | "footer"
>;

type SourceMode = "upload" | "url";

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
  "rounded-[22px] border-2 border-[#e6e6e6] bg-white shadow-[0_1px_0_rgba(255,255,255,0.7)]";

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

function BrandLogo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f2f4f8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.08)]">
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          fill="url(#logo-gradient)"
          height="18"
          rx="6"
          width="18"
          x="5"
          y="5"
        />
        <path
          d="M10.5 10.5H17.5M10.5 14H17.5M10.5 17.5H14.5"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <circle cx="19.5" cy="18.5" fill="#ffffff" r="1.5" />
        <defs>
          <linearGradient id="logo-gradient" x1="5" x2="23" y1="5" y2="23">
            <stop stopColor="#0F172A" />
            <stop offset="0.55" stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label
      className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45"
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
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-[18px] border-2 border-[#e6e6e6] bg-[#fcfcfd] p-2.5 transition hover:border-[#d4d4d8]">
      <span className="block min-w-0">
        <span className="block text-[13px] font-semibold text-[#111111]">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-[1.35] text-black/52">
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

function TemplateCard({
  template,
  label,
  previewAlt,
  active,
  onSelect
}: {
  template: CoverTemplate;
  label: string;
  previewAlt: string;
  active: boolean;
  onSelect: (template: CoverTemplate) => void;
}) {
  return (
    <button
      className={[
        "rounded-[18px] border-2 p-1.5 text-left transition",
        active
          ? "border-[#027fff] bg-[#f7fbff]"
          : "border-[#e6e6e6] bg-white hover:border-[#d3d3d7]"
      ].join(" ")}
      onClick={() => onSelect(template)}
      type="button"
    >
      <div className="overflow-hidden rounded-xl bg-[#eceef2]">
        <img
          alt={previewAlt}
          className="block h-14 w-full object-cover"
          src={templatePreviewImages[template]}
        />
      </div>
      <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111111]">
        {label}
      </p>
    </button>
  );
}

function EmptyPreview({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#d8d8de] bg-[#fafafc] p-5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/38">
        {title}
      </p>
      <p className="mt-2 max-w-[13rem] break-keep text-xs leading-5 text-black/55">
        {description}
      </p>
    </div>
  );
}

function quoteCliValue(value: string) {
  return JSON.stringify(value);
}

function createUploadId(seed: string, index: number) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${index}`;

  return `${seed}-${randomPart}`;
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function cloneFormState(value: FormState): FormState {
  return {
    ...value
  };
}

function parseUrlLines(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .filter((item) => {
      try {
        const parsed = new URL(item);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    });
}

function focusToSliderValue(value: number) {
  return Math.round((value - 0.5) * 200);
}

function sliderValueToFocus(value: number) {
  return (value + 100) / 200;
}

export function CoverStudio() {
  const inputId = useId();
  const [language, setLanguage] = useState<Language>("en");
  const [hasLoadedLanguage, setHasLoadedLanguage] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
  const [urlInput, setUrlInput] = useState("");
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
  const [busyAction, setBusyAction] = useState<
    "upload" | "url" | "single" | "batch" | null
  >(null);
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
  const activeSelectedIndex = activeImage
    ? selectedImages.findIndex((candidate) => candidate.id === activeImage.id)
    : -1;
  const form = activeImage
    ? activeImage.selected
      ? sharedForm
      : activeImage.draftForm
    : sharedForm;
  const deferredForm = useDeferredValue(form);
  const copy = uiText[language];
  const fieldLabels: Record<EditableField, string> = {
    header: copy.fields.header,
    title: copy.fields.title,
    subtitle: copy.fields.subtitle,
    date: copy.fields.date,
    footer: copy.fields.footer
  };

  useEffect(() => {
    const storedLanguage =
      typeof window !== "undefined"
        ? window.localStorage.getItem(languageStorageKey)
        : null;

    if (storedLanguage === "ko" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    } else if (typeof window !== "undefined" && window.navigator.language.startsWith("ko")) {
      setLanguage("ko");
    }

    setHasLoadedLanguage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedLanguage || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(languageStorageKey, language);
  }, [hasLoadedLanguage, language]);

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
        image: {
          src: activeImage.dataUrl,
          mimeType: activeImage.mimeType,
          width: activeImage.width,
          height: activeImage.height,
          focusX: activeImage.focusX,
          focusY: activeImage.focusY
        },
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
        error: error instanceof Error ? error.message : copy.previewError
      }));
    }
  }, [activeImage, copy.previewError, deferredForm]);

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
    if (!activeImage || activeImage.selected) {
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

  function updateActiveImageFocus(nextFocus: Partial<Pick<UploadedImageItem, "focusX" | "focusY">>) {
    if (!activeImage) {
      return;
    }

    setImages((current) =>
      current.map((imageItem) =>
        imageItem.id === activeImage.id
          ? {
              ...imageItem,
              ...nextFocus
            }
          : imageItem
      )
    );
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
    ).replace(/\.png$/, "");
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

  function focusSelectedGroup() {
    if (selectedImages[0]) {
      setActiveImageId(selectedImages[0].id);
    }
  }

  function moveSelectedPreview(direction: "previous" | "next") {
    if (selectedImages.length === 0) {
      return;
    }

    const currentIndex = selectedImages.findIndex(
      (imageItem) => imageItem.id === activeImageId
    );
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      direction === "next"
        ? (safeIndex + 1) % selectedImages.length
        : (safeIndex - 1 + selectedImages.length) % selectedImages.length;

    setActiveImageId(selectedImages[nextIndex]?.id ?? null);
  }

  function appendUploads(uploads: UploadedImageItem[]) {
    setImages((current) => [...current, ...uploads]);
    setActiveImageId((current) => current ?? uploads[0]?.id ?? null);
    setPreview((current) => ({
      ...current,
      error: null
    }));
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
        error: copy.uploadError
      }));
      return;
    }

    setBusyAction("upload");
    setBusyMessage(copy.preparingImages(validFiles.length));

    try {
      const seedForm = cloneFormState(form);
      const uploads = await Promise.all(
        validFiles.map(async (file, index) => ({
          id: createUploadId(file.name, index),
          ...(await createUploadStateFromFile(file)),
          focusX: 0.5,
          focusY: 0.5,
          selected: false,
          draftForm: cloneFormState(seedForm)
        }))
      );

      appendUploads(uploads);
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : copy.readError
      }));
    } finally {
      setBusyMessage(null);
      setBusyAction(null);
    }
  }

  async function handleUrlImport() {
    const urls = parseUrlLines(urlInput);

    if (urls.length === 0) {
      setPreview((current) => ({
        ...current,
        error: copy.urlEmptyError
      }));
      return;
    }

    setBusyAction("url");
    setBusyMessage(copy.importingUrls(urls.length));

    try {
      const seedForm = cloneFormState(form);
      const uploads = await Promise.all(
        urls.map(async (url, index) => {
          const upload = await fetchImageUrlAsUpload(url);

          return {
            id: createUploadId(url, index),
            ...upload,
            focusX: 0.5,
            focusY: 0.5,
            selected: false,
            draftForm: cloneFormState(seedForm)
          };
        })
      );

      appendUploads(uploads);
      setUrlInput("");
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : copy.urlFetchError
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
    setBusyMessage(copy.exportCurrentBusy);

    try {
      const pngBlob = await svgToPngBlob(preview.svg, preview.width, preview.height);
      downloadBlob(pngBlob, createCoverFileName(activeImage, form));
    } catch (error) {
      setPreview((current) => ({
        ...current,
        error: error instanceof Error ? error.message : copy.pngError
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
    setBusyMessage(copy.exportBatchBusy(selectedImages.length));

    try {
      const files: Array<{ fileName: string; blob: Blob }> = [];

      for (const imageItem of selectedImages) {
        const selectedForm = sharedForm;
        const renderResult = renderCoverSvg({
          image: {
            src: imageItem.dataUrl,
            mimeType: imageItem.mimeType,
            width: imageItem.width,
            height: imageItem.height,
            focusX: imageItem.focusX,
            focusY: imageItem.focusY
          },
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
        error: error instanceof Error ? error.message : copy.zipError
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
    activeImage && (activeImage.focusX !== 0.5 || activeImage.focusY !== 0.5)
      ? `--focus-x ${Math.round((activeImage.focusX ?? 0.5) * 100)} --focus-y ${Math.round((activeImage.focusY ?? 0.5) * 100)}`
      : "",
    form.shadow ? "--shadow" : "",
    form.blur ? "--blur" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main
      className="mx-auto flex max-w-[1380px] flex-col px-3 py-3 sm:px-4 lg:px-5 xl:pb-5"
      data-language={language}
      lang={language}
    >
      <header className={`${panelClass} mb-3 shrink-0 p-3 sm:p-4`}>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <BrandLogo />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/42">
                {copy.pageEyebrow}
              </p>
              <h1 className="mt-1 break-keep text-[1.32rem] font-semibold tracking-[-0.055em] text-[#111111] sm:text-[1.7rem]">
                {copy.pageTitle}
              </h1>
              <p className="mt-1 max-w-2xl break-keep text-[13px] leading-5 text-black/58 sm:text-sm">
                {copy.pageDescription}
              </p>
            </div>
          </div>

          <div className="w-full max-w-[10rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/42">
              {copy.language}
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {languageOptions.map((option) => (
                <button
                  className={[
                    "rounded-xl border-2 px-3 py-1.5 text-[13px] font-semibold transition",
                    language === option.value
                      ? "border-[#027fff] bg-[#f7fbff] text-[#027fff]"
                      : "border-[#e6e6e6] bg-white text-[#111111] hover:border-[#d3d3d7]"
                  ].join(" ")}
                  key={option.value}
                  onClick={() => setLanguage(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] xl:items-start">
        <aside className="grid gap-3 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:block xl:self-start xl:space-y-3">
          <section className={`${panelClass} p-2.5 sm:p-3 xl:sticky xl:top-3`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/42">
                  {copy.preview}
                </p>
                <p className="mt-1 truncate text-[13px] text-black/58">
                  {activeImage ? activeImage.fileName : copy.noActiveImage}
                </p>
              </div>
              <span className="rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/42">
                {form.size} x {form.size}
              </span>
            </div>

            <div className="mt-2 flex min-h-[10rem] items-center justify-center overflow-hidden rounded-[22px] bg-[#eef0f4] p-2 sm:min-h-[11.5rem] md:min-h-[12.5rem] xl:min-h-[13.5rem]">
              {preview.url ? (
                <div className="relative flex items-center justify-center">
                  <img
                    alt=""
                    className="absolute inset-[-12%] h-[124%] w-[124%] scale-105 rounded-[36px] object-cover blur-3xl opacity-60"
                    src={activeImage?.dataUrl ?? preview.url}
                  />
                  <img
                    alt={copy.coverPreviewAlt}
                    className="relative h-[10.25rem] w-[10.25rem] rounded-[24px] object-cover shadow-[0_20px_48px_rgba(15,23,42,0.18)] sm:h-[11.5rem] sm:w-[11.5rem] md:h-[12.5rem] md:w-[12.5rem] xl:h-[13.5rem] xl:w-[13.5rem]"
                    src={preview.url}
                  />
                </div>
              ) : (
                <EmptyPreview
                  description={copy.noPreviewDescription}
                  title={copy.noPreviewTitle}
                />
              )}
            </div>

            <div className="mt-2 rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] p-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#111111]">
                    {copy.position}
                  </p>
                  <p className="mt-0.5 break-keep text-[11px] leading-4 text-black/55">
                    {copy.positionDescription}
                  </p>
                </div>
                <button
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42 transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:text-black/25"
                  disabled={!activeImage}
                  onClick={() => {
                    updateActiveImageFocus({
                      focusX: 0.5,
                      focusY: 0.5
                    });
                  }}
                  type="button"
                >
                  {copy.resetPosition}
                </button>
              </div>

              <div className="mt-2.5 grid gap-2.5">
                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-black/42">
                    <span>{copy.horizontal}</span>
                    <span>
                      {activeImage ? focusToSliderValue(activeImage.focusX) : 0}
                    </span>
                  </span>
                  <input
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d9dee8]"
                    disabled={!activeImage}
                    max={100}
                    min={-100}
                    onChange={(event) =>
                      updateActiveImageFocus({
                        focusX: sliderValueToFocus(Number(event.target.value))
                      })
                    }
                    step={1}
                    type="range"
                    value={activeImage ? focusToSliderValue(activeImage.focusX) : 0}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-black/42">
                    <span>{copy.vertical}</span>
                    <span>
                      {activeImage ? focusToSliderValue(activeImage.focusY) : 0}
                    </span>
                  </span>
                  <input
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d9dee8]"
                    disabled={!activeImage}
                    max={100}
                    min={-100}
                    onChange={(event) =>
                      updateActiveImageFocus({
                        focusY: sliderValueToFocus(Number(event.target.value))
                      })
                    }
                    step={1}
                    type="range"
                    value={activeImage ? focusToSliderValue(activeImage.focusY) : 0}
                  />
                </label>
              </div>
            </div>

            {selectedImageCount > 0 ? (
              <div className="mt-2 rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111111]">
                      {copy.selectedGroup}
                    </p>
                    <p className="mt-0.5 break-keep text-[11px] leading-4 text-black/55">
                      {copy.selectedGroupHint(activeSelectedIndex, selectedImageCount)}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
                    {copy.shared}
                  </span>
                </div>

                <div className="mt-2.5 grid gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)] md:grid-cols-1 xl:grid-cols-[auto_auto_minmax(0,1fr)]">
                  <button
                    className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                    disabled={selectedImageCount < 2}
                    onClick={() => moveSelectedPreview("previous")}
                    type="button"
                  >
                    {copy.previous}
                  </button>
                  <button
                    className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                    disabled={selectedImageCount < 2}
                    onClick={() => moveSelectedPreview("next")}
                    type="button"
                  >
                    {copy.next}
                  </button>
                  <button
                    className="rounded-xl border-2 border-[#027fff] bg-[#f7fbff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#027fff] transition hover:border-[#0167d0] hover:text-[#0167d0] disabled:cursor-not-allowed disabled:border-[#d6e9ff] disabled:text-[#8abfff]"
                    disabled={activeSelectedIndex >= 0}
                    onClick={focusSelectedGroup}
                    type="button"
                  >
                    {activeSelectedIndex >= 0
                      ? copy.selectedGroupFocused
                      : copy.focusSelectedGroup}
                  </button>
                </div>
              </div>
            ) : null}

            {preview.error ? (
              <div className="mt-2 rounded-xl border-2 border-[#f1c7bc] bg-[#fff4f1] px-3 py-2.5 text-sm text-[#a24a32]">
                {preview.error}
              </div>
            ) : null}

            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#027fff] bg-[#027fff] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
                disabled={!preview.svg || Boolean(busyMessage)}
                onClick={() => {
                  void handleDownload();
                }}
                type="button"
              >
                {busyAction === "single" && busyMessage
                  ? busyMessage
                  : copy.downloadCurrentPng}
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#d7dbe3] bg-[#fafafc] px-4 py-2.5 text-[13px] font-semibold text-[#111111] transition hover:border-[#c3cad5] hover:bg-white disabled:cursor-not-allowed disabled:border-[#e4e8ef] disabled:text-black/35"
                disabled={selectedImageCount === 0 || Boolean(busyMessage)}
                onClick={() => {
                  void handleBatchDownload();
                }}
                type="button"
              >
                {busyAction === "batch" && busyMessage
                  ? busyMessage
                  : copy.downloadSelectedZip(selectedImageCount)}
              </button>
            </div>
          </section>

          <section className={`${panelClass} p-2.5 sm:p-3`}>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/42">
                  {copy.settings}
                </p>
                <p className="mt-1.5 break-keep text-[13px] leading-5 text-black/58">
                  {copy.settingsDescription}
                </p>
              </div>

              <div>
                <FieldLabel htmlFor="title">{copy.fields.title}</FieldLabel>
                <textarea
                  className="min-h-[56px] w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[16px] font-semibold leading-[1.2] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                  id="title"
                  maxLength={120}
                  onChange={(event) => setTextField("title", event.target.value)}
                  onFocus={() => setActiveField("title")}
                  placeholder={copy.placeholders.title}
                  ref={setFieldRef("title")}
                  value={form.title}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="header">{copy.fields.header}</FieldLabel>
                  <input
                    className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                    id="header"
                    maxLength={48}
                    onChange={(event) => setTextField("header", event.target.value)}
                    onFocus={() => setActiveField("header")}
                    placeholder={copy.placeholders.header}
                    ref={setFieldRef("header")}
                    type="text"
                    value={form.header}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="footer">{copy.fields.footer}</FieldLabel>
                  <input
                    className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                    id="footer"
                    maxLength={48}
                    onChange={(event) => setTextField("footer", event.target.value)}
                    onFocus={() => setActiveField("footer")}
                    placeholder={copy.placeholders.footer}
                    ref={setFieldRef("footer")}
                    type="text"
                    value={form.footer}
                  />
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="subtitle">{copy.fields.subtitle}</FieldLabel>
                  <input
                    className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-medium text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                    id="subtitle"
                    maxLength={80}
                    onChange={(event) => setTextField("subtitle", event.target.value)}
                    onFocus={() => setActiveField("subtitle")}
                    placeholder={copy.placeholders.subtitle}
                    ref={setFieldRef("subtitle")}
                    type="text"
                    value={form.subtitle}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="date">{copy.fields.date}</FieldLabel>
                  <input
                    className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-medium text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                    id="date"
                    maxLength={80}
                    onChange={(event) => setTextField("date", event.target.value)}
                    onFocus={() => setActiveField("date")}
                    placeholder={copy.placeholders.date}
                    ref={setFieldRef("date")}
                    type="text"
                    value={form.date}
                  />
                </div>
              </div>

              <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_10rem] xl:grid-cols-1">
                <div>
                  <FieldLabel htmlFor="template-modern">{copy.template}</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {coverTemplates.map((template) => (
                      <TemplateCard
                        active={template.id === form.template}
                        key={template.id}
                        label={copy.templates[template.id].label}
                        onSelect={(templateId) =>
                          updateFormState((current) => ({
                            ...current,
                            template: templateId
                          }))
                        }
                        previewAlt={copy.templatePreviewAlt(
                          copy.templates[template.id].label
                        )}
                        template={template.id}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 break-keep text-[11px] leading-4 text-black/52">
                    {copy.templates[form.template].description}
                  </p>
                </div>

                <div>
                  <FieldLabel htmlFor="size">{copy.resolution}</FieldLabel>
                  <select
                    className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#111111] outline-none transition focus:border-[#027fff]"
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
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#e6e6e6] bg-[#fafafc] p-2.5">
                <div>
                  <p className="text-[13px] font-semibold text-[#111111]">
                    {copy.quickSymbols}
                  </p>
                  <p className="mt-0.5 text-[11px] text-black/52">
                    {copy.insertsInto(fieldLabels[activeField])}
                  </p>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-8">
                  {quickSymbols.map((symbol) => (
                    <button
                      className="inline-flex h-7 items-center justify-center rounded-xl border-2 border-[#e6e6e6] bg-white text-[14px] font-semibold text-[#111111] transition hover:border-[#cfd6df] hover:bg-[#fefefe]"
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

              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  {copy.effects}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <OptionToggle
                    checked={form.shadow}
                    description={copy.useShadowDescription}
                    label={copy.useShadow}
                    onChange={(shadow) =>
                      updateFormState((current) => ({
                        ...current,
                        shadow
                      }))
                    }
                  />
                  <OptionToggle
                    checked={form.blur}
                    description={copy.useBlurDescription}
                    label={copy.useBlur}
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

        <section className="space-y-3 xl:flex xl:min-h-0 xl:flex-col">
          <section
            className={`${panelClass} p-3 sm:p-4 xl:flex-1 xl:min-h-0 xl:overflow-hidden`}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (sourceMode === "upload") {
                void handleFiles(event.dataTransfer.files);
              }
            }}
          >
            <div className="flex h-full min-h-0 flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    {copy.images}
                  </p>
                  <h2 className="mt-1.5 break-keep text-[1.1rem] font-semibold tracking-[-0.035em] text-[#111111] sm:text-[1.35rem]">
                    {copy.imagesTitle}
                  </h2>
                  <p className="mt-1 max-w-xl break-keep text-[13px] leading-5 text-black/58">
                    {copy.imagesDescription}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 lg:grid-cols-[13rem_minmax(0,1fr)]">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {(["upload", "url"] as const).map((mode) => (
                    <button
                      className={[
                        "rounded-xl border-2 px-3 py-2.5 text-left text-[13px] font-semibold transition",
                        sourceMode === mode
                          ? "border-[#027fff] bg-[#f7fbff] text-[#027fff]"
                          : "border-[#e6e6e6] bg-white text-[#111111] hover:border-[#d3d3d7]"
                      ].join(" ")}
                      key={mode}
                      onClick={() => setSourceMode(mode)}
                      type="button"
                    >
                      {copy.sourceModes[mode]}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border-2 border-dashed border-[#d4d4d8] bg-[#fafafc] p-3">
                  {sourceMode === "upload" ? (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111111]">
                          {copy.sourceModes.upload}
                        </p>
                        <p className="mt-0.5 break-keep text-[13px] leading-5 text-black/58">
                          {copy.uploadDropHint}
                        </p>
                      </div>
                      <label
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-[#027fff] bg-[#027fff] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0]"
                        htmlFor={inputId}
                      >
                        {busyAction === "upload" && busyMessage
                          ? busyMessage
                          : copy.chooseImages}
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111111]">
                          {copy.urlTitle}
                        </p>
                        <p className="mt-0.5 break-keep text-[13px] leading-5 text-black/58">
                          {copy.urlDescription}
                        </p>
                      </div>
                      <textarea
                        className="min-h-[92px] w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
                        onChange={(event) => setUrlInput(event.target.value)}
                        placeholder={copy.urlPlaceholder}
                        value={urlInput}
                      />
                      <button
                        className="inline-flex items-center justify-center rounded-xl border-2 border-[#027fff] bg-[#027fff] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
                        disabled={Boolean(busyMessage)}
                        onClick={() => {
                          void handleUrlImport();
                        }}
                        type="button"
                      >
                        {busyAction === "url" && busyMessage
                          ? busyMessage
                          : copy.addUrls}
                      </button>
                    </div>
                  )}
                </div>
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

              <div className="rounded-2xl border-2 border-[#e6e6e6] bg-[#fafafc] p-3 xl:flex-1 xl:min-h-0 xl:overflow-hidden">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      {copy.collection}
                    </p>
                    <p className="mt-0.5 break-keep text-[13px] leading-5 text-black/58">
                      {copy.collectionHint}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
                      {copy.uploadedCount(totalImageCount)}
                    </span>
                    {selectedImageCount > 0 ? (
                      <span className="rounded-xl border-2 border-[#111111] bg-[#111111] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                        {copy.selectedProgress(activeSelectedIndex, selectedImageCount)}
                      </span>
                    ) : null}
                    <button
                      className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                      disabled={images.length === 0}
                      onClick={() => setAllSelections(true)}
                      type="button"
                    >
                      {copy.selectAll}
                    </button>
                    <button
                      className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                      disabled={images.length === 0}
                      onClick={() => setAllSelections(false)}
                      type="button"
                    >
                      {copy.deselectAll}
                    </button>
                    <button
                      className="rounded-xl border-2 border-[#f0d2ca] bg-[#fff6f4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a24a32] transition hover:border-[#e6beb2] hover:bg-white disabled:cursor-not-allowed disabled:text-[#d3a69b]"
                      disabled={images.length === 0}
                      onClick={clearImages}
                      type="button"
                    >
                      {copy.clearAll}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:max-h-full xl:grid-cols-3 xl:overflow-y-auto xl:pr-1 2xl:grid-cols-4">
                  {images.length > 0 ? (
                    images.map((imageItem) => {
                      const isActive = imageItem.id === activeImageId;
                      const selectionIndex = selectedImages.findIndex(
                        (candidate) => candidate.id === imageItem.id
                      );

                      return (
                        <div
                          className={[
                            "overflow-hidden rounded-2xl border-2 bg-[#fafafc] transition",
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
                              className="h-20 w-full object-cover"
                              src={imageItem.dataUrl}
                            />
                          </button>
                          <div className="p-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {isActive ? (
                                <span className="rounded-lg bg-[#ebf5ff] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#027fff]">
                                  {copy.active}
                                </span>
                              ) : null}
                              <span
                                className={[
                                  "rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                                  imageItem.selected
                                    ? "bg-[#111111] text-white"
                                    : "bg-white text-black/46"
                                ].join(" ")}
                              >
                                {imageItem.selected ? copy.selected : copy.draft}
                              </span>
                              {selectionIndex >= 0 ? (
                                <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/46">
                                  {copy.selectedIndex(selectionIndex + 1)}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1.5 truncate text-[13px] font-semibold text-[#111111]">
                              {imageItem.fileName}
                            </p>
                            <p className="mt-0.5 break-keep text-[11px] leading-4 text-black/46">
                              {imageItem.selected
                                ? isActive
                                  ? copy.cardActiveHint
                                  : copy.cardSelectedHint
                                : copy.cardDraftHint}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-[#d8d8de] bg-[#fafafc] px-4 py-5 text-[13px] leading-5 text-black/52 sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                      {copy.emptyCollection}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <details className={`${panelClass} shrink-0`}>
            <summary className="cursor-pointer list-none px-4 py-2.5 text-[13px] font-semibold text-[#111111] sm:px-4 sm:py-3">
              {copy.detailsSummary}
            </summary>
            <div className="border-t-2 border-[#e6e6e6] p-3 sm:p-4">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <section>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    {copy.cliParity}
                  </p>
                  <code className="mt-2.5 block break-all whitespace-pre-wrap rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-3 py-3 text-[12px] leading-6 text-black/72">
                    {cliCommand}
                  </code>
                </section>

                <section>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
                    {copy.renderingNotes}
                  </p>
                  <div className="mt-2.5 grid gap-2.5 text-[13px] leading-5 text-black/58">
                    <div className="rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-3 py-2.5">
                      {copy.renderingNoteOne}
                    </div>
                    <div className="rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-3 py-2.5">
                      {copy.renderingNoteTwo}
                    </div>
                    <div className="rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-3 py-2.5">
                      {copy.renderingNoteThree}
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
