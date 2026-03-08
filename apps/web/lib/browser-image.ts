import { supportedMimeTypes } from "@cover-generator/shared";

export interface UploadedImageState {
  dataUrl: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("The selected file could not be read."));
    };

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unexpected file reader result."));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("The selected file could not be read."));
    };

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unexpected file reader result."));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

function normalizeMimeType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "image/jpg") {
    return "image/jpeg";
  }

  return normalized;
}

function inferRemoteFileName(url: string, mimeType: string) {
  try {
    const parsed = new URL(url);
    const pathSegment = parsed.pathname.split("/").pop();

    if (pathSegment && /\.[a-z0-9]+$/i.test(pathSegment)) {
      return decodeURIComponent(pathSegment);
    }
  } catch {
    // Fall through to the generated fallback name.
  }

  const extension = mimeType.split("/")[1] ?? "img";
  return `remote-image.${extension}`;
}

export async function fetchImageUrlAsUpload(url: string): Promise<UploadedImageState> {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl, {
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `The image request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        message = payload.error;
      }
    } catch {
      // Ignore invalid JSON and keep the generic message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const mimeType = normalizeMimeType(blob.type);

  if (!supportedMimeTypes.has(mimeType)) {
    throw new Error("Unsupported image format.");
  }

  const dataUrl = await blobToDataUrl(blob);
  const dimensions = await readDimensions(dataUrl);

  return {
    dataUrl,
    fileName: inferRemoteFileName(url, mimeType),
    mimeType,
    ...dimensions
  };
}

async function loadImage(source: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The preview image could not be rasterized."));
    image.src = source;
  });
}

async function readDimensions(source: string) {
  const image = await loadImage(source);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}

export async function createUploadStateFromFile(
  file: File
): Promise<UploadedImageState> {
  const dataUrl = await fileToDataUrl(file);
  const dimensions = await readDimensions(dataUrl);

  return {
    dataUrl,
    fileName: file.name,
    mimeType: file.type,
    ...dimensions
  };
}

export async function svgToPngBlob(svg: string, width: number, height: number) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  );

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas rendering is not available in this browser.");
    }

    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("The PNG export could not be created."));
          return;
        }

        resolve(blob);
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

export async function zipFilesToBlob(
  files: Array<{ fileName: string; blob: Blob }>
) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.fileName, file.blob);
  }

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  });
}
