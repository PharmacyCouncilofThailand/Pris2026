import type { Recipient } from "../types/merchandise";
export function defaultRecipient(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
}): Recipient {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    fullName: name || user.name?.trim() || "",
    phone: user.phone?.trim() || "",
    addressLine: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    country: "TH",
    company: null,
    deliveryNote: null,
  };
}
export type RecipientErrors = Partial<Record<keyof Recipient, string>>;
export function validateRecipientDraft(value: Recipient): {
  recipient: Recipient | null;
  errors: RecipientErrors;
} {
  const errors: RecipientErrors = {};
  const cleaned: Recipient = {
    ...value,
    fullName: value.fullName.trim(),
    phone: value.phone.trim().replace(/[\s()-]/g, ""),
    addressLine: value.addressLine.trim(),
    subdistrict: value.subdistrict.trim(),
    district: value.district.trim(),
    province: value.province.trim(),
    postalCode: value.postalCode.trim(),
    company: value.company?.trim() || null,
    deliveryNote: value.deliveryNote?.trim() || null,
  };
  for (const [field, label, limit] of [
    ["fullName", "ชื่อ–นามสกุลผู้รับ", 200],
    ["addressLine", "ที่อยู่", 1000],
    ["subdistrict", "ตำบล/แขวง", 200],
    ["district", "อำเภอ/เขต", 200],
    ["province", "จังหวัด", 200],
  ] as const) {
    if (!cleaned[field]) errors[field] = `กรุณากรอก${label}`;
    else if (cleaned[field].length > limit)
      errors[field] = `${label}ยาวเกิน ${limit} ตัวอักษร`;
  }
  if (!/^(?:0[0-9]{8,9}|\+66[0-9]{8,9})$/.test(cleaned.phone))
    errors.phone = cleaned.phone
      ? "กรุณาตรวจสอบรูปแบบเบอร์โทรผู้รับในประเทศไทย"
      : "กรุณากรอกเบอร์โทรผู้รับ";
  else if (cleaned.phone.startsWith("+66"))
    cleaned.phone = `0${cleaned.phone.slice(3)}`;
  if (!/^[0-9]{5}$/.test(cleaned.postalCode))
    errors.postalCode = "กรุณากรอกรหัสไปรษณีย์ 5 หลัก";
  if (cleaned.country !== "TH") errors.country = "จัดส่งเฉพาะภายในประเทศไทย";
  if (cleaned.company && cleaned.company.length > 300)
    errors.company = "ชื่อบริษัทยาวเกิน 300 ตัวอักษร";
  if (cleaned.deliveryNote && cleaned.deliveryNote.length > 1000)
    errors.deliveryNote = "หมายเหตุจัดส่งยาวเกิน 1,000 ตัวอักษร";
  return { recipient: Object.keys(errors).length ? null : cleaned, errors };
}
