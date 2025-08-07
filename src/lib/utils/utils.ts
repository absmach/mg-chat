import { NextRequest } from "next/server";

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
  basePath: string,
) => {
  let url = `${protocol}://${host}${port ? `${port}` : ""}${basePath}`;

  // Remove the trailing slash if it exists (except for root "/")
  if (url.length > 1 && url.endsWith("/")) {
    url = url.replace(/\/$/, "");
  }

  return url;
};

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
