export type CoverTemplate = "modern" | "normal" | "classic";

export interface CoverTemplateOption {
  id: CoverTemplate;
  label: string;
  description: string;
  mood: string;
}

export interface CoverImageSource {
  src: string;
  mimeType?: string;
  width?: number;
  height?: number;
  focusX?: number;
  focusY?: number;
}

export interface CoverRenderInput {
  image: CoverImageSource;
  header?: string;
  title: string;
  date: string;
  subtitle: string;
  footer?: string;
  textColor?: string;
  template?: CoverTemplate;
  shadow?: boolean;
  blur?: boolean;
  size?: number;
}

export interface CoverRenderResult {
  svg: string;
  width: number;
  height: number;
  template: CoverTemplate;
}

export interface DateDisplayVariants {
  weekday: string;
  long: string;
  compact: string;
  numeric: string;
  monthYear: string;
  monthShort: string;
  day: string;
  year: string;
  raw: string;
}
