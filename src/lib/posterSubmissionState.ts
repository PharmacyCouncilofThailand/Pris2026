import type { OwnerPosterDto } from '@/types/posters';

export function fileProblem(file: File): string | null {
  if (file.size < 1) return 'POSTER_FILE_EMPTY';
  if (file.size > 30 * 1024 * 1024) return 'POSTER_FILE_TOO_LARGE';
  const extension = /\.(png|pdf)$/i.exec(file.name)?.[1].toLowerCase();
  const mime = file.type.toLowerCase();
  return extension && ['', 'application/octet-stream', extension === 'png' ? 'image/png' : 'application/pdf'].includes(mime)
    ? null : 'POSTER_FILE_TYPE';
}

export type PosterFileSelection = { file: File; key: string };
export function selectPosterFile(file: File, previous: PosterFileSelection | null = null): PosterFileSelection {
  return previous?.file === file ? previous : { file, key: crypto.randomUUID() };
}

export function submissionState(state: { loading: boolean; owner: OwnerPosterDto | null; selected: boolean;
  sending: boolean; received: boolean; progress?: number }) {
  return state.loading ? 'loading' : state.received ? 'received' : state.sending
    ? (state.progress ?? 0) >= 100 ? 'checking' : 'uploading'
    : !state.owner?.canUpload ? 'locked' : state.selected ? 'selected' : 'empty';
}
