# Presentation Templates Implementation Plan

**Goal:** Add the public template viewer approved by the user, using the supplied original files and incumbent PRIS2026 design.

**Architecture:** One localized route and one scoped CSS module; static file metadata describes exact local originals. Base UI owns accessible tabs. React state selects a representative Oral slide. Shared site navigation exposes the new route.

**Tech Stack:** Existing Next.js, React, next-intl, Base UI, lucide-react and sharp.

## Steps

- [x] Copy original ZIP contents and archives to `public/documents/presentation-templates`; export a read-only Oral PDF and optimized preview images.
- [x] Add `src/data/presentationTemplates.ts` and the `presentation-templates` route with scoped styles.
- [x] Add Thai/English copy, the Abstracts navigation item, light-header recognition and a reload exemption.
- [x] Verify original-file integrity and refresh behavior with focused tests; inspect both tabs and file links in the browser at desktop and phone sizes.
- [x] Run focused lint, TypeScript, production build and the Impeccable detector; record the result and leave the preview running.

## Limits

No changes to submissions, authentication, existing page compositions or backend. Preserve the source documents, including their placeholder text and sample dimensions. New sample content and generated design imagery are unnecessary because the original artifacts are the visual content.
