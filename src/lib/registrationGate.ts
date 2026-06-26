/**
 * Central switch for the "registration / abstract submission not open yet" state.
 *
 * While `REGISTRATION_OPEN` is `false`, all registration (buy-ticket) and
 * abstract-submission CTAs across the site are shown but disabled, displaying
 * `REGISTRATION_NOTICE` instead of their normal label.
 *
 * To open registration (1 July 2569 / 2026), simply set `REGISTRATION_OPEN` to
 * `true` — every gated button returns to its normal clickable behaviour.
 */
export const REGISTRATION_OPEN = false;

/** Notice shown on disabled CTAs while registration is not open. */
export const REGISTRATION_NOTICE = "เปิดลงทะเบียนวันที่ 1 กรกฎาคม 2569";

/**
 * Same idea for abstract submission CTAs. Kept separate so registration and
 * abstract submission can be opened independently.
 */
export const ABSTRACT_OPEN = false;

/** Notice shown on disabled abstract-submission CTAs while not open. */
export const ABSTRACT_NOTICE = "เปิดรับบทคัดย่อวันที่ 1 กรกฎาคม 2569";
