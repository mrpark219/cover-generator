import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { supportedMimeTypes } from "@cover-generator/shared";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const maxImageBytes = 20 * 1024 * 1024;

function normalizeMimeType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "image/jpg") {
    return "image/jpeg";
  }

  return normalized;
}

function isPrivateIpv4(address: string) {
  const octets = address.split(".").map(Number);
  const a = octets[0];
  const b = octets[1];

  if (typeof a !== "number" || typeof b !== "number") {
    return true;
  }

  if ([a, b].some((value) => Number.isNaN(value))) {
    return true;
  }

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpAddress(address: string) {
  const normalized = address.toLowerCase().split("%")[0] ?? "";

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpAddress(normalized.slice(7));
  }

  const version = isIP(normalized);

  if (version === 4) {
    return isPrivateIpv4(normalized);
  }

  if (version === 6) {
    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return true;
}

async function assertPublicRemoteUrl(url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS image URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("Authenticated image URLs are not supported.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Local network image URLs are blocked.");
  }

  if (isIP(hostname) !== 0) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error("Private network image URLs are blocked.");
    }

    return;
  }

  const resolvedAddresses = await lookup(hostname, { all: true, verbatim: true });
  if (resolvedAddresses.length === 0) {
    throw new Error("The image host could not be resolved.");
  }

  if (resolvedAddresses.some((entry) => isPrivateIpAddress(entry.address))) {
    throw new Error("Private network image URLs are blocked.");
  }
}

function buildErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const urlValue = request.nextUrl.searchParams.get("url");
  if (!urlValue) {
    return buildErrorResponse("Missing image URL.", 400);
  }

  let remoteUrl: URL;

  try {
    remoteUrl = new URL(urlValue);
  } catch {
    return buildErrorResponse("Invalid image URL.", 400);
  }

  try {
    await assertPublicRemoteUrl(remoteUrl);
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error.message : "Blocked image URL.",
      400
    );
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(remoteUrl, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
        "User-Agent": "cover-generator/0.1"
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error.message : "The remote image could not be fetched.",
      502
    );
  }

  if (!upstreamResponse.ok) {
    return buildErrorResponse(
      `The image request failed with status ${upstreamResponse.status}.`,
      502
    );
  }

  const mimeType = normalizeMimeType(
    upstreamResponse.headers.get("content-type")?.split(";")[0]?.trim() ?? ""
  );

  if (!supportedMimeTypes.has(mimeType)) {
    return buildErrorResponse("Unsupported image format.", 415);
  }

  const contentLength = Number(upstreamResponse.headers.get("content-length") ?? "0");
  if (contentLength > maxImageBytes) {
    return buildErrorResponse("The remote image is too large.", 413);
  }

  const arrayBuffer = await upstreamResponse.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  if (body.byteLength > maxImageBytes) {
    return buildErrorResponse("The remote image is too large.", 413);
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Length": String(body.byteLength),
      "Content-Type": mimeType
    }
  });
}
