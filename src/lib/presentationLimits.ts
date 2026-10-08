// MB is the display label; retain the approved 1024-based byte ceilings.
export const PRESENTATION_SIZE_UNIT_BYTES = 1024 * 1024;
const oralMB = 50,
  posterMB = 30;
export const PRESENTATION_LIMITS = {
  oral: { mb: oralMB, bytes: oralMB * PRESENTATION_SIZE_UNIT_BYTES },
  poster: { mb: posterMB, bytes: posterMB * PRESENTATION_SIZE_UNIT_BYTES },
} as const;
