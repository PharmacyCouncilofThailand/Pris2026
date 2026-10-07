// Public DTOs copied from the authoritative API presentation contract; no announcement data.
export type AnnouncementType = 'oral' | 'poster' | 'highlighted-poster';
export type RevisionStatus = 'open' | 'submitted' | 'expired' | 'cancelled';
export type Announcement = { id: number; sequence?: number; trackingId: string | null;
  title: string; presentationType: AnnouncementType; categoryId: number; categoryName: string;
  submitterName: string | null; affiliation: string | null; round: 1 | 2 };
export type UploadDto = { id: string; version: number; fileName: string; storedFileName: string; mimeType: 'application/pdf';
  sizeBytes: number; fileUrl: string; storageProvider: 'drive' | 'r2'; driveFileId: string | null;
  receivedAt: string; revisionRequestId: string | null };
export type RevisionDto = { id: string; details: string; closesAt: string; status: RevisionStatus;
  createdAt: string; requestedBy: number; submittedAt: string | null; cancelledAt: string | null;
  cancelledBy: number | null; cancellationReason: string | null };
export type OwnerPresentationDto = { abstractId: number; trackingId: string; title: string; submitterName: string;
  presentationType: AnnouncementType; categoryName: string; round: number; serverNow: string;
  mainClosesAt: string; canUpload: boolean; blockCode: string | null; mode: 'initial' | 'revision' | 'locked';
  selectedRequest: RevisionDto | null; currentUpload: UploadDto | null; uploads: UploadDto[] };
