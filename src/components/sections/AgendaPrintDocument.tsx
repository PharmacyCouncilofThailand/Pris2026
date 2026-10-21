import Image from "next/image";
import { useTranslations } from "next-intl";
import { scheduleData } from "@/data/scheduleData";
import {
  formatAgendaTime,
  getAgendaDescription,
  groupAgendaSpeakers,
} from "@/lib/agendaPresentation";
import {
  formatVenueGroupLabel,
  groupEventsForMobile,
} from "./eventScheduleLayout";
import type { Event } from "@/types";

function PrintEvent({ event, locale }: { event: Event; locale: string }) {
  const t = useTranslations("schedule");
  const isThai = locale === "th";
  const rawDescription = isThai
    ? event.descriptionTh || event.description
    : event.description || event.descriptionTh;
  const { organizer, description } = getAgendaDescription(rawDescription);
  const groups = groupAgendaSpeakers(event.speakers);
  const location = isThai ? event.locationTh || event.location : event.location;
  const station = event.group ? formatVenueGroupLabel(event.group) : "";
  const paragraphs = description?.split(/\n\s*\n/).filter(Boolean) ?? [];
  // Only short entries stay together. Research lists must flow across pages.
  const isCompact =
    (rawDescription?.length ?? 0) < 300 && event.speakers.length <= 3;

  return (
    <article
      className={`agenda-print-event${isCompact ? " agenda-print-event--compact" : ""}`}
      data-event-id={event.id}
    >
      <div className="agenda-print-time">
        <time>{formatAgendaTime(event.time, locale)}</time>
      </div>
      <div className="agenda-print-details">
        <div className="agenda-print-event-title">
          <p className="agenda-print-venue">
            {location}
            {station &&
              !location.toUpperCase().includes(station.toUpperCase()) &&
              !location.includes(`สถานี ${event.group?.match(/\d+/)?.[0]}`) && (
                <span className="agenda-print-station">{station}</span>
              )}
          </p>
          <h3>{isThai ? event.titleTh || event.title : event.title}</h3>
        </div>
        {organizer && (
          <p className="agenda-print-organizer">
            <span>{t("organizedBy")}</span> {organizer}
          </p>
        )}
        {(["speakers", "moderators", "chairs"] as const).map((group) =>
          groups[group].length ? (
            <div className="agenda-print-people" key={group}>
              <h4>
                {t(
                  group === "speakers"
                    ? "speakersTitle"
                    : group === "moderators"
                      ? "moderatorsTitle"
                      : "chairsTitle",
                )}
              </h4>
              <ul>
                {groups[group].map((person, index) => {
                  const role = isThai
                    ? person.roleTh || person.role
                    : person.role || person.roleTh;
                  // Standard roles are already expressed by the group heading.
                  const customRole = group === "speakers" && role;
                  return (
                    <li key={`${person.name}-${index}`}>
                      {isThai ? person.nameTh || person.name : person.name}
                      {customRole && (
                        <span className="agenda-print-role">
                          {" "}
                          ({customRole})
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null,
        )}
        {paragraphs.length > 0 && (
          <div className="agenda-print-description">
            {paragraphs.map((paragraph, index) => (
              <p
                className={
                  paragraph.length > 800
                    ? "agenda-print-paragraph--long"
                    : undefined
                }
                key={index}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function AgendaPrintDocument({ locale }: { locale: string }) {
  const t = useTranslations("schedule");
  const isThai = locale === "th";

  return (
    <article
      className="agenda-print-document"
      lang={locale}
      aria-label={t("printTitle")}
    >
      {scheduleData.map((day) => (
        <section className="agenda-print-day" key={day.day}>
          <header className="agenda-print-header">
            <Image
              src="/assets/Img/logo/Logo-Final%20.png"
              alt="PRIS 2026"
              width={1672}
              height={350}
              unoptimized
              loading="eager"
              className="agenda-print-logo"
            />
            <h1>{t("printTitle")}</h1>
            <p>{t("printConferenceName")}</p>
          </header>
          {/* One flow cell lets prose split naturally; the compact day header repeats. */}
          <table className="agenda-print-table" role="presentation">
            <thead>
              <tr>
                <td>
                  <div className="agenda-print-day-heading">
                    <h2>{isThai ? day.dateTh : day.date}</h2>
                    <span>{isThai ? day.dayTh : day.day}</span>
                  </div>
                  <div
                    className="agenda-print-column-headings"
                    aria-hidden="true"
                  >
                    <span>{t("time")}</span>
                    <span>{t("printSessionColumn")}</span>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {groupEventsForMobile(day.events)
                    .flatMap((group) => group.events)
                    .map((event) => (
                      <PrintEvent
                        key={event.id}
                        event={event}
                        locale={locale}
                      />
                    ))}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      ))}
    </article>
  );
}
