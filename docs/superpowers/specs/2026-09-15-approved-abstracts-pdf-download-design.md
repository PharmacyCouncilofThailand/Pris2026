# Approved Abstracts PDF Access Design

**Date:** 2026-09-15

## Goal

Make the Round 1 announcement PDF available from the Approved Abstracts page without adding an in-page PDF viewer or changing the abstract data.

## Approved interaction

Add one compact document action row to the page with exactly two visible actions:

1. **View PDF** opens the original PDF in a new browser tab.
2. **Download PDF** downloads the original PDF file.

The action row will sit above the filters so visitors can access the official document before browsing the 119 records. It will show only the two requested buttons, using the existing page card language, spacing, borders, and `lucide-react` icon style. The actions will remain usable on narrow screens by stacking only when needed.

## Asset and data boundaries

- Copy the user-provided PDF byte-for-byte to `public/documents/approved-abstracts-round-1.pdf`.
- Use a stable root-relative URL: `/documents/approved-abstracts-round-1.pdf`.
- Do not edit, regenerate, compress, or transform the PDF.
- Do not change the static abstract dataset, filtering behavior, or API behavior.

## Accessibility and fallback

- Use real links for both actions so keyboard, screen-reader, and browser context-menu behavior work without client state.
- Give each link an explicit bilingual label from `messages/th.json` and `messages/en.json` and give the action group an accessible document label.
- Use `target="_blank"` with `rel="noreferrer"` for the view action.
- Use the `download` attribute for the download action while retaining the same URL fallback.

## Verification

- Compare SHA-256 hashes of the source PDF and the copied public asset.
- Run `git diff --check`, TypeScript, scoped ESLint, the existing test suite, and production build.
- Check the two links in the Thai and English routes at desktop and 331px mobile widths, including no horizontal overflow.
