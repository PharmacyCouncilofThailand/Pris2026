"use client";

import Image from "next/image";
import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Clock3,
  Images,
  Layers,
  Maximize2,
  MessageCircle,
  Mic2,
  PanelTop,
  Scan,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import PageHero from "@/components/sections/PageHero";
import {
  formatTemplateFileSize,
  oralPreviewSlides,
  presentationTemplates,
} from "@/data/presentationTemplates";
import styles from "./templates.module.css";
import TemplatePreviewDialog from "./TemplatePreviewDialog";

export default function PresentationTemplatesPage() {
  const t = useTranslations("presentationTemplates");
  const locale = useLocale();
  const [selectedSlide, setSelectedSlide] = useState(0);
  const activeSlide = oralPreviewSlides[selectedSlide];

  return (
    <main lang={locale} className={styles.page}>
      <PageHero
        eyebrow="PRIS 2026"
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      <div className={styles.container}>
        <Tabs.Root defaultValue="oral" className={styles.tabs}>
          <Tabs.List className={styles.tabList} aria-label={t("types")}>
            <Tabs.Tab value="oral" className={styles.tab}>
              <Mic2 size={20} aria-hidden="true" />
              <span>Oral Presentation</span>
            </Tabs.Tab>
            <Tabs.Tab value="poster" className={styles.tab}>
              <PanelTop size={20} aria-hidden="true" />
              <span>Poster Presentation</span>
            </Tabs.Tab>
          </Tabs.List>

          {(["oral", "poster"] as const).map((type) => {
            const isOral = type === "oral";
            const template = presentationTemplates[type];
            return (
              <Tabs.Panel
                key={type}
                value={type}
                data-template={type}
                className={styles.panel}
              >
                <div className={styles.workspace}>
                  <figure className={styles.preview}>
                    <div className={styles.previewBar}>
                      <span>
                        {t(isOral ? "slidePreview" : "posterPreview")}
                      </span>
                      <TemplatePreviewDialog type={type} />
                    </div>
                    <div
                      className={
                        isOral ? styles.slideStage : styles.posterStage
                      }
                    >
                      {isOral ? (
                        <Image
                          src={activeSlide.src}
                          alt={t("slideAlt", {
                            label: t(`previewLabels.${activeSlide.label}`),
                            number: activeSlide.number,
                          })}
                          width={1600}
                          height={900}
                          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 55vw, 670px"
                          className={styles.documentImage}
                        />
                      ) : (
                        <Image
                          src={presentationTemplates.poster.previewImage}
                          alt={t("posterAlt")}
                          width={1219}
                          height={1800}
                          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 55vw, 670px"
                          className={styles.posterImage}
                        />
                      )}
                    </div>
                    {isOral && (
                      <div
                        className={styles.previewChoices}
                        role="group"
                        aria-label={t("slidePreview")}
                      >
                        {oralPreviewSlides.map((slide, index) => (
                          <button
                            key={slide.number}
                            type="button"
                            className={styles.previewChoice}
                            data-active={selectedSlide === index}
                            aria-pressed={selectedSlide === index}
                            aria-label={t("slideAlt", {
                              label: t(`previewLabels.${slide.label}`),
                              number: slide.number,
                            })}
                            onClick={() => setSelectedSlide(index)}
                          >
                            <Image
                              src={slide.src}
                              alt=""
                              width={1600}
                              height={900}
                              sizes="(max-width: 767px) 20vw, 130px"
                              className={styles.thumbnailImage}
                            />
                            <span>{t(`previewLabels.${slide.label}`)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <figcaption className={styles.caption}>
                      <em>{t(isOral ? "oralCaption" : "posterCaption")}</em>
                    </figcaption>
                  </figure>

                  <section
                    className={styles.details}
                    aria-labelledby={`${type}-title`}
                  >
                    <h2 id={`${type}-title`}>{t(`${type}.title`)}</h2>
                    <p className={styles.description}>
                      {t(`${type}.description`)}
                    </p>
                    <h3>{t("preparation")}</h3>
                    <ul className={styles.guidelines}>
                      {(isOral
                        ? ([
                            { Icon: Layers, key: "oral.slides" },
                            { Icon: Images, key: "oral.images" },
                            { Icon: Clock3, key: "oral.duration" },
                            { Icon: MessageCircle, key: "oral.questions" },
                          ] as const)
                        : ([
                            { Icon: Scan, key: "poster.ratio" },
                            { Icon: Maximize2, key: "poster.margins" },
                            { Icon: Images, key: "poster.images" },
                            { Icon: PanelTop, key: "poster.header" },
                          ] as const)
                      ).map(({ Icon, key }) => (
                        <li key={key}>
                          <Icon size={19} aria-hidden="true" />
                          <span>{t(key)}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={template.archive}
                      download
                      className={styles.download}
                    >
                      <ArrowDownToLine size={19} aria-hidden="true" />
                      {t("download", { type: isOral ? "Oral" : "Poster" })}
                      <span className={styles.zip}>ZIP</span>
                    </a>
                    <p className={styles.downloadNote}>
                      {t(`${type}.package`)}
                    </p>
                  </section>
                </div>

                <section
                  className={styles.files}
                  aria-labelledby={`${type}-files`}
                >
                  <div className={styles.sectionHeading}>
                    <h2 id={`${type}-files`}>{t("files")}</h2>
                    <span>
                      {t("fileCount", { count: template.files.length })}
                    </span>
                  </div>
                  <ul className={styles.fileList}>
                    {template.files.map((file) => (
                      <li key={file.name} className={styles.fileRow}>
                        <div className={styles.fileIdentity}>
                          <p className={styles.fileName}>{file.name}</p>
                          <p className={styles.fileDescription}>
                            {t(`fileLabels.${file.label}`)}
                          </p>
                        </div>
                        <div className={styles.fileMeta}>
                          <span>{file.kind}</span>
                          <span>{formatTemplateFileSize(file.bytes)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </Tabs.Panel>
            );
          })}
        </Tabs.Root>

        <nav className={styles.related} aria-label={t("related")}>
          <Link href="/approved-abstracts">
            {t("acceptedAbstracts")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
}
