import test from "node:test";
import assert from "node:assert/strict";
import { emptyRecipient, formatRecipientLine, normalizePhone, validateRecipient, type RecipientDraft } from "./merchandiseRecipient";
import type { Recipient } from "../types/merchandise";

const ok: RecipientDraft = {
  fullName: " สมชาย ใจดี ", phone: "+66 81-234-5678", addressLine: "1 ถนน", subdistrict: "ก",
  district: "ข", province: "ค", postalCode: "10100", company: "  ", deliveryNote: "",
};
test("normalizePhone", () => {
  assert.equal(normalizePhone("+66 81-234-5678"), "0812345678");
  assert.equal(normalizePhone("12345"), null);
});
test("valid draft normalizes", () => {
  const r = validateRecipient(ok);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.fullName, "สมชาย ใจดี");
    assert.equal(r.value.phone, "0812345678");
    assert.equal(r.value.company, null);
    assert.equal(r.value.deliveryNote, null);
  }
});
test("errors", () => {
  const e = (d: Partial<RecipientDraft>) => {
    const r = validateRecipient({ ...ok, ...d });
    return r.ok ? {} : r.errors;
  };
  assert.ok(e({ postalCode: "1010" }).postalCode);
  assert.ok(e({ fullName: "ก".repeat(201) }).fullName);
  assert.equal(e({ province: "" }).province, "กรุณากรอกจังหวัด");
  assert.equal(e({ phone: "" }).phone, "กรุณากรอกเบอร์โทรผู้รับ");
  assert.ok(e({ phone: "12345" }).phone);
});
test("emptyRecipient uses buyer defaults", () => {
  const d = emptyRecipient({ fullName: "A", phone: null, email: "a@b.c" });
  assert.equal(d.fullName, "A");
  assert.equal(d.phone, "");
});

const base: Recipient = {
  fullName: "ผู้รับ ทดสอบ", phone: "0812345678", addressLine: "99 ถนนสังเคราะห์", subdistrict: "ตำบลทดสอบ",
  district: "อำเภอทดสอบ", province: "กรุงเทพมหานคร", postalCode: "10100", company: null, deliveryNote: null,
};
test("recipient line joins parts with single spaces and ends with ประเทศไทย", () =>
  assert.equal(formatRecipientLine(base),
    "ผู้รับ ทดสอบ 0812345678 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
test("company is included after the phone when present", () =>
  assert.equal(formatRecipientLine({ ...base, company: "บริษัท ก" }),
    "ผู้รับ ทดสอบ 0812345678 บริษัท ก 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
test("empty and whitespace-only company are omitted and the delivery note is excluded", () =>
  assert.equal(formatRecipientLine({ ...base, company: "  ", deliveryNote: "โทรก่อน" }),
    "ผู้รับ ทดสอบ 0812345678 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
test("newlines and runs of whitespace inside a part collapse to single spaces", () =>
  assert.equal(formatRecipientLine({ ...base, fullName: "ผู้รับ\t\tทดสอบ", addressLine: "99 หมู่ 1\r\nถนนสังเคราะห์\n  ซอย 2 " }),
    "ผู้รับ ทดสอบ 0812345678 99 หมู่ 1 ถนนสังเคราะห์ ซอย 2 ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
