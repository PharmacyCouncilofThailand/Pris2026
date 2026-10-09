import assert from "node:assert/strict";
import test from "node:test";
import { createRequire, Module } from "node:module";
import type { ReactTestRenderer } from "react-test-renderer";
import type { OwnerPresentationDto, UploadDto } from "../types/presentations";
import en from "../../messages/en.json";
import th from "../../messages/th.json";

const require = createRequire(import.meta.url);
const globals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const upload: UploadDto = {
  id: "u1",
  version: 1,
  fileName: "old.pdf",
  mimeType: "application/pdf",
  sizeBytes: 100,
  storedFileName: "old.pdf",
  storageProvider: "r2",
  driveFileId: null,
  fileUrl: "https://example.invalid/old.pdf",
  receivedAt: "2026-10-07T04:00:00Z",
  revisionRequestId: null,
};
const owner: OwnerPresentationDto = {
  abstractId: 51,
  trackingId: "SYNTHETIC-P001",
  title: "Synthetic work",
  submitterName: "Synthetic Author",
  presentationType: "highlighted-poster",
  categoryName: "Synthetic category",
  round: 1,
  serverNow: "2026-10-07T00:00:00Z",
  mainClosesAt: "2026-10-15T17:00:00Z",
  canUpload: true,
  blockCode: null,
  mode: "initial",
  selectedRequest: null,
  currentUpload: null,
  uploads: [],
};

test("TH/EN workspace selection/progress/locks/revision/history and native receipt focus lifecycle", async () => {
  const React = require("react") as typeof import("react");
  const { act, create } =
    require("react-test-renderer") as typeof import("react-test-renderer");
  const path = require.resolve("next-intl"),
    previous = require.cache[path],
    originalDocument = globalThis.document;
  const animationPaths = ["gsap", "@gsap/react"].map((name) =>
    require.resolve(name),
  );
  const originalAnimations = animationPaths.map((path) => require.cache[path]);
  const originalAct = globals.IS_REACT_ACT_ENVIRONMENT,
    originalHTMLElement = globalThis.HTMLElement;
  let locale = "en",
    renderer: ReactTestRenderer | undefined,
    modal = 0,
    closed = 0,
    cancel = 0,
    focused = 0;
  const messages = () => (locale === "th" ? th.presentation : en.presentation);
  const lookup = (key: string): string | undefined =>
    key
      .split(".")
      .reduce<unknown>(
        (value, name) =>
          value && typeof value === "object"
            ? (value as Record<string, unknown>)[name]
            : undefined,
        messages(),
      ) as string | undefined;
  const translator = Object.assign(
    (key: string, values: Record<string, string | number> = {}) => {
      const value = lookup(key);
      assert.ok(value, `missing ${locale} presentation.${key}`);
      return value.replace(/\{(\w+)\}/g, (_match, name: string) =>
        String(values[name] ?? `{${name}}`),
      );
    },
    { has: (key: string) => !!lookup(key) },
  );
  try {
    globals.IS_REACT_ACT_ENVIRONMENT = true;
    animationPaths.forEach((path, index) => {
      const fake = new Module(path);
      fake.exports = index === 0 ? { from() {} } : { useGSAP() {} };
      require.cache[path] = fake;
    });
    const intlModule = new Module(path);
    intlModule.exports = {
      useTranslations: () => translator,
      useLocale: () => locale,
    };
    require.cache[path] = intlModule;
    class FocusTarget {
      isConnected = true;
      focus() {
        focused++;
      }
    }
    globalThis.HTMLElement = FocusTarget as unknown as typeof HTMLElement;
    globalThis.document = {
      activeElement: new FocusTarget(),
    } as unknown as Document;
    const {
      PresentationWorkspace,
    } = require("../components/presentations/PresentationWorkspace");
    const {
      PresentationSuccessDialog,
    } = require("../components/presentations/PresentationSuccessDialog");
    const props = {
      owner,
      file: new File(["selected"], "<script>.pdf", { type: "application/pdf" }),
      onFile: () => {},
      onSubmit: () => {},
      sending: false,
      progress: 0,
      error: null,
    };
    for (locale of ["en", "th"]) {
      await act(async () => {
        renderer = create(React.createElement(PresentationWorkspace, props));
      });
      const heading = renderer!.root.findByType("h1");
      assert.ok(
        heading
          .findAllByType("span")
          .some((node) => node.children.includes(messages().heroTitle)),
      );
      const gradient = heading
        .findAllByType("span")
        .find((node) => node.children.includes(messages().highlighted))!;
      assert.ok(gradient.props.className.includes("bg-gradient-to-r"));
      assert.equal(heading.props.className.includes("md:flex-nowrap"), false);
      assert.ok(gradient.props.className.split(" ").includes("block"));
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(messages().selected),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().requirementsPoster.replace("{maxMB}", "30"),
        ),
      );
      for (const key of [
        "preparationTitlePoster",
        "posterDimensions",
        "posterImages",
        "posterTemplate",
      ] as const)
        assert.ok(JSON.stringify(renderer!.toJSON()).includes(messages()[key]));
      const rules = renderer!.root
        .findByType("ol")
        .findAllByType("li")
        .map((node) => node.children.join(""));
      assert.deepEqual(rules, [
        messages().posterTemplate,
        messages().posterDimensions,
        messages().posterImages,
        messages().requirementsPoster.replace("{maxMB}", "30"),
        messages().pdfNoPassword,
      ]);
      assert.equal(
        JSON.stringify(renderer!.toJSON()).includes("{maxMB}"),
        false,
      );
      const templateLink = renderer!.root
        .findAllByType("a")
        .find(
          (node) =>
            node.props.href ===
            "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract/Presentation%20Poster%20Template.zip",
        );
      assert.ok(templateLink);
      assert.ok(
        templateLink.children.includes(messages().downloadPosterTemplate),
      );
      assert.equal(templateLink.props.rel, "noopener noreferrer");
      assert.equal(renderer!.root.findAllByType("input").length, 0);
      assert.equal(renderer!.root.findAllByType("iframe").length, 1);
      await act(async () => {
        renderer!.update(
          React.createElement(PresentationWorkspace, {
            ...props,
            file: new File(["png"], "poster.png", { type: "image/png" }),
          }),
        );
      });
      assert.equal(renderer!.root.findAllByType("iframe").length, 0);
      assert.ok(
        renderer!.root
          .findAllByType("img")
          .some((node) => node.props.alt === "poster.png"),
      );
      await act(async () => {
        renderer!.update(React.createElement(PresentationWorkspace, props));
      });
      assert.equal(
        renderer!.root
          .findAllByType("dt")
          .some(
            (node) =>
              node.children.includes(messages().round) ||
              node.children.includes(messages().version),
          ),
        false,
      );
      assert.equal(
        renderer!.root
          .findAllByType("a")
          .some((node) => String(node.props.href).startsWith("mailto:")),
        false,
      );
      await act(async () =>
        renderer!.update(
          React.createElement(PresentationWorkspace, { ...props, file: null }),
        ),
      );
      assert.equal(renderer!.root.findAllByType("input").length, 1);
      assert.equal(
        renderer!.root.findByType("input").props.accept,
        "application/pdf,image/png,.pdf,.png",
      );
      assert.equal(JSON.stringify(renderer!.toJSON()).includes("PNG"), true);
      assert.equal(renderer!.root.findAllByType("iframe").length, 0);
      await act(async () =>
        renderer!.update(React.createElement(PresentationWorkspace, props)),
      );
      assert.equal(
        JSON.stringify(renderer!.toJSON()).includes(messages().received),
        false,
      );
      await act(async () =>
        renderer!.update(
          React.createElement(PresentationWorkspace, {
            ...props,
            sending: true,
            progress: 100,
          }),
        ),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(messages().checking),
      );
      assert.equal(
        renderer!.root
          .findAllByType("button")
          .some((node) => !node.props.disabled),
        false,
      );
      for (const code of [
        "PRESENTATION_DEADLINE_PASSED",
        "PRESENTATION_REQUEST_EXPIRED",
        "PRESENTATION_REQUEST_CANCELLED",
        "PRESENTATION_ALREADY_SUBMITTED",
        "UNKNOWN_BLOCK",
      ]) {
        await act(async () =>
          renderer!.update(
            React.createElement(PresentationWorkspace, {
              ...props,
              file: null,
              owner: { ...owner, canUpload: false, blockCode: code },
            }),
          ),
        );
        assert.equal(renderer!.root.findAllByType("input").length, 0);
        assert.equal(renderer!.root.findAllByType("button").length, 0);
      }
      const legacyUpload: UploadDto = {
        ...upload,
        id: "u0",
        version: 0,
        fileName: "previous.pdf",
        mimeType: "application/pdf",
        fileUrl: "https://example.invalid/previous.pdf",
      };
      const revision = {
        ...owner,
        mode: "revision",
        currentUpload: upload,
        uploads: [upload, legacyUpload],
        selectedRequest: {
          id: "r1",
          details: "Keep original while revising\nSynthetic detail",
          closesAt: "2026-10-20T17:00:00Z",
          status: "open",
          createdAt: "2026-10-07T00:00:00Z",
          requestedBy: 1,
          submittedAt: null,
          cancelledAt: null,
          cancelledBy: null,
          cancellationReason: null,
        },
      };
      await act(async () =>
        renderer!.update(
          React.createElement(PresentationWorkspace, {
            ...props,
            owner: revision,
            file: null,
            error: "PRESENTATION_FILE_INVALID",
          }),
        ),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes("Synthetic detail"),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().revisionHeroTitle,
        ),
      );
      assert.equal(
        renderer!.root
          .findAllByType("a")
          .filter((node) => node.props.href === upload.fileUrl).length,
        1,
      );
      assert.equal(
        renderer!.root
          .findAllByType("a")
          .some((node) => node.props.href === legacyUpload.fileUrl),
        true,
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().errors.PRESENTATION_FILE_INVALID,
        ),
      );
      const oralUpload: UploadDto = {
        ...upload,
        fileName: "slides.pdf",
        storedFileName: "SYNTHETIC-O001_slides.pdf",
        storageProvider: "drive",
        driveFileId: "drive-new",
        fileUrl: "https://drive.google.com/file/d/drive-new/view",
      };
      const previousOral: UploadDto = {
        ...oralUpload,
        id: "previous",
        version: 0,
        driveFileId: "drive-old",
        fileUrl: "https://drive.google.com/file/d/drive-old/view",
      };
      const oralOwner = {
        ...revision,
        presentationType: "oral",
        currentUpload: oralUpload,
        uploads: [oralUpload, previousOral],
      };
      await act(async () =>
        renderer!.update(
          React.createElement(PresentationWorkspace, {
            ...props,
            owner: oralOwner,
            file: null,
            error: "PRESENTATION_PDF_PAGE_COUNT",
          }),
        ),
      );
      assert.ok(
        renderer!.root
          .findByType("h1")
          .findAllByType("span")
          .some((node) => node.children.includes(messages().oral)),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().requirementsOral.replace("{maxMB}", "50"),
        ),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().preparationTitleOral,
        ),
      );
      for (const key of [
        "posterDimensions",
        "posterImages",
        "posterTemplate",
      ] as const)
        assert.equal(
          JSON.stringify(renderer!.toJSON()).includes(messages()[key]),
          false,
        );
      assert.equal(
        JSON.stringify(renderer!.toJSON()).includes(
          locale === "th" ? "อย่างน้อย 2 หน้า" : "at least 2 pages",
        ),
        false,
      );
      assert.equal(
        JSON.stringify(renderer!.toJSON()).includes("{maxMB}"),
        false,
      );
      assert.ok(JSON.stringify(renderer!.toJSON()).includes("50"));
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(messages().pageRuleOral),
      );
      assert.equal(
        JSON.stringify(renderer!.toJSON()).includes(oralUpload.storedFileName),
        false,
      );
      const oralTemplate = renderer!.root
        .findAllByType("a")
        .find((node) =>
          node.props.href.endsWith("Presentation%20Oral%20Template.zip"),
        );
      assert.ok(
        oralTemplate?.children.includes(messages().downloadOralTemplate),
      );
      for (const version of [oralUpload, previousOral])
        assert.ok(
          renderer!.root
            .findAllByType("a")
            .some(
              (node) =>
                node.props.href === version.fileUrl &&
                node.children.includes("slides.pdf"),
            ),
        );
      await act(async () =>
        renderer!.update(
          React.createElement(PresentationWorkspace, {
            ...props,
            owner: oralOwner,
            error: "PRESENTATION_FILE_TOO_LARGE",
          }),
        ),
      );
      assert.ok(
        JSON.stringify(renderer!.toJSON()).includes(
          messages().errors.PRESENTATION_FILE_TOO_LARGE.replace(
            "{maxMB}",
            "50",
          ),
        ),
      );
      await act(async () => renderer!.unmount());
    }
    await act(async () => {
      renderer = create(
        React.createElement(PresentationSuccessDialog, {
          upload: { ...upload, fileName: "<img onerror=attack>.pdf" },
          owner,
          onClose: () => {
            cancel++;
          },
        }),
        {
          createNodeMock: (element) =>
            element.type === "dialog"
              ? {
                  showModal() {
                    modal++;
                  },
                  close() {
                    closed++;
                  },
                }
              : null,
        },
      );
    });
    assert.equal(modal, 1);
    const tree = JSON.stringify(renderer!.toJSON());
    assert.ok(tree.includes(messages().receiptNotice));
    assert.ok(tree.includes("<img onerror=attack>.pdf"));
    assert.ok(tree.includes("11:00:00")); // server receivedAt displayed in Bangkok, not browser clock
    assert.equal(renderer!.root.findAllByType("img").length, 0);
    assert.equal(
      renderer!.root
        .findAllByType("dt")
        .some((node) => node.children.includes(messages().version)),
      false,
    );
    assert.equal(
      renderer!.root.findByType("dialog").props["aria-labelledby"],
      "presentation-receipt-title",
    );
    assert.ok(
      renderer!.root
        .findByType("dialog")
        .props.className.split(" ")
        .includes("m-auto"),
    );
    assert.equal(renderer!.root.findByType("button").props.autoFocus, true);
    let prevented = false;
    await act(async () =>
      renderer!.root.findByType("dialog").props.onCancel({
        preventDefault() {
          prevented = true;
        },
      }),
    );
    assert.equal(prevented, true);
    assert.equal(cancel, 1);
    await act(async () => renderer!.unmount());
    renderer = undefined;
    assert.equal(closed, 1);
    assert.equal(focused, 1);
    assert.deepEqual(
      Object.keys(th.presentation).sort(),
      Object.keys(en.presentation).sort(),
    );
    assert.deepEqual(
      Object.keys(th.presentation.errors).sort(),
      Object.keys(en.presentation.errors).sort(),
    );
  } finally {
    if (renderer) await act(async () => renderer?.unmount());
    globalThis.document = originalDocument;
    globalThis.HTMLElement = originalHTMLElement;
    globals.IS_REACT_ACT_ENVIRONMENT = originalAct;
    animationPaths.forEach((path, index) => {
      if (originalAnimations[index])
        require.cache[path] = originalAnimations[index];
      else delete require.cache[path];
    });
    if (previous) require.cache[path] = previous;
    else delete require.cache[path];
  }
});
