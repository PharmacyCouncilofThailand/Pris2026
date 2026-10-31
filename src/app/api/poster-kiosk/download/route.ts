import { cleanFileNamePart } from "@/lib/posterDownloadName";
import { isAllowedPosterDownloadUrl } from "@/lib/posterFileUrl";

const MAX_BYTES = 31_457_280;
const UPSTREAM_TIMEOUT_MS = 20_000;
const TYPES = { pdf: "application/pdf", png: "image/png" } as const;

const fail = (status: number, code: string) =>
  Response.json(
    { success: false, code },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );

function contentDisposition(name: string, ext: string): string {
  const base =
    cleanFileNamePart(name.replace(/\.(pdf|png)$/i, "")).slice(0, 180) ||
    "poster";
  const ascii = base.replace(/[^\x20-\x7e]/g, "_").replace(/["%]/g, "_");
  return `attachment; filename="${ascii}.${ext}"; filename*=UTF-8''${encodeURIComponent(`${base}.${ext}`)}`;
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const url = params.get("url");
  if (
    !url ||
    !isAllowedPosterDownloadUrl(
      url,
      process.env.NEXT_PUBLIC_POSTER_R2_HOST || undefined,
    )
  ) {
    return fail(400, "POSTER_FILE_URL_INVALID");
  }
  const ext = url.endsWith(".pdf") ? "pdf" : "png";

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
    !type.toLowerCase().startsWith(TYPES[ext]) ||
    (Number.isFinite(length) && length > MAX_BYTES)
  ) {
    void upstream.body?.cancel();
    return fail(502, "POSTER_FILE_UPSTREAM");
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": TYPES[ext],
      "content-disposition": contentDisposition(params.get("name") ?? "", ext),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
