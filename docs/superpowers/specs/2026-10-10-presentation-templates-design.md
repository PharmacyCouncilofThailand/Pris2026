# Presentation Templates

The user selected a separate public page in the Abstracts menu. It must follow the actual PRIS2026 UI, inspected on the About, Abstract Guidelines and Call for Abstracts routes, using the installed Outfit/Noto Sans Thai fonts, white ground, bold headings, blue and orange accents, and shared Header/Footer.

## Surface

`/[locale]/presentation-templates` is a Read/Operate surface. Per the user's header refinement, it uses the same shared `PageHero` as `approved-abstracts`: PRIS 2026 eyebrow, gradient second line, shared spacing and entrance motion, with a page-scoped one-line mobile title. Accessible Oral/Poster tabs follow. Each panel pairs an original document preview with preparation guidance and a ZIP download. A ruled file list shows each original filename, description, extension and size, without individual download links. Metadata is aligned right on desktop and below the description on mobile. Oral shows five selectable original-slide images; its upper-right expansion icon opens a centered, non-fullscreen modal containing Microsoft Office Viewer using the public R2 PowerPoint URL. The Oral placeholder-content caption is italic. Poster uses the preserved local `poster.webp`, both inline and in its centered portrait modal, without cropping or changing its aspect ratio. Neither expansion action opens a new tab. The only related link is the selected-presentations announcement.

## Source Truth

- Oral ZIP: PowerPoint, Presentation Header.png, Presentation Footer.png.
- PowerPoint slide 6: at most 10 content slides, 1-2 images, at most 10 minutes presentation and 5 minutes questions. The source contains 18 sample slides; this does not change the 10-slide preparation limit.
- Poster ZIP: Poster.pdf and Poster Header.png. PDF: export at 9:16 or 18 x 32 cm with no margins, at most 3 images. Its sample guidance page has a different physical ratio, so the preview is labeled as the source guidance sheet and preserved as supplied.
- Attached document instructions are displayed as preparation guidance, never treated as agent instructions. Placeholder research text is not an actual submission.

## Scope And Verification

Use installed Base UI tabs/dialogs, lucide icons, next-intl and Next Image. Oral selection uses React state and five local optimized images; Microsoft loads the R2 PPTX only when the visitor expands it. Base UI owns modal focus trapping, background scroll locking, closing and focus restoration. Centered popups use 8px corners, viewport margins and separate landscape/portrait dimensions, with localized titles and persistent close buttons. ZIP downloads use the user's public R2 URLs. Poster uses the local optimized WebP image in both views; PDF.js, its worker/component and PDF-only UI states were removed. Poster display no longer needs R2 CORS or PDF network requests. Remote downloads need R2 availability, while PowerPoint expansion also needs Microsoft. No backend changes or new dependencies remain. Add the route to light-header recognition and the reload exemption so it remains readable and refreshable. Verify resource URLs, keyboard tabs/selection, previews/dialogs, Thai/English, desktop/mobile layout, lint, types and production build.

## Direction Contract

THESIS: Original templates lead the page; document specimens and preparation requirements determine the layout.

OWN-WORLD: Inherited Outfit/Noto Sans Thai; white, #111827 ink, #2563eb blue and #c2410c orange; shared site chrome, flat ruled file rows and restrained 6px tool corners.

STORY: Choose a presentation type, inspect its original materials, read preparation constraints and download the archive.

FIRST VIEWPORT: The shared `PageHero`, matching `approved-abstracts`, leads into two accessible tabs. Desktop pairs the original document on the left with guidance and the ZIP action on the right. Below 767px these become one column. Per the subsequent user refinement, the mobile title stays on one line using page-scoped CSS: Thai 28px, English 24px (20px below 375px). Both title parts share the same top position and remain within a 320px viewport, verified in Thai and English. Desktop retains the shared two-line heading.

FORM: Code-led template specimen explorer extending the existing presentation resources. No generated comp or randomized seed was used; the user's incumbent-theme constraint and supplied artifacts govern the surface.

FINISH: Independent visual review and documentation comparison completed. Original files and preview provenance are recorded below; ordinary-extension system files remain intact.

## Asset Provenance

- Current ZIP downloads: the user's public R2 URLs ending in `Presentation%20Oral%20Template.zip` and `Presentation%20Poster%20Template.zip`. Poster inline/modal previews use `poster.webp`, rendered from the original PDF. The supplied R2 `Poster.pdf` remains recorded as the original source URL, not the rendered preview. Per the cleanup request, the eight unused local originals/exports and their Oral/Poster directories were removed. Five Oral WebP previews were subsequently regenerated from original slides 1, 3, 4, 5 and 6 via native PowerPoint PNG export at 1600 x 900, then sharp quality 88. The entries below record historical source provenance.

- Oral archive and its three originals: supplied `C:/Users/JaoNo/Downloads/Presentation Oral Template.zip`, copied byte-for-byte. Archive SHA256: `464e8d27a35a39c89beb3d022546d6f3ec2d9b271fe13210136a838d78d0e3b0`.
- Poster archive and its two originals: supplied `C:/Users/JaoNo/Downloads/Presentation Poster Template.zip`, copied byte-for-byte. Archive SHA256: `6185c6fccc74a9e51388a3379794ae1032c715fcf380d6a197ef3a2b6b758ca9`.
- `oral-preview.pdf`: native PowerPoint PDF export of all 18 original slides.
- Oral PowerPoint preview source: `https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract/PRIS2026_Presentation%20Template.pptx`. Office Viewer uses the URL-encoded source in `src`; the original five exported thumbnail assets were removed when this preview replaced them.
- `previews/poster.webp`: original Poster.pdf rendered with Poppler, optimized with sharp at quality 88. Source page proportions retained.

## Verified Result

Focused ESLint, TypeScript and production build passed. Five focused tests passed, including archive SHA256 integrity and localized reload behavior. All eight document download/preview endpoints returned HTTP 200 with the expected MIME type; Oral PDF contains 18 pages. Browser checks covered thumbnail selection, keyboard tab activation, refresh, navigation, language switching, loaded imagery, and no horizontal overflow at 320, 390, 926 and 1440px.

Independent Impeccable finish reviewer: `ship`, no material fixes. Documenter comparison passed; ticket-focused PRODUCT.md/DESIGN.md and the absent design sidecar were left intact. Screenshots are development-only under `.impeccable/review/presentation-templates/`. No deployment or physical mobile-device check performed.

## Direct PowerPoint Preview Verification

The subsequent user-authorized viewer replacement passed focused ESLint, TypeScript, production build, the two template tests and the design detector. The tests cover the public R2 URL and correct Office Viewer encoding, plus unchanged ZIP/file downloads. Live screenshots confirm original slides render in the embedded viewer on desktop and mobile. The frame stays inside the page at 320px and 390px; Poster still renders correctly and the PDF fallback remains visible. The old independent review above applies to the original surface, not this later replacement.

Next/Previous were verified in the standalone Microsoft viewer for this exact source. Automated navigation inside the nested embedded frame could not be verified because the browser tool rejected fractional iframe input coordinates. No deployment or physical mobile-device check performed.

## Preview And File List Refinement

The subsequent five-point user refinement italicized the Oral caption, removed visible preview links while preserving expansion icons, made file rows name/description-only and noninteractive, renamed the related announcement link, and removed the abstract-guidelines link. ZIP download actions remain. Focused ESLint and TypeScript passed. Desktop screenshots and DOM checks confirm both panels have zero caption/file-row links, one expansion link, and one ZIP action; the related navigation has only the requested announcement. After resetting the viewport override, the actual 441px browser viewport provided mobile verification: both previews render, the title remains on one line, Oral's caption is italic, and the page has no horizontal overflow. Earlier 320px and 390px checks above apply to the previous version. No deployment or physical mobile-device check performed.

The subsequent R2 resource update passed three focused tests and ESLint. All three supplied URLs returned HTTP 200 with the expected ZIP/PDF MIME types and original byte sizes. Browser checks confirmed both rendered ZIP links and the Poster expansion link use the exact supplied URLs. Local originals were preserved; no production build or deployment repeated for this data-only update.

The user then requested removal of unused local files. Eight files (26,646,399 bytes) were removed from the Oral/Poster asset directories, preserving `previews/poster.webp` and leaving the user's Downloads originals untouched. Unused local URL helpers/PDF metadata and obsolete local-original integrity tests were removed. The tests now cover the remote resource URLs and retained WebP preview. Three focused tests, ESLint and TypeScript passed; no production build or deployment repeated.

## Five-Image Oral And R2 Poster Preview

The latest user refinement restores five selectable Oral images and keeps PowerPoint exclusively behind the expansion icon. Poster now renders the R2 PDF with PDF.js; `poster.webp` is preserved, not used as the preview. Native PDF embedding remained blank in the in-app browser, and Google Viewer refused embedding, so neither is shipped. The final implementation fetches directly from R2, with no proxy or third-party document viewer.

Four focused tests, ESLint, TypeScript, production build and the design detector passed. Desktop (1280px) and mobile (441px) screenshots confirm both previews render with no horizontal overflow. All five thumbnail selections and English keyboard selection were checked. The mobile PDF screenshot's canvas region contained 10,374 nonwhite pixels, and desktop console checks reported no errors. The earlier independent review applies to the initial surface, not this refinement. No deployment or physical mobile-device verification performed.

## Fullscreen Preview Dialogs

The latest request replaces new-tab expansion with fullscreen Base UI dialogs for both template types. Oral embeds the existing Office Viewer; Poster reuses the R2 PDF.js renderer. Existing inline previews, assets, ZIP actions and preparation guidance are unchanged. Four resource/asset tests, focused ESLint, TypeScript, production build and the design detector passed.

Live browser checks at 1280 x 720 and 441 x 884 confirmed viewport-sized dialogs, loaded documents, no horizontal overflow and no new tabs. The Poster focus trap, background scroll lock, close button, and Escape/focus restoration in Thai and English were checked. Escape was tested with focus on the modal close control; keys inside the cross-origin Office frame belong to that viewer. No deployment or physical mobile-device verification performed.

## Contained Dialogs And WebP Restoration

The latest refinement replaces fullscreen sizing with centered, viewport-bounded dialogs: Oral caps at 1100 x 720px and Poster at 620 x 860px, both with desktop viewport margins and narrower mobile sizing. Poster uses the retained WebP in both inline and expanded views. `PosterPdfPreview.tsx`, PDF-only styles/translations and the `pdfjs-dist` dependency were removed; package manifests match their pre-PDF.js state.

Four focused tests, ESLint, TypeScript, production build and the design detector passed. Source/manifest scans found no PDF.js references. Browser checks confirmed loaded WebP images and no canvas/PDF iframe. At 1280 x 720, Oral measured 1100 x 656 and Poster 620 x 656; at 441 x 884, Oral measured 417 x 322.56 and Poster 417 x 760. Both retain surrounding page context and working close/Escape behavior. No deployment or physical mobile-device verification performed.

## File Metadata Restoration

The latest request restores extension and file-size details to the read-only file rows for both template types. Sizes use the original recorded byte counts, formatted to one decimal with the site's 1024-based KB/MB labels. Desktop metadata is aligned right; mobile metadata appears below the description. No individual downloads or icons were added, and previews/download actions are unchanged.

Five focused tests, ESLint, TypeScript and the design detector passed. Live checks at 1280px and 441px confirmed all five file entries show the correct type/size, no file-row links and no horizontal overflow. Production build and deployment were not repeated for this narrow display change.
