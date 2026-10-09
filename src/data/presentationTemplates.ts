const remoteBase =
  "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract";
const oralSource = `${remoteBase}/PRIS2026_Presentation%20Template.pptx`;
const posterSource = `${remoteBase}/Poster.pdf`;

export const oralPreviewSlides = [
  { number: 1, label: "cover" },
  { number: 3, label: "dark" },
  { number: 4, label: "color" },
  { number: 5, label: "blank" },
  { number: 6, label: "guidance" },
].map((slide) => ({
  ...slide,
  src: `/documents/presentation-templates/previews/oral-${slide.number}.webp`,
}));

export const presentationTemplates = {
  oral: {
    archive: `${remoteBase}/Presentation%20Oral%20Template.zip`,
    sourceUrl: oralSource,
    previewUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(oralSource)}`,
    files: [
      {
        name: "PRIS2026_Presentation Template.pptx",
        bytes: 9965106,
        kind: "PPTX",
        label: "slides",
      },
      {
        name: "Presentation Header.png",
        bytes: 648028,
        kind: "PNG",
        label: "header",
      },
      {
        name: "Presentation Footer.png",
        bytes: 311010,
        kind: "PNG",
        label: "footer",
      },
    ],
  },
  poster: {
    archive: `${remoteBase}/Presentation%20Poster%20Template.zip`,
    previewUrl: posterSource,
    previewImage: "/documents/presentation-templates/previews/poster.webp",
    files: [
      { name: "Poster.pdf", bytes: 167670, kind: "PDF", label: "posterGuide" },
      {
        name: "Poster Header.png",
        bytes: 1529720,
        kind: "PNG",
        label: "header",
      },
    ],
  },
} as const;

export function formatTemplateFileSize(bytes: number) {
  const isMegabytes = bytes >= 1024 * 1024;
  const size = bytes / (isMegabytes ? 1024 * 1024 : 1024);
  return `${size.toFixed(1)} ${isMegabytes ? "MB" : "KB"}`;
}
