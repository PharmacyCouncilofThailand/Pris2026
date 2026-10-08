import type { EventSpeaker } from "@/types";

export function formatAgendaTitle(title: string) {
  return title.replace(/\s+(?=สาขา)/, "\n");
}

export function formatAgendaTime(time: string, locale: string) {
  return locale === "th" && !time.endsWith("น.") ? `${time} น.` : time;
}

export function getAgendaDescription(description?: string) {
  const match = description?.match(
    /^(?:จัดโดย|โดย|Organized by|By)\s+(.+?)(?:\n([\s\S]+)|, (conducted by .+))?$/i,
  );
  return {
    organizer: match?.[1],
    description: match ? (match[2] ?? match[3]) : description,
  };
}

export function groupAgendaSpeakers(people: EventSpeaker[]) {
  const groups: Record<"speakers" | "moderators" | "chairs", EventSpeaker[]> = {
    speakers: [],
    moderators: [],
    chairs: [],
  };
  for (const person of people) {
    if (person.role === "Moderator" || person.roleTh === "ผู้ดำเนินรายการ") {
      groups.moderators.push(person);
    } else if (person.role === "Chair") {
      groups.chairs.push(person);
    } else {
      groups.speakers.push(person);
    }
  }
  return groups;
}
