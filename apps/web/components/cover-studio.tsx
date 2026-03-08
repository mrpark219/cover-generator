"use client";

import { renderCoverSvg } from "@cover-generator/cover-renderer";
import {
  buildOutputFileName,
  coverSizeOptions,
  coverTemplates,
  defaultCoverSize,
  defaultTextColor,
  normalizeHexColor,
  slugifyFilePart,
  supportedMimeTypes,
  type CoverTemplate
} from "@cover-generator/shared";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import {
  createUploadStateFromFile,
  downloadBlob,
  fetchImageUrlAsUpload,
  svgToPngBlob,
  zipFilesToBlob,
  type UploadedImageState
} from "../lib/browser-image";
import { languageStorageKey, uiText, type Language } from "../lib/i18n";
import {
  initialFormState,
  templateFieldLayout
} from "./studio/constants";
import {
  DetailsSection,
  HeaderSection,
  ImagesSection,
  PreviewSection,
  SettingsSection
} from "./studio/sections";
import type {
  EditableField,
  FormState,
  ImageGroup,
  PreviewState,
  SourceMode,
  UploadedImageItem
} from "./studio/types";

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

function createGroupId(index: number) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${index}`;

  return `group-${randomPart}`;
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function resolveFormTextValue(value: string, fallback: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function cloneFormState(value: FormState): FormState {
  return {
    ...value
  };
}

function parseUrlLines(value: string) {
  return value
    .split(/\n+|,+/)
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

function sliderValueToFocus(value: number) {
  return (value + 100) / 200;
}

function parseBooleanQueryValue(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function parseTemplateQueryValue(value: string | null) {
  if (!value) {
    return null;
  }

  return coverTemplates.some((template) => template.id === value)
    ? (value as CoverTemplate)
    : null;
}

function parseSizeQueryValue(value: string | null) {
  if (!value) {
    return null;
  }

  const size = Number(value);
  return coverSizeOptions.some((candidate) => candidate === size) ? size : null;
}

function parseTextColorQueryValue(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = normalizeHexColor(value, "");
  return normalized ? normalized : null;
}

function collectImageUrlQueryValues(params: URLSearchParams) {
  const directValues = [
    ...params.getAll("imageUrl"),
    ...params.getAll("image"),
    ...params.getAll("url")
  ];
  const groupedValues = [
    params.get("imageUrls"),
    params.get("images"),
    params.get("urls")
  ].filter((value): value is string => typeof value === "string");

  return parseUrlLines([...directValues, ...groupedValues].join("\n"));
}

export function CoverStudio() {
  const inputId = useId();
  const queryAppliedRef = useRef(false);
  const [language, setLanguage] = useState<Language>("en");
  const [hasLoadedLanguage, setHasLoadedLanguage] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [activeField, setActiveField] = useState<EditableField>("title");
  const [groups, setGroups] = useState<ImageGroup[]>([]);
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
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
  const checkedImages = images.filter((candidate) => candidate.checked);
  const checkedImageCount = checkedImages.length;
  const activeGroup = groups.find((candidate) => candidate.id === activeGroupId) ?? null;
  const copy = uiText[language];
  const rawForm = activeGroup?.form ?? activeImage?.draftForm ?? initialFormState;
  const resolvedForm = {
    ...rawForm,
    header: resolveFormTextValue(rawForm.header, copy.placeholders.header),
    title: resolveFormTextValue(rawForm.title, copy.placeholders.title),
    subtitle: resolveFormTextValue(rawForm.subtitle, copy.placeholders.subtitle),
    date: resolveFormTextValue(rawForm.date, copy.placeholders.date),
    footer: resolveFormTextValue(rawForm.footer, copy.placeholders.footer),
    textColor: normalizeHexColor(rawForm.textColor, defaultTextColor)
  };
  const deferredForm = useDeferredValue(resolvedForm);
  const importingUrlsLabel = copy.importingUrls;
  const urlEmptyError = copy.urlEmptyError;
  const urlFetchError = copy.urlFetchError;

  const appendUploads = useCallback((uploads: UploadedImageItem[]) => {
    setImages((current) => [...current, ...uploads]);
    setActiveImageId((current) => current ?? uploads[0]?.id ?? null);
    setActiveGroupId(null);
    setPreview((current) => ({
      ...current,
      error: null
    }));
  }, []);

  const importUrlValues = useCallback(
    async (urls: string[], seedForm: FormState, shouldClearInput: boolean) => {
      if (urls.length === 0) {
        setPreview((current) => ({
          ...current,
          error: urlEmptyError
        }));
        return;
      }

      setBusyAction("url");
      setBusyMessage(importingUrlsLabel(urls.length));

      try {
        const uploads = await Promise.all(
          urls.map(async (url, index) => {
            const upload = await fetchImageUrlAsUpload(url);

            return {
              id: createUploadId(url, index),
              ...upload,
              focusX: 0.5,
              focusY: 0.5,
              checked: false,
              groupId: null,
              draftForm: cloneFormState(seedForm)
            };
          })
        );

        appendUploads(uploads);
        if (shouldClearInput) {
          setUrlInput("");
        }
      } catch (error) {
        setPreview((current) => ({
          ...current,
          error: error instanceof Error ? error.message : urlFetchError
        }));
      } finally {
        setBusyMessage(null);
        setBusyAction(null);
      }
    },
    [appendUploads, importingUrlsLabel, urlEmptyError, urlFetchError]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get("lang") ?? params.get("language");
    const storedLanguage = window.localStorage.getItem(languageStorageKey);

    if (queryLanguage === "ko" || queryLanguage === "en") {
      setLanguage(queryLanguage);
    } else if (storedLanguage === "ko" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    } else if (window.navigator.language.startsWith("ko")) {
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
    if (queryAppliedRef.current || typeof window === "undefined") {
      return;
    }

    queryAppliedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const nextForm = cloneFormState(initialFormState);
    const nextSourceMode = params.get("source");
    const imageUrls = collectImageUrlQueryValues(params);

    const header = params.get("header");
    const title = params.get("title");
    const subtitle = params.get("subtitle");
    const date = params.get("date") ?? params.get("meta");
    const footer = params.get("footer");
    const textColor = parseTextColorQueryValue(
      params.get("textColor") ?? params.get("color")
    );
    const template = parseTemplateQueryValue(params.get("template"));
    const size = parseSizeQueryValue(params.get("size"));
    const shadow = parseBooleanQueryValue(params.get("shadow"));
    const blur = parseBooleanQueryValue(params.get("blur"));

    if (header !== null) {
      nextForm.header = header;
    }
    if (title !== null) {
      nextForm.title = title;
    }
    if (subtitle !== null) {
      nextForm.subtitle = subtitle;
    }
    if (date !== null) {
      nextForm.date = date;
    }
    if (footer !== null) {
      nextForm.footer = footer;
    }
    if (textColor) {
      nextForm.textColor = textColor;
    }
    if (template) {
      nextForm.template = template;
    }
    if (size) {
      nextForm.size = size;
    }
    if (shadow !== null) {
      nextForm.shadow = shadow;
    }
    if (blur !== null) {
      nextForm.blur = blur;
    }

    setImages((current) =>
      current.map((imageItem, index) =>
        index === 0
          ? {
              ...imageItem,
              draftForm: cloneFormState(nextForm)
            }
          : imageItem
      )
    );

    if (nextSourceMode === "upload" || nextSourceMode === "url") {
      setSourceMode(nextSourceMode);
    }

    if (imageUrls.length > 0) {
      setSourceMode("url");
      setUrlInput(imageUrls.join("\n"));
      void importUrlValues(imageUrls, nextForm, false);
    }
  }, [importUrlValues]);

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
        textColor: deferredForm.textColor,
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
    if (activeGroup) {
      setGroups((current) =>
        current.map((group) =>
          group.id === activeGroup.id
            ? {
                ...group,
                form: updater(group.form)
              }
            : group
        )
      );
      return;
    }

    if (!activeImage) {
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

  function updateActiveImageFocus(
    nextFocus: Partial<Pick<UploadedImageItem, "focusX" | "focusY">>
  ) {
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
    const currentValue = rawForm[field];
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
    setGroups([]);
    setActiveImageId(null);
    setActiveGroupId(null);
    setPreview({
      url: null,
      svg: null,
      width: defaultCoverSize,
      height: defaultCoverSize,
      error: null
    });
  }

  function toggleImageChecked(imageId: string) {
    setImages((current) =>
      current.map((imageItem) =>
        imageItem.id === imageId
          ? {
              ...imageItem,
              checked: !imageItem.checked
            }
          : imageItem
      )
    );
  }

  function setAllChecked(checked: boolean) {
    setImages((current) =>
      current.map((imageItem) => ({
        ...imageItem,
        checked
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
        error: copy.uploadError
      }));
      return;
    }

    setBusyAction("upload");
    setBusyMessage(copy.preparingImages(validFiles.length));

    try {
      const seedForm = cloneFormState(rawForm);
      const uploads = await Promise.all(
        validFiles.map(async (file, index) => ({
          id: createUploadId(file.name, index),
          ...(await createUploadStateFromFile(file)),
          focusX: 0.5,
          focusY: 0.5,
          checked: false,
          groupId: null,
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
    await importUrlValues(urls, cloneFormState(rawForm), true);
  }

  function createGroup() {
    const groupIndex = groups.length + 1;
    const seedForm = cloneFormState(activeImage?.draftForm ?? initialFormState);
    const nextGroup: ImageGroup = {
      id: createGroupId(groupIndex),
      name: `Group ${groupIndex}`,
      form: seedForm
    };

    setGroups((current) => [...current, nextGroup]);
    setActiveGroupId(nextGroup.id);
  }

  function assignImageToGroup(imageId: string, groupId: string | null) {
    setImages((current) =>
      current.map((imageItem) =>
        imageItem.id === imageId
          ? {
              ...imageItem,
              groupId
            }
          : imageItem
      )
    );
  }

  function setActiveImage(imageId: string) {
    setActiveImageId(imageId);
    setActiveGroupId(null);
  }

  function setActiveGroup(groupId: string) {
    const firstImage = images.find((imageItem) => imageItem.groupId === groupId) ?? null;
    setActiveGroupId(groupId);
    setActiveImageId(firstImage?.id ?? activeImageId);
  }

  async function handleDownload() {
    if (!preview.svg || !activeImage) {
      return;
    }

    setBusyAction("single");
    setBusyMessage(copy.exportCurrentBusy);

    try {
      const pngBlob = await svgToPngBlob(preview.svg, preview.width, preview.height);
      downloadBlob(pngBlob, createCoverFileName(activeImage, resolvedForm));
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
    if (checkedImages.length === 0) {
      return;
    }

    setBusyAction("batch");
    setBusyMessage(copy.exportBatchBusy(checkedImages.length));

    try {
      const files: Array<{ fileName: string; blob: Blob }> = [];

      for (const imageItem of checkedImages) {
        const group = imageItem.groupId
          ? groups.find((candidate) => candidate.id === imageItem.groupId) ?? null
          : null;
        const effectiveForm = group?.form ?? imageItem.draftForm;
        const resolvedEffectiveForm = {
          ...effectiveForm,
          header: resolveFormTextValue(effectiveForm.header, copy.placeholders.header),
          title: resolveFormTextValue(effectiveForm.title, copy.placeholders.title),
          subtitle: resolveFormTextValue(effectiveForm.subtitle, copy.placeholders.subtitle),
          date: resolveFormTextValue(effectiveForm.date, copy.placeholders.date),
          footer: resolveFormTextValue(effectiveForm.footer, copy.placeholders.footer),
          textColor: normalizeHexColor(effectiveForm.textColor, defaultTextColor)
        };
        const renderResult = renderCoverSvg({
          image: {
            src: imageItem.dataUrl,
            mimeType: imageItem.mimeType,
            width: imageItem.width,
            height: imageItem.height,
            focusX: imageItem.focusX,
            focusY: imageItem.focusY
          },
          header: resolvedEffectiveForm.header,
          title: resolvedEffectiveForm.title,
          date: resolvedEffectiveForm.date,
          subtitle: resolvedEffectiveForm.subtitle,
          footer: resolvedEffectiveForm.footer,
          textColor: resolvedEffectiveForm.textColor,
          template: resolvedEffectiveForm.template,
          size: resolvedEffectiveForm.size,
          shadow: resolvedEffectiveForm.shadow,
          blur: resolvedEffectiveForm.blur
        });
        const pngBlob = await svgToPngBlob(
          renderResult.svg,
          renderResult.width,
          renderResult.height
        );

        files.push({
          fileName: createCoverFileName(imageItem, resolvedEffectiveForm),
          blob: pngBlob
        });
      }

      const zipBlob = await zipFilesToBlob(files);
      const zipName = `cover-generator-batch-${checkedImages.length}.zip`;
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
    `--header ${quoteCliValue(resolvedForm.header)}`,
    `--title ${quoteCliValue(resolvedForm.title)}`,
    `--date ${quoteCliValue(resolvedForm.date)}`,
    `--subtitle ${quoteCliValue(resolvedForm.subtitle)}`,
    `--footer ${quoteCliValue(resolvedForm.footer)}`,
    `--text-color ${resolvedForm.textColor}`,
    `--template ${resolvedForm.template}`,
    resolvedForm.size !== defaultCoverSize ? `--size ${resolvedForm.size}` : "",
    activeImage && (activeImage.focusX !== 0.5 || activeImage.focusY !== 0.5)
      ? `--focus-x ${Math.round((activeImage.focusX ?? 0.5) * 100)} --focus-y ${Math.round((activeImage.focusY ?? 0.5) * 100)}`
      : "",
    resolvedForm.shadow ? "--shadow" : "",
    resolvedForm.blur ? "--blur" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main
      className="mx-auto flex max-w-[1600px] flex-col px-3 py-3 sm:px-4 lg:px-5 xl:pb-5"
      data-language={language}
      lang={language}
    >
      <HeaderSection copy={copy} language={language} onLanguageChange={setLanguage} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,19rem)_minmax(0,24rem)_minmax(0,1fr)] xl:items-start">
        <aside className="space-y-3">
          <PreviewSection
            activeImage={activeImage}
            busyAction={busyAction}
            busyMessage={busyMessage}
            copy={copy}
            form={resolvedForm}
            onDownloadCurrent={() => {
              void handleDownload();
            }}
            onDownloadSelected={() => {
              void handleBatchDownload();
            }}
            onFocusXChange={(value) =>
              updateActiveImageFocus({
                focusX: sliderValueToFocus(value)
              })
            }
            onFocusYChange={(value) =>
              updateActiveImageFocus({
                focusY: sliderValueToFocus(value)
              })
            }
            onTextColorChange={(textColor) =>
              updateFormState((current) => ({
                ...current,
                textColor
              }))
            }
            onShadowChange={(shadow) =>
              updateFormState((current) => ({
                ...current,
                shadow
              }))
            }
            onBlurChange={(blur) =>
              updateFormState((current) => ({
                ...current,
                blur
              }))
            }
            onResetPosition={() =>
              updateActiveImageFocus({
                focusX: 0.5,
                focusY: 0.5
              })
            }
            preview={preview}
            selectedImageCount={checkedImageCount}
            totalImageCount={images.length}
          />
        </aside>

        <aside className="space-y-3">
          <SettingsSection
            activeField={activeField}
            copy={copy}
            fieldLayout={templateFieldLayout}
            onActiveFieldChange={setActiveField}
            onInsertSymbol={insertSymbol}
            onSizeChange={(size) =>
              updateFormState((current) => ({
                ...current,
                size
              }))
            }
            onTemplateChange={(template) =>
              updateFormState((current) => ({
                ...current,
                template
              }))
            }
            onTextFieldChange={setTextField}
            rawForm={rawForm}
            setFieldRef={setFieldRef}
          />
        </aside>

        <section className="space-y-3">
          <ImagesSection
            activeGroupId={activeGroupId}
            activeImageId={activeImageId}
            checkedImages={checkedImages}
            busyAction={busyAction}
            busyMessage={busyMessage}
            copy={copy}
            groups={groups}
            images={images}
            inputId={inputId}
            onAddGroup={createGroup}
            onAssignImageToGroup={assignImageToGroup}
            onClearAll={clearImages}
            onDeselectAll={() => setAllChecked(false)}
            onFiles={handleFiles}
            onImportUrls={() => {
              void handleUrlImport();
            }}
            onSelectAll={() => setAllChecked(true)}
            onSetActiveGroup={setActiveGroup}
            onSetActiveImage={setActiveImage}
            onSourceModeChange={setSourceMode}
            onToggleImageSelection={toggleImageChecked}
            onUrlInputChange={setUrlInput}
            sourceMode={sourceMode}
            urlInput={urlInput}
          />

          <DetailsSection cliCommand={cliCommand} copy={copy} />
        </section>
      </div>
    </main>
  );
}
