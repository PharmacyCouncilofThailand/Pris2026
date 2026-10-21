"use client";
import { useLayoutEffect, useRef } from "react";
import type {
  RecipientDraft,
  RecipientErrors,
} from "@/lib/merchandiseRecipient";
export default function RecipientForm({
  value,
  onChange,
  onSubmit,
  errors,
  busy,
  buyerEmail,
  focusName,
}: {
  value: RecipientDraft;
  onChange(value: RecipientDraft): void;
  onSubmit(): void;
  errors: RecipientErrors;
  busy: boolean;
  buyerEmail: string;
  focusName: boolean;
}) {
  const form = useRef<HTMLFormElement>(null);
  useLayoutEffect(() => {
    if (focusName)
      form.current
        ?.querySelector<HTMLInputElement>("#recipient-fullName")
        ?.focus();
  }, [focusName]);
  useLayoutEffect(() => {
    if (Object.keys(errors).length)
      form.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
  }, [errors]);
  const field = (
    name: keyof RecipientDraft,
    label: string,
    autoComplete?: string,
    multiline = false,
    optional = false,
    maxLength = 200,
  ) => (
    <div className={`merch-recipient-field merch-recipient-${name}`} key={name}>
      <label htmlFor={`recipient-${name}`}>
        <span id={`recipient-${name}-label`}>
          {label}
          {optional && <span className="merch-optional"> (ไม่บังคับ)</span>}
        </span>
        {!optional && (
          <span className="merch-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={`recipient-${name}`}
          aria-labelledby={`recipient-${name}-label`}
          name={name}
          value={value[name]}
          disabled={busy}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={!optional}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={
            errors[name] ? `recipient-${name}-error` : undefined
          }
          onChange={(e) => onChange({ ...value, [name]: e.target.value })}
        />
      ) : (
        <input
          id={`recipient-${name}`}
          aria-labelledby={`recipient-${name}-label`}
          name={name}
          value={value[name]}
          type={name === "phone" ? "tel" : "text"}
          inputMode={
            name === "postalCode"
              ? "numeric"
              : name === "phone"
                ? "tel"
                : "text"
          }
          disabled={busy}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={!optional}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={
            errors[name] ? `recipient-${name}-error` : undefined
          }
          onChange={(e) => onChange({ ...value, [name]: e.target.value })}
        />
      )}
      {errors[name] && (
        <p className="merch-recipient-error" id={`recipient-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );
  return (
    <form
      id="merch-recipient-form"
      ref={form}
      className="merch-recipient-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <p className="merch-recipient-intro">
        ผู้รับเป็นคนละคนกับผู้ซื้อได้
        <br />
        ข้อมูลนี้ใช้เฉพาะคำสั่งซื้อนี้ ไม่เปลี่ยนข้อมูลบัญชีผู้ซื้อ
      </p>
      {Object.keys(errors).length > 0 && (
        <div className="merch-cart-notice" role="alert">
          กรุณาตรวจสอบข้อมูลผู้รับ ยังไม่ได้สร้างคำสั่งซื้อ
        </div>
      )}
      <div className="merch-recipient-fields">
        {field("fullName", "ชื่อ–นามสกุลผู้รับ", "name", false, false, 200)}
        {field("phone", "เบอร์โทรผู้รับ", "tel", false, false, 30)}
        {field("addressLine", "ที่อยู่", "street-address", true, false, 500)}
        {field("subdistrict", "ตำบล/แขวง", "address-level3", false, false, 100)}
        {field("district", "อำเภอ/เขต", "address-level2", false, false, 100)}
        {field("province", "จังหวัด", "address-level1", false, false, 100)}
        {field("postalCode", "รหัสไปรษณีย์", "postal-code", false, false, 5)}
        {field("company", "ชื่อบริษัท", "organization", false, true, 200)}
        {field("deliveryNote", "หมายเหตุจัดส่ง", "off", true, true, 500)}
      </div>
      <p className="merch-cart-muted">
        ประเทศ: ไทย · จัดส่งภายในประเทศเท่านั้น
        <br />
        ส่งรายละเอียดออเดอร์ไปยัง {buyerEmail}
      </p>
    </form>
  );
}
