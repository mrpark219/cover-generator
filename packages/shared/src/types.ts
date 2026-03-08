export type CoverTemplate = "classic" | "minimal" | "dark";

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
}

export interface CoverRenderInput {
  image: CoverImageSource;
  title: string;
  date: string;
  subtitle: string;
  template?: CoverTemplate;
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
  raw: string;
}

