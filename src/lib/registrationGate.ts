/**
 * Central switch for the registration CTA.
 *
 * Registration remains independently controlled by REGISTRATION_OPEN. Abstract
 * submission uses a date-aware gate so Round 1 flows directly into Round 2 and
 * closes automatically after the approved Round 2 deadline.
 */
export const REGISTRATION_OPEN = true;

/** Notice shown on disabled CTAs while registration is not open. @deprecated Use i18n key registrationGate.registrationNotice */
export const REGISTRATION_NOTICE = "เปิดลงทะเบียนวันที่ 1 กรกฎาคม 2569";

export const ABSTRACT_ROUND_2_START_AT = new Date("2026-08-31T17:00:00.000Z");
export const ABSTRACT_SUBMISSION_CLOSE_AT = new Date("2026-09-20T17:00:00.000Z");

export interface AbstractGateState {
  open: boolean;
  phase: "round1" | "round2" | "closed";
}

export function getAbstractGateState(now: Date = new Date()): AbstractGateState {
  if (now < ABSTRACT_ROUND_2_START_AT) {
    return { open: true, phase: "round1" };
  }

  if (now < ABSTRACT_SUBMISSION_CLOSE_AT) {
    return { open: true, phase: "round2" };
  }

  return { open: false, phase: "closed" };
}

/** Notice shown on disabled abstract-submission CTAs while closed. @deprecated Use i18n key registrationGate.abstractNotice */
export const ABSTRACT_NOTICE = "ปิดรับบทคัดย่อแล้ว";
