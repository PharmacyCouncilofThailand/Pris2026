import test from "node:test";
import assert from "node:assert/strict";
import { emptyRecipient, normalizePhone, validateRecipient, type RecipientDraft } from "./merchandiseRecipient";

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
