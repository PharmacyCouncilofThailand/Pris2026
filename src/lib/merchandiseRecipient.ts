import type { CartDto, Recipient } from "../types/merchandise";

export type RecipientDraft = Record<keyof Recipient, string>;
export type RecipientErrors = Partial<Record<keyof Recipient, string>>;

/** Mirrors the API: strips spaces/dashes/parentheses, maps +66 to 0, then 0 + 8-9 digits. */
export function normalizePhone(raw: string): string | null {
  let value = raw.replace(/[\s\-()]/g, "");
  if (value.startsWith("+66")) value = `0${value.slice(3)}`;
  return /^0\d{8,9}$/.test(value) ? value : null;
}

export function emptyRecipient(
  defaults: CartDto["buyerDefaults"],
): RecipientDraft {
  return {
    fullName: defaults.fullName ?? "",
    phone: defaults.phone ?? "",
    addressLine: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    company: "",
    deliveryNote: "",
  };
}

const REQUIRED = [
  ["fullName", "ชื่อ–นามสกุลผู้รับ", 200],
  ["addressLine", "ที่อยู่", 500],
  ["subdistrict", "ตำบล/แขวง", 100],
  ["district", "อำเภอ/เขต", 100],
  ["province", "จังหวัด", 100],
] as const;

export function validateRecipient(
  d: RecipientDraft,
): { ok: true; value: Recipient } | { ok: false; errors: RecipientErrors } {
  const errors: RecipientErrors = {};
  const t = (k: keyof Recipient) => (d[k] ?? "").trim();
  for (const [field, label, limit] of REQUIRED) {
    const v = t(field);
    if (!v) errors[field] = `กรุณากรอก${label}`;
    else if (v.length > limit)
      errors[field] = `${label}ยาวเกิน ${limit} ตัวอักษร`;
  }
  const rawPhone = (d.phone ?? "").trim();
  const phone = rawPhone.length <= 30 ? normalizePhone(rawPhone) : null;
  if (!phone)
    errors.phone = rawPhone
      ? "กรุณาตรวจสอบรูปแบบเบอร์โทรผู้รับในประเทศไทย"
      : "กรุณากรอกเบอร์โทรผู้รับ";
  if (!/^\d{5}$/.test(t("postalCode")))
    errors.postalCode = "กรุณากรอกรหัสไปรษณีย์ 5 หลัก";
  const company = t("company");
  const deliveryNote = t("deliveryNote");
  if (company.length > 200) errors.company = "ชื่อบริษัทยาวเกิน 200 ตัวอักษร";
  if (deliveryNote.length > 500)
    errors.deliveryNote = "หมายเหตุจัดส่งยาวเกิน 500 ตัวอักษร";
  if (Object.keys(errors).length || !phone) return { ok: false, errors };
  return {
    ok: true,
    value: {
      fullName: t("fullName"),
      phone,
      addressLine: t("addressLine"),
      subdistrict: t("subdistrict"),
      district: t("district"),
      province: t("province"),
      postalCode: t("postalCode"),
      company: company || null,
      deliveryNote: deliveryNote || null,
    },
  };
}
