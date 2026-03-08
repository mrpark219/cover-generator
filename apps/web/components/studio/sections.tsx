/* eslint-disable @next/next/no-img-element */

import {
  coverSizeOptions,
  coverTemplates,
  defaultTextColor,
  normalizeHexColor,
  type CoverTemplate
} from "@cover-generator/shared";
import { languageOptions, type Language, type StudioCopy } from "../../lib/i18n";
import {
  panelClass,
  quickSymbols,
  textColorSwatches,
  templatePreviewImages
} from "./constants";
import type {
  EditableField,
  FieldAlignment,
  FormState,
  PreviewState,
  SourceMode,
  TemplateFieldLayoutItem,
  UploadedImageItem
} from "./types";

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

function FieldLabel({
  htmlFor,
  children,
  align = "left"
}: {
  htmlFor: string;
  children: string;
  align?: FieldAlignment;
}) {
  return (
    <label
      className={[
        "mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45",
        align === "center"
          ? "text-center"
          : align === "right"
            ? "text-right"
            : "text-left"
      ].join(" ")}
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

function focusToSliderValue(value: number) {
  return Math.round((value - 0.5) * 200);
}

function TextFieldControl({
  item,
  copy,
  value,
  onChange,
  onFocus,
  setFieldRef
}: {
  item: TemplateFieldLayoutItem;
  copy: StudioCopy;
  value: string;
  onChange: (field: EditableField, value: string) => void;
  onFocus: (field: EditableField) => void;
  setFieldRef: (
    field: EditableField
  ) => (node: HTMLInputElement | HTMLTextAreaElement | null) => void;
}) {
  const alignmentClassNames: Record<FieldAlignment, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };
  const wrapperClassName = item.span === "full" ? "sm:col-span-2" : "";
  const isTitle = item.field === "title";
  const isUppercaseField = item.field === "header" || item.field === "footer";
  const textSizeClassName =
    item.tone === "meta" ? "text-[12px]" : item.tone === "body" ? "text-[14px]" : "";

  if (isTitle) {
    return (
      <div className={wrapperClassName} key={item.field}>
        <FieldLabel align={item.align} htmlFor={item.field}>
          {copy.fields[item.field]}
        </FieldLabel>
        <textarea
          className={[
            "min-h-[56px] w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[16px] font-semibold leading-[1.2] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]",
            alignmentClassNames[item.align]
          ].join(" ")}
          id={item.field}
          maxLength={120}
          onChange={(event) => onChange(item.field, event.target.value)}
          onFocus={() => onFocus(item.field)}
          placeholder={copy.placeholders[item.field]}
          ref={setFieldRef(item.field)}
          value={value}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName} key={item.field}>
      <FieldLabel align={item.align} htmlFor={item.field}>
        {copy.fields[item.field]}
      </FieldLabel>
      <input
        className={[
          "w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 font-medium text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]",
          alignmentClassNames[item.align],
          textSizeClassName,
          isUppercaseField ? "uppercase tracking-[0.14em]" : ""
        ].join(" ")}
        id={item.field}
        maxLength={item.field === "header" || item.field === "footer" ? 48 : 80}
        onChange={(event) => onChange(item.field, event.target.value)}
        onFocus={() => onFocus(item.field)}
        placeholder={copy.placeholders[item.field]}
        ref={setFieldRef(item.field)}
        type="text"
        value={value}
      />
    </div>
  );
}

export function HeaderSection({
  copy,
  language,
  onLanguageChange
}: {
  copy: StudioCopy;
  language: Language;
  onLanguageChange: (value: Language) => void;
}) {
  return (
    <header className={`${panelClass} mb-3 shrink-0 px-3 py-2.5 sm:px-4 sm:py-3`}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/42">
              {copy.pageEyebrow}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold tracking-[-0.03em] text-[#111111]">
              {copy.pageTitle}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[9.5rem]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/42">
            {copy.language}
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {languageOptions.map((option) => (
              <button
                className={[
                  "rounded-xl border-2 px-3 py-1.5 text-[12px] font-semibold transition",
                  language === option.value
                    ? "border-[#027fff] bg-[#f7fbff] text-[#027fff]"
                    : "border-[#e6e6e6] bg-white text-[#111111] hover:border-[#d3d3d7]"
                ].join(" ")}
                key={option.value}
                onClick={() => onLanguageChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PreviewSection({
  copy,
  activeImage,
  form,
  activeField,
  preview,
  selectedImageCount,
  totalImageCount,
  activeSelectedIndex,
  onResetPosition,
  onFocusXChange,
  onFocusYChange,
  onMoveSelectedPreview,
  onFocusSelectedGroup,
  onInsertSymbol,
  onDownloadCurrent,
  onDownloadSelected,
  busyAction,
  busyMessage
}: {
  copy: StudioCopy;
  activeImage: UploadedImageItem | null;
  form: FormState;
  activeField: EditableField;
  preview: PreviewState;
  selectedImageCount: number;
  totalImageCount: number;
  activeSelectedIndex: number;
  onResetPosition: () => void;
  onFocusXChange: (value: number) => void;
  onFocusYChange: (value: number) => void;
  onMoveSelectedPreview: (direction: "previous" | "next") => void;
  onFocusSelectedGroup: () => void;
  onInsertSymbol: (value: string) => void;
  onDownloadCurrent: () => void;
  onDownloadSelected: () => void;
  busyAction: "upload" | "url" | "single" | "batch" | null;
  busyMessage: string | null;
}) {
  return (
    <section className={`${panelClass} p-2.5 sm:p-3`}>
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
            <p className="text-[13px] font-semibold text-[#111111]">{copy.position}</p>
            <p className="mt-0.5 break-keep text-[11px] leading-4 text-black/55">
              {copy.positionDescription}
            </p>
          </div>
          <button
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42 transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:text-black/25"
            disabled={!activeImage}
            onClick={onResetPosition}
            type="button"
          >
            {copy.resetPosition}
          </button>
        </div>

        <div className="mt-2.5 grid gap-2.5">
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-black/42">
              <span>{copy.horizontal}</span>
              <span>{activeImage ? focusToSliderValue(activeImage.focusX) : 0}</span>
            </span>
            <input
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d9dee8]"
              disabled={!activeImage}
              max={100}
              min={-100}
              onChange={(event) => onFocusXChange(Number(event.target.value))}
              step={1}
              type="range"
              value={activeImage ? focusToSliderValue(activeImage.focusX) : 0}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-black/42">
              <span>{copy.vertical}</span>
              <span>{activeImage ? focusToSliderValue(activeImage.focusY) : 0}</span>
            </span>
            <input
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d9dee8]"
              disabled={!activeImage}
              max={100}
              min={-100}
              onChange={(event) => onFocusYChange(Number(event.target.value))}
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
              onClick={() => onMoveSelectedPreview("previous")}
              type="button"
            >
              {copy.previous}
            </button>
            <button
              className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
              disabled={selectedImageCount < 2}
              onClick={() => onMoveSelectedPreview("next")}
              type="button"
            >
              {copy.next}
            </button>
            <button
              className="rounded-xl border-2 border-[#027fff] bg-[#f7fbff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#027fff] transition hover:border-[#0167d0] hover:text-[#0167d0] disabled:cursor-not-allowed disabled:border-[#d6e9ff] disabled:text-[#8abfff]"
              disabled={activeSelectedIndex >= 0}
              onClick={onFocusSelectedGroup}
              type="button"
            >
              {activeSelectedIndex >= 0
                ? copy.selectedGroupFocused
                : copy.focusSelectedGroup}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-2 rounded-2xl border-2 border-[#e6e6e6] bg-[#fafafc] p-2.5">
        <div>
          <p className="text-[13px] font-semibold text-[#111111]">
            {copy.quickSymbols}
          </p>
          <p className="mt-0.5 text-[11px] text-black/52">
            {copy.insertsInto(copy.fields[activeField])}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 xl:grid-cols-4">
          {quickSymbols.map((symbol) => (
            <button
              className="inline-flex h-7 items-center justify-center rounded-xl border-2 border-[#e6e6e6] bg-white text-[14px] font-semibold text-[#111111] transition hover:border-[#cfd6df] hover:bg-[#fefefe]"
              key={`${symbol.title}-${symbol.value}`}
              onClick={() => onInsertSymbol(symbol.value)}
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

      {preview.error ? (
        <div className="mt-2 rounded-xl border-2 border-[#f1c7bc] bg-[#fff4f1] px-3 py-2.5 text-sm text-[#a24a32]">
          {preview.error}
        </div>
      ) : null}

      <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        <button
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#027fff] bg-[#027fff] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
          disabled={!preview.svg || Boolean(busyMessage)}
          onClick={onDownloadCurrent}
          type="button"
        >
          {busyAction === "single" && busyMessage ? busyMessage : copy.downloadCurrentPng}
        </button>
        <button
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#d7dbe3] bg-[#fafafc] px-4 py-2.5 text-[13px] font-semibold text-[#111111] transition hover:border-[#c3cad5] hover:bg-white disabled:cursor-not-allowed disabled:border-[#e4e8ef] disabled:text-black/35"
          disabled={selectedImageCount === 0 || Boolean(busyMessage)}
          onClick={onDownloadSelected}
          type="button"
        >
          {busyAction === "batch" && busyMessage
            ? busyMessage
            : copy.downloadSelectedZip(selectedImageCount)}
        </button>
      </div>

      <div className="mt-2 hidden items-center justify-between gap-3 rounded-xl border-2 border-[#e6e6e6] bg-[#fafafc] px-3 py-2">
        <span className="truncate text-xs font-medium text-black/58">
          {activeImage ? activeImage.fileName : copy.noActiveImage}
        </span>
        <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42">
          {copy.selectedCount(selectedImageCount, totalImageCount)}
        </span>
      </div>
    </section>
  );
}

export function SettingsSection({
  copy,
  rawForm,
  fieldLayout,
  setFieldRef,
  onTextFieldChange,
  onActiveFieldChange,
  onTemplateChange,
  onSizeChange,
  onTextColorChange,
  onShadowChange,
  onBlurChange
}: {
  copy: StudioCopy;
  rawForm: FormState;
  fieldLayout: TemplateFieldLayoutItem[];
  setFieldRef: (
    field: EditableField
  ) => (node: HTMLInputElement | HTMLTextAreaElement | null) => void;
  onTextFieldChange: (field: EditableField, value: string) => void;
  onActiveFieldChange: (field: EditableField) => void;
  onTemplateChange: (template: CoverTemplate) => void;
  onSizeChange: (size: number) => void;
  onTextColorChange: (value: string) => void;
  onShadowChange: (value: boolean) => void;
  onBlurChange: (value: boolean) => void;
}) {
  const normalizedTextColor = normalizeHexColor(rawForm.textColor, defaultTextColor);

  return (
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

        <div className="grid gap-2.5 sm:grid-cols-2">
          {fieldLayout.map((item) => (
            <TextFieldControl
              copy={copy}
              item={item}
              key={item.field}
              onChange={onTextFieldChange}
              onFocus={onActiveFieldChange}
              setFieldRef={setFieldRef}
              value={rawForm[item.field]}
            />
          ))}
        </div>

        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_10rem] xl:grid-cols-1">
          <div>
            <FieldLabel htmlFor="template-modern">{copy.template}</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {coverTemplates.map((template) => (
                <TemplateCard
                  active={template.id === rawForm.template}
                  key={template.id}
                  label={copy.templates[template.id].label}
                  onSelect={onTemplateChange}
                  previewAlt={copy.templatePreviewAlt(copy.templates[template.id].label)}
                  template={template.id}
                />
              ))}
            </div>
            <p className="mt-1.5 break-keep text-[11px] leading-4 text-black/52">
              {copy.templates[rawForm.template].description}
            </p>
          </div>

          <div>
            <FieldLabel htmlFor="size">{copy.resolution}</FieldLabel>
            <select
              className="w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#111111] outline-none transition focus:border-[#027fff]"
              id="size"
              onChange={(event) => onSizeChange(Number(event.target.value))}
              value={rawForm.size}
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[#111111]">
                {copy.textColor}
              </p>
              <p className="mt-0.5 text-[11px] text-black/52">{normalizedTextColor}</p>
            </div>
            <button
              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/42 transition hover:bg-[#f3f4f6]"
              onClick={() => onTextColorChange(defaultTextColor)}
              type="button"
            >
              {copy.resetColor}
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <input
              aria-label={copy.textColor}
              className="h-10 w-12 cursor-pointer rounded-xl border-2 border-[#e6e6e6] bg-white p-1"
              onChange={(event) => onTextColorChange(event.target.value)}
              type="color"
              value={normalizedTextColor}
            />
            <input
              className="h-10 w-full rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#111111] outline-none transition placeholder:text-black/25 focus:border-[#027fff]"
              inputMode="text"
              maxLength={7}
              onChange={(event) => onTextColorChange(event.target.value)}
              placeholder="#FFFFFF"
              type="text"
              value={rawForm.textColor}
            />
          </div>
          <div className="mt-2 grid grid-cols-8 gap-1.5">
            {textColorSwatches.map((color) => (
              <button
                aria-label={color}
                className={[
                  "h-7 rounded-lg border-2 transition",
                  normalizeHexColor(color) === normalizedTextColor
                    ? "border-[#111111] scale-[1.02]"
                    : "border-white/80 hover:border-[#d3d3d7]"
                ].join(" ")}
                key={color}
                onClick={() => onTextColorChange(color)}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
            {copy.effects}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            <OptionToggle
              checked={rawForm.shadow}
              description={copy.useShadowDescription}
              label={copy.useShadow}
              onChange={onShadowChange}
            />
            <OptionToggle
              checked={rawForm.blur}
              description={copy.useBlurDescription}
              label={copy.useBlur}
              onChange={onBlurChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ImagesSection({
  copy,
  sourceMode,
  inputId,
  urlInput,
  busyAction,
  busyMessage,
  images,
  activeImageId,
  selectedImages,
  activeSelectedIndex,
  onSourceModeChange,
  onFiles,
  onUrlInputChange,
  onImportUrls,
  onSelectAll,
  onDeselectAll,
  onClearAll,
  onSetActiveImage,
  onToggleImageSelection
}: {
  copy: StudioCopy;
  sourceMode: SourceMode;
  inputId: string;
  urlInput: string;
  busyAction: "upload" | "url" | "single" | "batch" | null;
  busyMessage: string | null;
  images: UploadedImageItem[];
  activeImageId: string | null;
  selectedImages: UploadedImageItem[];
  activeSelectedIndex: number;
  onSourceModeChange: (value: SourceMode) => void;
  onFiles: (files: FileList | File[] | null) => void | Promise<void>;
  onUrlInputChange: (value: string) => void;
  onImportUrls: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearAll: () => void;
  onSetActiveImage: (imageId: string) => void;
  onToggleImageSelection: (imageId: string) => void;
}) {
  const selectedImageCount = selectedImages.length;
  const totalImageCount = images.length;

  return (
    <section className="space-y-3">
      <section
        className={`${panelClass} p-3 sm:p-4`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (sourceMode === "upload") {
            void onFiles(event.dataTransfer.files);
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
                  onClick={() => onSourceModeChange(mode)}
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
                    onChange={(event) => onUrlInputChange(event.target.value)}
                    placeholder={copy.urlPlaceholder}
                    value={urlInput}
                  />
                  <button
                    className="inline-flex items-center justify-center rounded-xl border-2 border-[#027fff] bg-[#027fff] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0167d0] hover:border-[#0167d0] disabled:cursor-not-allowed disabled:border-[#b6d7ff] disabled:bg-[#b6d7ff]"
                    disabled={Boolean(busyMessage)}
                    onClick={onImportUrls}
                    type="button"
                  >
                    {busyAction === "url" && busyMessage ? busyMessage : copy.addUrls}
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
              void onFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            multiple
            type="file"
          />

          <div className="rounded-2xl border-2 border-[#e6e6e6] bg-[#fafafc] p-3">
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
                  onClick={onSelectAll}
                  type="button"
                >
                  {copy.selectAll}
                </button>
                <button
                  className="rounded-xl border-2 border-[#e6e6e6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/52 transition hover:border-[#cfd6df] hover:bg-white disabled:cursor-not-allowed disabled:text-black/25"
                  disabled={images.length === 0}
                  onClick={onDeselectAll}
                  type="button"
                >
                  {copy.deselectAll}
                </button>
                <button
                  className="rounded-xl border-2 border-[#f0d2ca] bg-[#fff6f4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a24a32] transition hover:border-[#e6beb2] hover:bg-white disabled:cursor-not-allowed disabled:text-[#d3a69b]"
                  disabled={images.length === 0}
                  onClick={onClearAll}
                  type="button"
                >
                  {copy.clearAll}
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                        onClick={() => onSetActiveImage(imageItem.id)}
                        onDoubleClick={() => {
                          onSetActiveImage(imageItem.id);
                          onToggleImageSelection(imageItem.id);
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
    </section>
  );
}

export function DetailsSection({
  copy,
  cliCommand
}: {
  copy: StudioCopy;
  cliCommand: string;
}) {
  return (
    <details className={`${panelClass} group shrink-0 overflow-hidden`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition hover:bg-[#fafafc]">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#111111]">{copy.detailsSummary}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-black/42">
            {copy.detailsHint}
          </p>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#e6e6e6] bg-white text-black/52 transition group-open:rotate-180 group-open:border-[#027fff] group-open:text-[#027fff]">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6.5L8 10L12 6.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
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
  );
}
