import type { CoverTemplate } from "@cover-generator/shared";
import type { UploadedImageState } from "../../lib/browser-image";

export interface FormState {
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
}

export interface PreviewState {
  url: string | null;
  svg: string | null;
  width: number;
  height: number;
  error: string | null;
}

export interface UploadedImageItem extends UploadedImageState {
  id: string;
  selected: boolean;
  focusX: number;
  focusY: number;
  draftForm: FormState;
}

export type EditableField = keyof Pick<
  FormState,
  "header" | "title" | "subtitle" | "date" | "footer"
>;

export type SourceMode = "upload" | "url";
export type FieldAlignment = "left" | "center" | "right";
export type FieldTone = "title" | "body" | "meta";

export interface TemplateFieldLayoutItem {
  field: EditableField;
  span?: "full";
  align: FieldAlignment;
  tone: FieldTone;
}
