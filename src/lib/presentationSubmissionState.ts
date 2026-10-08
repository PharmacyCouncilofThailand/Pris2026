import type { AnnouncementType, OwnerPresentationDto } from '@/types/presentations';
import { PRESENTATION_LIMITS } from './presentationLimits';

export function fileProblem(file: File, type: AnnouncementType): string | null {
  if (file.size < 1) return 'PRESENTATION_FILE_EMPTY';
  if (file.size > PRESENTATION_LIMITS[type === 'oral' ? 'oral' : 'poster'].bytes) return 'PRESENTATION_FILE_TOO_LARGE';
  const extension = /\.pdf$/i.test(file.name);
  const mime = file.type.toLowerCase();
  return extension && ['', 'application/octet-stream', 'application/pdf'].includes(mime)
    ? null : 'PRESENTATION_FILE_TYPE';
}

export type PresentationFileSelection = { file: File; key: string };
export function selectPresentationFile(file: File, previous: PresentationFileSelection | null = null): PresentationFileSelection {
  return previous?.file === file ? previous : { file, key: crypto.randomUUID() };
}

export function submissionState(state: { loading: boolean; owner: OwnerPresentationDto | null; selected: boolean;
  sending: boolean; received: boolean; progress?: number }) {
  return state.loading ? 'loading' : state.received ? 'received' : state.sending
    ? (state.progress ?? 0) >= 100 ? 'checking' : 'uploading'
    : !state.owner?.canUpload ? 'locked' : state.selected ? 'selected' : 'empty';
}
