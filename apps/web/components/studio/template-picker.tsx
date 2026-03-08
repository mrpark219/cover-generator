/* eslint-disable @next/next/no-img-element */

import { coverTemplates, type CoverTemplate } from "@cover-generator/shared";
import type { StudioCopy } from "../../lib/i18n";
import { templatePreviewImages } from "./constants";

function TemplateOptionCard({
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
      aria-pressed={active}
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

export function TemplatePicker({
  copy,
  value,
  onChange
}: {
  copy: StudioCopy;
  value: CoverTemplate;
  onChange: (template: CoverTemplate) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {coverTemplates.map((template) => (
          <TemplateOptionCard
            active={template.id === value}
            key={template.id}
            label={copy.templates[template.id].label}
            onSelect={onChange}
            previewAlt={copy.templatePreviewAlt(copy.templates[template.id].label)}
            template={template.id}
          />
        ))}
      </div>
      <p className="mt-1.5 break-keep text-[11px] leading-4 text-black/52">
        {copy.templates[value].description}
      </p>
    </div>
  );
}
