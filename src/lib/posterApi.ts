import type { Announcement, OwnerPosterDto, UploadDto } from '@/types/posters';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002').replace(/\/$/, '');

export async function getApprovedAnnouncements(signal?: AbortSignal): Promise<Announcement[]> {
  const response = await fetch(`${API_BASE}/api/events/PRIS-2026/approved-abstracts`, { signal, cache: 'no-store' });
  const json = await response.json();
  if (!response.ok || json.success !== true || !Array.isArray(json.data)) throw new Error('ANNOUNCEMENTS_UNAVAILABLE');
  return json.data;
}

export class PosterApiError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
    this.name = 'PosterApiError';
  }
}

const errorCode = (code: unknown, fallback: string) =>
  typeof code === 'string' && /^[A-Z][A-Z0-9_]*$/.test(code) ? code : fallback;

export async function getOwnerPoster(token: string, abstractId: number, requestId?: string, signal?: AbortSignal): Promise<OwnerPosterDto> {
  const query = requestId ? `?requestId=${encodeURIComponent(requestId)}` : '';
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/abstracts/${abstractId}/poster${query}`, {
      signal, cache: 'no-store', headers: { Authorization: `Bearer ${token}` },
    });
  } catch { throw new PosterApiError('POSTER_LOAD_FAILED', 0); }
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success !== true || body?.data?.abstractId !== abstractId) {
    throw new PosterApiError(errorCode(body?.code, 'POSTER_LOAD_FAILED'), response.status);
  }
  return body.data;
}

export type PosterUploadInput = { token: string; abstractId: number; requestId: string | null; file: File;
  key: string; onProgress: (percentage: number) => void; signal?: AbortSignal };

export function uploadPoster(input: PosterUploadInput): Promise<{ upload: UploadDto; replayed: boolean }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => { input.signal?.removeEventListener('abort', abort); xhr.upload.onprogress = null; };
    const unknown = () => { cleanup(); reject(new PosterApiError('POSTER_NETWORK_UNKNOWN', 0)); };
    if (input.signal?.aborted) { unknown(); return; }
    xhr.open('POST', `${API_BASE}/api/abstracts/${input.abstractId}/poster-uploads`);
    xhr.setRequestHeader('Authorization', `Bearer ${input.token}`);
    xhr.setRequestHeader('Idempotency-Key', input.key);
    xhr.timeout = 180_000;
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) input.onProgress(Math.min(100, Math.max(0, Math.round(event.loaded / event.total * 100))));
    };
    xhr.onerror = xhr.ontimeout = xhr.onabort = unknown;
    xhr.onload = () => {
      cleanup();
      if (!xhr.status) { unknown(); return; }
      let body;
      try { body = JSON.parse(xhr.responseText); }
      catch { reject(new PosterApiError('POSTER_NETWORK_UNKNOWN', xhr.status)); return; }
      if (xhr.status >= 200 && xhr.status < 300 && body?.success === true &&
        typeof body?.data?.upload?.id === 'string' && typeof body?.data?.replayed === 'boolean') resolve(body.data);
      else reject(new PosterApiError(errorCode(body?.code,
        xhr.status >= 200 && xhr.status < 300 ? 'POSTER_NETWORK_UNKNOWN' : 'POSTER_UPLOAD_FAILED'), xhr.status));
    };
    const form = new FormData();
    form.append('file', input.file);
    if (input.requestId) form.append('requestId', input.requestId);
    input.signal?.addEventListener('abort', abort, { once: true });
    // Browser supplies the multipart boundary. Bytes reaching 100% are not a receipt.
    try { xhr.send(form); }
    catch { unknown(); }
  });
}
