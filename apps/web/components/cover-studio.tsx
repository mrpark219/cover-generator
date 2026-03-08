"use client";
/* eslint-disable @next/next/no-img-element */

import {
  buildOutputFileName,
  coverTemplates,
  defaultTemplate,
  supportedMimeTypes,
  type CoverTemplate
} from "@cover-generator/shared";
import { renderCoverSvg } from "@cover-generator/cover-renderer";
import type { ReactNode } from "react";
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
  title: string;
  date: string;
  subtitle: string;
  template: CoverTemplate;
}

interface PreviewState {
  url: string | null;
  svg: string | null;
  width: number;
  height: number;
  error: string | null;
}

const initialFormState: FormState = {
  title: "Han River",
  date: "2026-03-01",
  subtitle: "Seoul",
  template: defaultTemplate
};

function FieldLabel({
  htmlFor,
  children
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-black/45"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function TemplateButton({
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
        "rounded-3xl border px-4 py-4 text-left transition",
        active
          ? "border-accent bg-accent/10 shadow-[0_18px_40px_rgba(217,119,87,0.16)]"
          : "border-black/8 bg-white/70 hover:border-black/15 hover:bg-white"
      ].join(" ")}
      onClick={() => onSelect(template.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-ink">{template.label}</p>
          <p className="mt-1 text-sm leading-6 text-black/58">
            {template.description}
          </p>
        </div>
        <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          {template.mood}
        </span>
      </div>
    </button>
  );
}

function EmptyPreview() {
  return (
    <div className="flex h-full flex-col justify-between rounded-[30px] border border-dashed border-black/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.55))] p-8 text-black/55">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-black/35">
          Live Preview
        </p>
        <h3 className="mt-4 max-w-sm text-3xl font-semibold leading-tight text-ink">
          Drop one photo to start shaping the cover.
        </h3>
      </div>
      <div className="space-y-4 rounded-[24px] bg-[#f4eee4] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black/65">Shared renderer</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            SVG
          </span>
        </div>
        <p className="text-sm leading-6">
          The web app preview and the CLI export both use the same square cover
          composition logic.
        </p>
      </div>
    </div>
  );
}

export function CoverStudio() {
  const inputId = useId();
  const [form, setForm] = useState<FormState>(initialFormState);
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
        title: deferredForm.title,
        date: deferredForm.date,
        subtitle: deferredForm.subtitle,
        template: deferredForm.template
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

    setBusyMessage("Preparing your photo...");

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

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(47,52,66,0.08),transparent_28%)]" />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <div className="space-y-6">
            <div className="rounded-card border border-black/6 bg-white/76 p-7 shadow-card backdrop-blur xl:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-accent/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  cover-generator
                </span>
                <span className="rounded-full border border-black/8 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                  Web + CLI
                </span>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                Build Apple Music-style date covers from one photo.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/62 sm:text-lg">
                Upload a single image, set the title, date, and subtitle, then
                export the same square artwork from the browser or the CLI.
              </p>
            </div>

            <div className="rounded-card border border-black/6 bg-white/72 p-6 shadow-card backdrop-blur">
              <div className="grid gap-5">
                <div
                  className="rounded-[28px] border border-dashed border-black/16 bg-[#f5efe6] p-5 transition hover:border-accent/40"
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleFile(event.dataTransfer.files.item(0));
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
                        Photo Upload
                      </p>
                      <p className="mt-2 text-sm leading-6 text-black/62">
                        Drop one image here or browse from disk. The photo is
                        cropped automatically for a square cover.
                      </p>
                    </div>
                    <label
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
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
                  <div className="mt-4 rounded-2xl border border-white/70 bg-white/72 px-4 py-3 text-sm text-black/60">
                    {image ? (
                      <span>
                        {image.fileName}
                        <span className="ml-2 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                          ready
                        </span>
                      </span>
                    ) : (
                      <span>No image selected yet.</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <textarea
                      className="min-h-[96px] w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-lg font-semibold text-ink outline-none transition placeholder:text-black/28 focus:border-accent focus:ring-4 focus:ring-accent/10"
                      id="title"
                      maxLength={120}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          title: event.target.value
                        }))
                      }
                      placeholder="Han River"
                      value={form.title}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <input
                      className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-base font-medium text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                      id="date"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          date: event.target.value
                        }))
                      }
                      type="date"
                      value={form.date}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="subtitle">Subtitle</FieldLabel>
                    <input
                      className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-base font-medium text-ink outline-none transition placeholder:text-black/28 focus:border-accent focus:ring-4 focus:ring-accent/10"
                      id="subtitle"
                      maxLength={80}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          subtitle: event.target.value
                        }))
                      }
                      placeholder="Seoul"
                      type="text"
                      value={form.subtitle}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
                    Template
                  </p>
                  <div className="grid gap-3">
                    {coverTemplates.map((template) => (
                      <TemplateButton
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
                </div>

                <div className="flex flex-col gap-3 rounded-[28px] border border-black/8 bg-[#17181b] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/52">
                      CLI parity
                    </p>
                    <code className="mt-2 block text-sm leading-6 text-white/85">
                      cover-generator generate ./input/photo.jpg --title
                      {" "}&quot;Han River&quot;
                      {" "}
                      --date &quot;2026-03-01&quot; --subtitle &quot;Seoul&quot;
                    </code>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f5efe6] disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/40"
                    disabled={!preview.svg || Boolean(busyMessage)}
                    onClick={() => {
                      void handleDownload();
                    }}
                    type="button"
                  >
                    {busyMessage ?? "Export PNG"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-card border border-black/6 bg-white/82 p-5 shadow-card backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/42">
                    Square Preview
                  </p>
                  <p className="mt-1 text-sm text-black/58">
                    The export matches this composition.
                  </p>
                </div>
                <span className="rounded-full border border-black/8 bg-[#f5efe6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/44">
                  1600 px
                </span>
              </div>

              <div className="aspect-square overflow-hidden rounded-[34px] bg-[#ece5d8]">
                {preview.url ? (
                  // Blob URLs are used for local SVG preview output from the shared renderer.
                  <img
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    src={preview.url}
                  />
                ) : (
                  <EmptyPreview />
                )}
              </div>

              {preview.error ? (
                <div className="mt-4 rounded-2xl border border-[#eab6a3] bg-[#fff3ef] px-4 py-3 text-sm text-[#8b3f2d]">
                  {preview.error}
                </div>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
