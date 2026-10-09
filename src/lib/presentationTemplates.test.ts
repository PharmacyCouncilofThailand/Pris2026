import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatTemplateFileSize,
  oralPreviewSlides,
  presentationTemplates,
} from "../data/presentationTemplates";

const publicFile = (url: string) =>
  new URL(`../../public${decodeURIComponent(url)}`, import.meta.url);

test("template file sizes use the site's 1024-based KB and MB labels", () => {
  assert.equal(formatTemplateFileSize(9965106), "9.5 MB");
  assert.equal(formatTemplateFileSize(648028), "632.8 KB");
  assert.equal(formatTemplateFileSize(311010), "303.7 KB");
  assert.equal(formatTemplateFileSize(167670), "163.7 KB");
  assert.equal(formatTemplateFileSize(1529720), "1.5 MB");
  assert.equal(formatTemplateFileSize(1024 * 1024), "1.0 MB");
});

test("PowerPoint preview reads the exact public R2 source, without local file URLs", () => {
  const { previewUrl, sourceUrl } = presentationTemplates.oral;
  const viewer = new URL(previewUrl);
  assert.equal(viewer.origin, "https://view.officeapps.live.com");
  assert.equal(viewer.pathname, "/op/embed.aspx");
  assert.equal(viewer.searchParams.get("src"), sourceUrl);
  assert.equal(
    new URL(sourceUrl).hostname,
    "pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev",
  );
  assert.equal(
    decodeURIComponent(new URL(sourceUrl).pathname),
    "/Template Abstract/PRIS2026_Presentation Template.pptx",
  );
});

test("template downloads and original Poster source use the supplied public R2 URLs", () => {
  const remoteBase =
    "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract";
  assert.equal(
    presentationTemplates.oral.archive,
    `${remoteBase}/Presentation%20Oral%20Template.zip`,
  );
  assert.equal(
    presentationTemplates.poster.archive,
    `${remoteBase}/Presentation%20Poster%20Template.zip`,
  );
  assert.equal(
    presentationTemplates.poster.previewUrl,
    `${remoteBase}/Poster.pdf`,
  );
});

test("the local Poster preview image remains available", () => {
  assert.equal(
    presentationTemplates.poster.previewImage,
    "/documents/presentation-templates/previews/poster.webp",
  );
  const bytes = readFileSync(
    publicFile(presentationTemplates.poster.previewImage),
  );
  assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
});

test("Oral has exactly five original slide preview images", () => {
  assert.deepEqual(
    oralPreviewSlides.map((slide) => slide.number),
    [1, 3, 4, 5, 6],
  );
  assert.equal(new Set(oralPreviewSlides.map((slide) => slide.src)).size, 5);
  for (const slide of oralPreviewSlides) {
    const bytes = readFileSync(publicFile(slide.src));
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  }
});
