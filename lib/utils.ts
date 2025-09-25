import { clsx, type ClassValue } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const absoluteUrl = (req: NextRequest) => {
  let hostHeader =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost";
  if (!/^https?:\/\//i.test(hostHeader)) {
    hostHeader = `http://${hostHeader}`;
  }
  const hostUrl = new URL(hostHeader);

  const host = hostUrl.hostname;
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const port = req.headers.get("x-forwarded-port") || "3000";

  return {
    protocol,
    host: host || "",
    port,
    origin: `${protocol}://${host}:${port}`,
  };
};

/**
 * Generates a URL from the given protocol, host, port, and basePath.
 * It ensures the URL does not end with a trailing slash.
 *
 * @param {string} protocol - The protocol for the URL (e.g., 'http', 'https').
 * @param {string} host - The host (e.g., 'example.com').
 * @param {string} port - The port (e.g., '3000'). Can be an empty string if not needed.
 * @param {string} basePath - The base path for the URL (e.g., '/api', '/'). Uses "/" if empty.
 * @returns {string} - The constructed URL without a trailing slash.
 */
export const generateUrl = (
  protocol: string,
  host: string,
  port: string,
  basePath: string
) => {
  let url = `${protocol}://${host}${port ? `${port}` : ""}${basePath}`;

  // Remove the trailing slash if it exists (except for root "/")
  if (url.length > 1 && url.endsWith("/")) {
    url = url.replace(/\/$/, "");
  }

  return url;
};

export const createPageUrl = (
  searchParams: ReadonlyURLSearchParams,
  pathname: string,
  value: string | number | undefined | null,
  type: string,
) => {
  const params = new URLSearchParams(searchParams);
  if (value === undefined || value === null) {
    params.delete(type);
  } else {
    params.set(type, value.toString());
  }

  return `${pathname}?${params.toString()}`;
};


export const validateTime = (time?: Date) => {
  if (!time) {
    return false;
  }
  const zeroTimestamps = [
    "0001-01-01T00:00:00Z", // .NET DateTime.MinValue
    "1970-01-01T00:00:00Z", // Unix epoch
    "0000-00-00T00:00:00Z", // Some database null values
  ];

  if (zeroTimestamps.includes(time.toString())) {
    return false;
  }

  if (Number.isNaN(time)) {
    return false;
  }

  return true;
};

export function toSentenseCase(val: string) {
  if (!val || val.length === 0) {
    return "";
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export const lightDialogTheme = {
  base00: "#ffffff", // Default background color
  base01: "#f5f5f5",
  base02: "#e0e0e0",
  base03: "#d6d6d6",
  base04: "#4d4d4c",
  base05: "#5e5e5e",
  base06: "#d6d6d6",
  base07: "#1d1f21",
  base08: "#c82829",
  base09: "#f5871f",
  base0A: "#eab700",
  base0B: "#718c00",
  base0C: "#3e999f",
  base0D: "#4271ae",
  base0E: "#8959a8",
  base0F: "#a3685a",
};
