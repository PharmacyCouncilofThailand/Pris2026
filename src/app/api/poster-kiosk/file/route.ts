import { isAllowedPosterFileUrl } from "@/lib/posterFileUrl";

const MAX_BYTES = 31_457_280;
const UPSTREAM_TIMEOUT_MS = 20_000;

const fail = (status: number, code: string) =>
  Response.json({ success: false, code }, { status, headers: { "cache-control": "no-store" } });

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isAllowedPosterFileUrl(url)) return fail(400, "POSTER_FILE_URL_INVALID");

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return fail(502, "POSTER_FILE_UPSTREAM");
  }

  const type = upstream.headers.get("content-type") ?? "";
  const length = Number(upstream.headers.get("content-length"));
  if (
    !upstream.ok ||
    !upstream.body ||
    !type.toLowerCase().startsWith("application/pdf") ||
    (Number.isFinite(length) && length > MAX_BYTES)
  ) {
    void upstream.body?.cancel();
    return fail(502, "POSTER_FILE_UPSTREAM");
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
