import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultRecipient,
  validateRecipientDraft,
} from "./merchandiseRecipient";
import { recipient } from "../../tests/merchandise/data";
test("recipient prefill uses only existing name/phone and never assumes an address", () => {
  const value = defaultRecipient({
    firstName: "ผู้ซื้อ",
    lastName: "ทดสอบ",
    phone: " 0812345678 ",
  });
  assert.equal(value.fullName, "ผู้ซื้อ ทดสอบ");
  assert.equal(value.phone, "0812345678");
  assert.equal(value.addressLine, "");
  assert.equal(value.province, "");
  assert.equal(value.country, "TH");
  assert.equal(value.company, null);
  assert.equal(defaultRecipient({ name: "ชื่อบัญชี" }).fullName, "ชื่อบัญชี");
  assert.equal(defaultRecipient({}).phone, "");
});
test("required manual Thai address fields and postcode preserve a leading zero without inventing geography", () => {
  assert.equal(
    validateRecipientDraft({ ...recipient, postalCode: "01234" }).recipient
      ?.postalCode,
    "01234",
  );
  for (const field of [
    "fullName",
    "phone",
    "addressLine",
    "subdistrict",
    "district",
    "province",
    "postalCode",
  ] as const) {
    const result = validateRecipientDraft({ ...recipient, [field]: "" });
    assert.equal(result.recipient, null);
    assert.ok(result.errors[field]);
  }
  assert.equal(
    validateRecipientDraft({ ...recipient, country: "US" } as never).recipient,
    null,
  );
});
test("Thai landline/mobile and +66 normalize consistently while invalid formats fail", () => {
  for (const phone of ["02-591-9992", "081 234 5678", "+66 81 234 5678"])
    assert.ok(validateRecipientDraft({ ...recipient, phone }).recipient);
  assert.equal(
    validateRecipientDraft({ ...recipient, phone: "+66 81 234 5678" }).recipient
      ?.phone,
    "0812345678",
  );
  for (const phone of ["123", "+1 1234567890", "081234567890", "phone"])
    assert.ok(validateRecipientDraft({ ...recipient, phone }).errors.phone);
});
test("optional company/note are per-order data and blanks normalize to null", () => {
  const user = { firstName: "ผู้ซื้อ", lastName: "เดิม", phone: "0812345678" };
  const before = JSON.stringify(user);
  const value = validateRecipientDraft({
    ...recipient,
    fullName: "ผู้รับอื่น",
    company: " บริษัททดสอบ ",
    deliveryNote: "   ",
  });
  assert.equal(value.recipient?.company, "บริษัททดสอบ");
  assert.equal(value.recipient?.deliveryNote, null);
  assert.equal(JSON.stringify(user), before);
  assert.ok(
    validateRecipientDraft({ ...recipient, deliveryNote: "ก".repeat(1001) })
      .errors.deliveryNote,
  );
});
