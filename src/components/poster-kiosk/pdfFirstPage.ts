import { createRenderCache } from "@/lib/posterRenderCache";

const cache = createRenderCache<Blob>(10);
const inFlight = new Map<string, Promise<Blob>>();

function abortError(): Error {
  return new DOMException("Poster render aborted", "AbortError");
}

async function render(url: string, width: number): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const task = pdfjs.getDocument({ url });
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, viewport }).promise;
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Poster canvas export failed"))),
        "image/png",
      ),
    );
  } finally {
    void task.destroy();
  }
}

export async function renderPdfFirstPage(
  url: string,
  width: number,
  signal?: AbortSignal,
): Promise<Blob> {
  if (signal?.aborted) throw abortError();
  const key = `${url}@${width}`;

  const cached = cache.get(key);
  if (cached) return cached;

  let pending = inFlight.get(key);
  if (!pending) {
    pending = render(url, width)
      .then((blob) => {
        cache.set(key, blob);
        return blob;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }

  if (!signal) return pending;
  return new Promise<Blob>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    pending.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}
