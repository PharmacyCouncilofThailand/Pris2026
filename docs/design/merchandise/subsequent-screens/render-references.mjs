// Static review references only. No application routes, API calls or purchase actions.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Globe,
  Menu,
  Minus,
  Plus,
  Trash2,
  Check,
  Clock3,
  CircleAlert,
  Truck,
  Package,
  Copy,
  Download,
  Image as ImageIcon,
  LockKeyhole,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "../../../..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const icon = (Icon, size = 20) =>
  renderToStaticMarkup(
    createElement(Icon, { size, strokeWidth: 1.8, "aria-hidden": true }),
  );
const button = (text, cls = "secondary", extra = "") =>
  `<button type="button" class="${cls}" ${extra}>${text}</button>`;
const title = (text, lead = "") =>
  `<div class="back">${icon(ArrowLeft)}<span>กลับ</span></div><div class="title"><h1>${text}</h1>${lead ? `<p>${lead}</p>` : ""}</div>`;
const notice = (text, cls = "info") =>
  `<div class="notice ${cls}">${icon(cls === "success" ? Check : CircleAlert)}<div>${text}</div></div>`;
const photo = (small = false) =>
  `<div class="photo ${small ? "small" : ""}">${icon(ImageIcon, small ? 24 : 44)}<span>พื้นที่ภาพสินค้า</span>${!small ? '<span class="preorder">พรีออเดอร์</span>' : ""}</div>`;
const qty = (unit = "ชิ้น") =>
  `<div class="quantity"><span>จำนวน${unit === "ชุด" ? "ชุด" : ""}</span><div class="stepper">${button(icon(Minus), "icon", 'aria-label="ลดจำนวน"')}<span>1</span>${button(icon(Plus), "icon", 'aria-label="เพิ่มจำนวน"')}</div></div>`;
const choice = (label, values, selected = 0) =>
  `<fieldset><legend>${label}</legend><div class="choices">${values.map((v, i) => button(v, `choice ${i === selected ? "selected" : ""}`, `aria-pressed="${i === selected}"`)).join("")}</div></fieldset>`;
const totals = (amount = 250, total = 300) =>
  `<section class="totals" aria-label="สรุปยอด"><h2>สรุปคำสั่งซื้อ</h2><div><span>ค่าสินค้า</span><b>฿${amount.toFixed(2)}</b></div><div><span>ค่าจัดส่ง</span><b>฿50.00</b></div><div class="grand"><strong>ยอดชำระรวม</strong><strong>฿${total.toFixed(2)}</strong></div><p>จัดส่งภายในประเทศไทย<br>รวมสินค้าทุกรายการในออเดอร์เดียวกัน</p></section>`;
const bar = (text, { blue = false, disabled = false, hint = "" } = {}) =>
  `<div class="bottom-bar">${hint ? `<p>${hint}</p>` : ""}${button(`${text}${icon(ArrowRight)}`, blue ? "primary blue" : "primary", disabled ? "disabled" : "")}</div>`;
const steps = (current) =>
  `<ol class="steps" aria-label="ขั้นตอนสั่งซื้อ">${["ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"].map((s, i) => `<li class="${i === current ? "current" : i < current ? "done" : ""}"><span>${i < current ? icon(Check, 14) : i + 1}</span>${s}</li>`).join("")}</ol>`;
const line = ({
  name = "แก้ว Mug",
  price = 100,
  option = "ไม่มีตัวเลือก",
  invalid = false,
  bundle = false,
  editable = false,
} = {}) =>
  `<article class="line ${invalid ? "invalid" : ""}">${photo(true)}<div class="line-body"><h2 class="line-name">${name}</h2><p>${option}</p>${bundle ? '<p class="components">ประกอบด้วย แก้ว Mug × 1<br>กระเป๋าผ้า × 1 · สีตัวอย่าง A</p>' : ""}<div class="line-price"><b>${invalid ? "—" : `฿${price.toFixed(2)}`}</b><span>${bundle ? "1 ชุด" : "1 ชิ้น"}</span></div>${editable ? `<div class="line-edit">${qty(bundle ? "ชุด" : "ชิ้น")}${button(icon(Trash2), "icon", 'aria-label="นำสินค้าออก"')}</div>` : ""}${invalid ? '<p class="invalid-copy">ตัวเลือกนี้ปิดขายแล้ว กรุณานำออกหรือเลือกใหม่</p>' : ""}</div></article>`;
const address = `<p class="recipient-name">ผู้รับ ตัวอย่าง</p><p>0900000000<br>99 ซอยตัวอย่าง แขวงดุสิต<br>เขตดุสิต กรุงเทพมหานคร 10300<br>ประเทศไทย</p>`;
const recipientSummary = (editable = false) =>
  `<section class="recipient-summary"><div class="section-heading"><h2>ที่อยู่จัดส่ง</h2>${editable ? button("แก้ไข", "text-button") : ""}</div>${address}</section>`;
const contact = `<p class="support">หากต้องการแก้ไขคำสั่งซื้อ กรุณาติดต่อ<br><span>pr@pharmacycouncil.org</span> พร้อมเลขคำสั่งซื้อ</p>`;
const synthetic = `<div class="review-label">ภาพตรวจแบบ · ข้อมูลสังเคราะห์ ไม่ใช่ข้อมูลขายจริง</div>`;
const header = `<header><div class="header-inner"><img src="assets/logo.png" width="200" height="80" alt="PRIS 2026"><nav class="desktop-nav"><span>หน้าแรก</span><span>เกี่ยวกับ</span><span>กำหนดการ</span><span class="active">ของที่ระลึก</span></nav><div class="tools">${button(`${icon(ShoppingCart)}<span class="badge">2</span>`, "cart icon", 'aria-label="ตะกร้า 2 ชิ้น"')}${button(`${icon(Globe)}<span>EN</span>`, "language", 'aria-label="เปลี่ยนภาษาเป็นอังกฤษ"')}${button(icon(Menu), "icon", 'aria-label="เมนู"')}</div></div></header>`;
const field = (
  label,
  value = "",
  { wide = false, optional = false, error = false } = {},
) =>
  `<label class="field ${wide ? "wide" : ""}"><span>${label}${optional ? " <small>(ไม่บังคับ)</small>" : ""}</span>${label === "ที่อยู่" ? `<textarea rows="3" readonly>${value}</textarea>` : `<input readonly value="${value}" ${error ? 'aria-invalid="true"' : ""}>`}${error ? '<small class="field-error">กรุณากรอกเบอร์โทรผู้รับ</small>' : ""}</label>`;

const screens = [
  {
    id: "01-product-options",
    name: "เลือกตัวเลือกสินค้า",
    bar: bar("เพิ่มลงตะกร้า · ฿150.00", { blue: true }),
    body: `${title("กระเป๋าผ้า")}<div class="product-layout">${photo()}<div class="product-info"><span class="status blue-status">พรีออเดอร์</span><p class="price">฿150.00</p><p>รายละเอียดสินค้าตัวอย่างสำหรับตรวจการจัดวาง ข้อมูลจริงให้ Admin กำหนดภายหลัง</p>${choice("สี", ["สีตัวอย่าง A", "สีตัวอย่าง B"])}${choice("ขนาด", ["ขนาดตัวอย่าง A", "ขนาดตัวอย่าง B"])}${qty()}<p class="muted">เลือกได้เฉพาะสีและขนาดที่เปิดขาย<br>ราคานี้เป็นราคาของตัวเลือกที่เลือก</p></div></div>`,
  },
  {
    id: "02-bundle",
    name: "เลือกส่วนประกอบของชุด",
    bar: bar("เพิ่มลงตะกร้า · ฿220.00", { blue: true }),
    body: `${title("ชุดสินค้าตัวอย่าง")}<div class="product-layout">${photo()}<div class="product-info"><span class="status blue-status">พรีออเดอร์ · ชุดสินค้า</span><p class="price">฿220.00 <small>/ ชุด</small></p><h2>สินค้าใน 1 ชุด</h2><div class="component"><h3>แก้ว Mug × 1</h3><p>ไม่มีตัวเลือก · กำหนดไว้ในชุด</p></div><div class="component"><h3>กระเป๋าผ้า × 1</h3>${choice("เลือกสีของกระเป๋าผ้า", ["สีตัวอย่าง A", "สีตัวอย่าง B"])}<p>ขนาดตัวอย่าง A · กำหนดไว้ในชุด</p></div>${qty("ชุด")}<p class="muted">ราคาขายรวมต่อชุด ไม่คิดราคาส่วนประกอบเพิ่ม</p></div></div>`,
  },
  {
    id: "03-cart",
    name: "ตะกร้าพร้อมซื้อ",
    bar: bar("ดำเนินการต่อ · ฿300.00"),
    body: `${title("ตะกร้าสินค้า", "2 รายการ")}${steps(0)}<div class="two-columns"><section class="items">${line({ editable: true })}${line({ name: "กระเป๋าผ้า", price: 150, option: "สีตัวอย่าง A · ขนาดตัวอย่าง A", editable: true })}</section>${totals()}</div>`,
  },
  {
    id: "04-cart-unavailable",
    name: "สินค้าในตะกร้าปิดขาย",
    bar: bar("ดำเนินการต่อ", {
      disabled: true,
      hint: "กรุณาจัดการรายการที่ไม่พร้อมขายก่อน",
    }),
    body: `${title("ตะกร้าสินค้า", "2 รายการ")}${steps(0)}${notice("มีตัวเลือกที่ปิดขายแล้ว<br>ระบบจะไม่เปลี่ยนเป็นตัวเลือกอื่นให้โดยอัตโนมัติ", "warning")}<div class="two-columns"><section class="items">${line({ editable: true })}${line({ name: "กระเป๋าผ้า", option: "สีตัวอย่าง B · ขนาดตัวอย่าง A", invalid: true, editable: true })}${button("เลือกตัวเลือกใหม่", "secondary")}</section><section class="totals"><h2>สรุปคำสั่งซื้อ</h2><p>ยังสรุปยอดไม่ได้<br>กรุณาตรวจสอบรายการที่ไม่พร้อมขาย</p></section></div>`,
  },
  {
    id: "05-recipient",
    name: "กรอกที่อยู่ผู้รับ",
    bar: bar("ตรวจสอบคำสั่งซื้อ"),
    body: `${title("ข้อมูลผู้รับ")}${steps(1)}<div class="two-columns"><section><p class="intro">ผู้รับเป็นคนละคนกับผู้ซื้อได้<br>ข้อมูลนี้ใช้เฉพาะคำสั่งซื้อนี้</p><div class="form-grid">${field("ชื่อ–นามสกุลผู้รับ", "ผู้รับ ตัวอย่าง", { wide: true })}${field("เบอร์โทรผู้รับ", "0900000000", { wide: true })}${field("ที่อยู่", "99 ซอยตัวอย่าง", { wide: true })}${field("ตำบล/แขวง", "ดุสิต")}${field("อำเภอ/เขต", "ดุสิต")}${field("จังหวัด", "กรุงเทพมหานคร")}${field("รหัสไปรษณีย์", "10300")}${field("ชื่อบริษัท", "", { wide: true, optional: true })}${field("หมายเหตุจัดส่ง", "", { wide: true, optional: true })}</div><p class="muted">ประเทศ: ไทย · จัดส่งภายในประเทศเท่านั้น<br>ส่งรายละเอียดออเดอร์ไปยัง buyer@example.test<br>ไม่เปลี่ยนข้อมูลบัญชีผู้ซื้อ</p></section>${totals()}</div>`,
  },
  {
    id: "06-recipient-error",
    name: "ข้อผิดพลาดของข้อมูลผู้รับ",
    bar: bar("ตรวจสอบคำสั่งซื้อ"),
    body: `${title("ข้อมูลผู้รับ")}${steps(1)}${notice("กรุณาตรวจสอบข้อมูลผู้รับ<br>ยังไม่ได้สร้างคำสั่งซื้อ", "warning")}<div class="form-grid">${field("ชื่อ–นามสกุลผู้รับ", "ผู้รับ ตัวอย่าง", { wide: true })}${field("เบอร์โทรผู้รับ", "", { wide: true, error: true })}${field("ที่อยู่", "99 ซอยตัวอย่าง", { wide: true })}${field("ตำบล/แขวง", "ดุสิต")}${field("อำเภอ/เขต", "ดุสิต")}${field("จังหวัด", "กรุงเทพมหานคร")}${field("รหัสไปรษณีย์", "10300")}${field("ชื่อบริษัท", "", { wide: true, optional: true })}${field("หมายเหตุจัดส่ง", "", { wide: true, optional: true })}</div>`,
  },
  {
    id: "07-review",
    name: "ตรวจสอบก่อนยืนยัน",
    bar: bar("ยืนยันคำสั่งซื้อ · ฿300.00"),
    body: `${title("ตรวจสอบคำสั่งซื้อ")}${steps(2)}<div class="two-columns"><div><section class="items">${line()}${line({ name: "กระเป๋าผ้า", price: 150, option: "สีตัวอย่าง A · ขนาดตัวอย่าง A" })}</section>${recipientSummary(true)}<section class="payment-method"><h2>ชำระเงินด้วย</h2><strong>Thai QR PromptPay</strong><p>ค่าสินค้าและค่าจัดส่งเท่านั้น<br>ไม่มีค่าธรรมเนียมชำระเงินเพิ่ม</p></section>${notice("เมื่อยืนยันคำสั่งซื้อแล้ว จะไม่สามารถแก้ไขรายการสินค้า จำนวน ตัวเลือก หรือข้อมูลผู้รับได้ด้วยตนเอง")}</div>${totals()}</div>`,
  },
  {
    id: "08-confirm-unknown",
    name: "ยังยืนยันผลสร้างออเดอร์ไม่ได้",
    bar: bar("ตรวจสอบอีกครั้ง", { blue: true }),
    body: `${title("กำลังตรวจสอบคำสั่งซื้อ")}${steps(2)}<section class="state-panel"><div class="state-icon">${icon(CircleAlert, 32)}</div><h2>ยังยืนยันผลไม่สำเร็จ</h2><p>การเชื่อมต่อขัดข้องขณะยืนยันคำสั่งซื้อ<br>กรุณาตรวจสอบผลอีกครั้ง</p><p class="muted">ระบบจะตรวจสอบคำขอเดิม<br>โดยไม่สร้างคำสั่งซื้อซ้ำ</p></section>`,
  },
  {
    id: "09-qr-ready",
    name: "QR พร้อมชำระ",
    bar: bar("ตรวจสอบการชำระเงิน", { blue: true }),
    body: "",
  },
  {
    id: "10-qr-creating",
    name: "กำลังสร้าง QR",
    bar: bar("กำลังสร้าง QR", { blue: true, disabled: true }),
    body: "",
  },
  {
    id: "11-qr-checking",
    name: "กำลังตรวจสอบการชำระ",
    bar: bar("กำลังตรวจสอบ", { blue: true, disabled: true }),
    body: "",
  },
  {
    id: "12-payment-unknown",
    name: "ตรวจสถานะไม่ได้",
    bar: bar("ตรวจสอบอีกครั้ง", { blue: true }),
    body: "",
  },
  {
    id: "13-qr-expired-open",
    name: "QR หมดอายุ ร้านยังเปิด",
    bar: bar("ขอ QR ใหม่"),
    body: "",
  },
  {
    id: "14-qr-expired-closed",
    name: "QR หมดอายุ ร้านปิดแล้ว",
    bar: bar("ตรวจสอบการชำระเงิน", { blue: true }),
    body: "",
  },
  {
    id: "15-paid",
    name: "ชำระเงินสำเร็จ",
    bar: bar("ดูรายละเอียดคำสั่งซื้อ", { blue: true }),
    body: `${title("ชำระเงินสำเร็จ")}<div class="two-columns"><div><section class="state-panel compact"><div class="state-icon success-icon">${icon(Check, 32)}</div><h2>ขอบคุณสำหรับคำสั่งซื้อ</h2><p>เลขคำสั่งซื้อ <strong>SYN-0001</strong></p><span class="status success-status">ชำระเงินสำเร็จ</span><p>ส่งรายละเอียดไปที่ buyer@example.test</p></section><section class="items">${line()}${line({ name: "กระเป๋าผ้า", price: 150, option: "สีตัวอย่าง A · ขนาดตัวอย่าง A" })}</section>${recipientSummary()}${contact}</div>${totals()}</div>`,
  },
  {
    id: "16-history",
    name: "ประวัติคำสั่งซื้อ",
    bar: "",
    body: `${title("คำสั่งซื้อของฉัน", "ดูสถานะชำระเงินและการจัดส่งของแต่ละออเดอร์")}<section class="order-list"><article><div class="order-title"><h2>SYN-0001</h2><span>15 ต.ค. 2569</span></div><p>แก้ว Mug และกระเป๋าผ้า · 2 รายการ</p><div class="statuses"><span class="status success-status">ชำระเงินสำเร็จ</span><span class="status neutral-status">รอจัดส่ง</span></div><div class="order-total"><b>฿300.00</b>${button(`ดูรายละเอียด ${icon(ChevronRight)}`, "text-button")}</div></article><article><div class="order-title"><h2>SYN-0002</h2><span>15 ต.ค. 2569</span></div><p>ชุดสินค้าตัวอย่าง · 1 ชุด</p><div class="statuses"><span class="status success-status">ชำระเงินสำเร็จ</span><span class="status blue-status">จัดส่งแล้ว</span></div><div class="order-total"><b>฿270.00</b>${button(`ดูรายละเอียด ${icon(ChevronRight)}`, "text-button")}</div></article><article><div class="order-title"><h2>SYN-0003</h2><span>15 ต.ค. 2569</span></div><p>แก้ว Mug · 1 ชิ้น</p><div class="statuses"><span class="status neutral-status">รอชำระเงิน</span><span class="status neutral-status">ยังไม่พร้อมจัดส่ง</span></div><div class="order-total"><b>฿150.00</b>${button(`ดูรายละเอียด ${icon(ChevronRight)}`, "text-button")}</div></article></section>`,
  },
  {
    id: "17-order-shipped",
    name: "รายละเอียดออเดอร์ที่จัดส่งแล้ว",
    bar: "",
    body: `${title("รายละเอียดคำสั่งซื้อ", "SYN-0002")}<div class="statuses"><span class="status success-status">ชำระเงินสำเร็จ</span><span class="status blue-status">จัดส่งแล้ว</span></div><div class="two-columns"><div><section class="shipping"><h2>${icon(Truck)} ข้อมูลจัดส่ง</h2><p>บริษัทขนส่งตัวอย่าง</p><p class="muted">เลขติดตามพัสดุ</p><div class="tracking"><strong>SYNTHETIC-001</strong>${button(icon(Copy), "icon", 'aria-label="คัดลอกเลขติดตามพัสดุ"')}</div><p class="muted">จัดส่งเมื่อ 15 ต.ค. 2569 เวลา 14:00 น.</p></section><section class="items">${line({ name: "ชุดสินค้าตัวอย่าง", price: 220, bundle: true, option: "ราคาต่อชุด" })}</section>${recipientSummary()}<section class="order-facts"><p>สั่งซื้อ: 15 ต.ค. 2569 เวลา 10:00 น.</p><p>ชำระเงิน: 15 ต.ค. 2569 เวลา 10:02 น.</p></section>${contact}</div>${totals(220, 270)}</div>`,
  },
  {
    id: "18-history-empty",
    name: "ยังไม่มีคำสั่งซื้อ",
    bar: bar("เลือกสินค้า", { blue: true }),
    body: `${title("คำสั่งซื้อของฉัน")}<section class="state-panel"><div class="state-icon">${icon(Package, 32)}</div><h2>ยังไม่มีคำสั่งซื้อ</h2><p>เมื่อสั่งซื้อแล้ว คุณสามารถดูสถานะ<br>การชำระเงินและจัดส่งได้ที่นี่</p></section>`,
  },
];

// The single-variant product deliberately has no size or color controls.
screens.push({
  id: "19-product-no-options",
  name: "สินค้าที่ไม่มีตัวเลือก",
  bar: bar("เพิ่มลงตะกร้า · ฿100.00", { blue: true }),
  body: `${title("แก้ว Mug")}<div class="product-layout">${photo()}<div class="product-info"><p class="price">฿100.00</p><p>รายละเอียดสินค้าตัวอย่างสำหรับตรวจการจัดวาง ข้อมูลจริงให้ Admin กำหนดภายหลัง</p>${qty()}<p class="muted">สินค้าพรีออเดอร์ · จัดส่งภายในประเทศไทย</p></div></div>`,
});
for (const s of screens) {
  s.body = s.body
    .replace('<span class="status blue-status">พรีออเดอร์</span>', "")
    .replace("พรีออเดอร์ · ชุดสินค้า</span>", "ชุดสินค้า</span>")
    .replace(
      "ส่งรายละเอียดไปที่ buyer@example.test",
      "ระบบจะส่งรายละเอียดไปที่ buyer@example.test",
    );
}

for (const s of screens.filter((s) => /^0?9-|^1[0-4]-/.test(s.id))) {
  const ready = s.id.startsWith("09"),
    creating = s.id.startsWith("10"),
    checking = s.id.startsWith("11"),
    unknown = s.id.startsWith("12"),
    expired = s.id.startsWith("13"),
    closed = s.id.startsWith("14");
  const state = ready
    ? "รอชำระเงิน"
    : creating
      ? "กำลังสร้าง QR"
      : checking
        ? "กำลังตรวจสอบ"
        : unknown
          ? "ตรวจสอบสถานะไม่สำเร็จ"
          : expired
            ? "QR หมดอายุ"
            : "หมดเวลาชำระเงิน";
  const qr = ready
    ? `<div class="qr-placeholder">${icon(ImageIcon, 36)}<strong>พื้นที่ QR จากระบบ</strong><span>ไม่มี QR ที่ชำระเงินได้ในภาพนี้</span></div>`
    : `<div class="qr-empty">${icon(creating || checking ? LoaderCircle : unknown ? CircleAlert : Clock3, 44)}<span>${creating ? "กำลังสร้าง QR สำหรับออเดอร์เดิม" : checking ? "กำลังตรวจสอบการชำระเงิน" : unknown ? "ยังไม่สามารถยืนยันสถานะได้" : "QR เดิมใช้ชำระเงินไม่ได้แล้ว"}</span></div>`;
  s.body = `${title("ชำระเงิน", "คำสั่งซื้อ SYN-0001")}${steps(3)}<div class="two-columns"><section class="payment"><div class="payment-heading"><strong>Thai QR PromptPay</strong><span class="status ${unknown ? "warning-status" : "blue-status"}">${state}</span></div><p class="payment-amount">฿300.00</p>${ready ? `<div class="deadline">${icon(Clock3)} เหลือเวลาชำระ <strong>08:42</strong></div>` : ""}${qr}${ready ? `<p class="muted">หมดอายุ 15 ต.ค. 2569 เวลา 10:10 น. (ไทย)</p>${button(`${icon(Download)} บันทึกภาพ QR`, "secondary full")}<p>ใช้แอปธนาคารสแกนหรือเลือกรูป QR<br>แล้วกลับมาตรวจสอบผลในหน้านี้</p>` : ""}${checking ? "<p>กำลังตรวจสอบสถานะการชำระเงิน<br>กรุณารอสักครู่</p>" : ""}${unknown ? notice("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง<br>ยังไม่สามารถยืนยันผลการชำระเงินได้", "warning") : ""}${expired ? "<p>ตรวจสอบแล้ว ยังไม่พบการชำระสำเร็จ<br>ขอ QR ใหม่สำหรับออเดอร์เดิมได้</p>" : ""}${closed ? notice("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", "warning") : ""}${creating ? "<p>ระบบกำลังเตรียม QR<br>อย่าปิดหน้าระหว่างรอผล</p>" : ""}<p class="reference">เลขคำสั่งซื้อ SYN-0001<br>ยอดรวมค่าสินค้า ฿250.00 + ค่าจัดส่ง ฿50.00</p></section><aside class="payment-details">${recipientSummary()}<section class="locked"><h2>${icon(LockKeyhole)} ข้อมูลคำสั่งซื้อ</h2><p>แก้ว Mug × 1<br>กระเป๋าผ้า × 1<br>สีตัวอย่าง A · ขนาดตัวอย่าง A</p><p class="muted">ข้อมูลถูกล็อกหลังยืนยันคำสั่งซื้อ</p></section>${contact}</aside></div>`;
}

// On payment pages the order is already confirmed: keep the QR above the fold,
// rather than repeating the pre-confirmation stepper.
for (const s of screens.filter((s) => /^0?9-|^1[0-4]-/.test(s.id)))
  s.body = s.body.replace(steps(3), "");

const css = `
:root{--blue:#0055ff;--orange:#ff5a00;--ink:#0b1535;--muted:#59657b;--line:#dce3ee;--surface:#f6f8fc;--danger:#a11b29}*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:var(--surface);color:var(--ink);font-family:'Noto Sans Thai',sans-serif;font-size:16px;line-height:1.6}button,input,textarea{font:inherit}button{cursor:default;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:12px;font-weight:600}button:focus-visible{outline:3px solid var(--blue);outline-offset:3px}svg{flex-shrink:0;vertical-align:middle}::selection{background:#dbe8ff;color:var(--ink)}.review-label{font-size:12px;padding:8px 16px;text-align:center;background:#e9eef6;color:#33415c}.header-inner{height:76px;max-width:1200px;margin:auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}header{background:#fff;border-bottom:1px solid var(--line)}header img{filter:brightness(0);width:145px;height:auto}.tools{display:flex;align-items:center;gap:7px}.icon{width:44px;min-width:44px;padding:0;background:transparent;border:0;color:var(--ink)}.cart{position:relative}.badge{position:absolute;right:-1px;top:-1px;min-width:21px;height:21px;border-radius:99px;background:var(--orange);color:#111;font:700 12px/21px 'Outfit';text-align:center}.language{background:transparent;border:0;padding:0 4px;font-family:'Outfit';font-weight:700;gap:5px}.language svg{width:18px}.desktop-nav{display:none}.back{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--muted);min-height:44px;margin-bottom:8px}.title{margin:0 0 28px}.title h1{font-size:28px;line-height:1.35;letter-spacing:0;margin:0;font-weight:800}.title p{margin:8px 0 0;color:var(--muted);font-size:15px}main{max-width:1160px;margin:auto;padding:18px 20px 48px}body.has-bar main{padding-bottom:150px}h2{font-size:18px;line-height:1.5;margin:0 0 16px;font-weight:700}h3{font-size:16px;line-height:1.5;margin:0 0 4px}p{margin:8px 0 16px}.muted,.support{color:var(--muted);font-size:14px;line-height:1.7}.photo{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;background:#e9edf4;color:#5b6880;aspect-ratio:1;border-radius:16px;font-size:14px}.photo.small{width:80px;height:92px;min-width:80px;border-radius:10px;font-size:10px;gap:6px;aspect-ratio:auto}.preorder{position:absolute;left:12px;bottom:12px;border-radius:99px;background:#d9e7ff;color:#0047d6;font-size:14px;font-weight:700;padding:5px 12px}.product-info{padding-top:24px}.price{font-family:'Outfit','Noto Sans Thai',sans-serif;font-size:32px;font-weight:700;line-height:1.3;margin:12px 0 18px;font-variant-numeric:tabular-nums}.price small{font-family:'Noto Sans Thai';font-size:14px;font-weight:400}.status{display:inline-flex;border-radius:99px;padding:5px 10px;font-size:13px;line-height:1.6;font-weight:600}.blue-status{background:#e3edff;color:#0042c7}.success-status{background:#e4f4e9;color:#176338}.neutral-status{background:#e9edf3;color:#48566c}.warning-status{background:#fff0e6;color:#8c3c0c}fieldset{border:0;padding:0;margin:24px 0}legend{font-weight:600;margin-bottom:10px}.choices{display:flex;flex-wrap:wrap;gap:8px}.choice{background:#fff;border:1px solid #b7c2d6;padding:9px 16px;color:var(--ink)}.choice.selected{background:var(--blue);border-color:var(--blue);color:#fff}.quantity{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:24px}.stepper{display:flex;align-items:center;border:1px solid #c2cce0;background:#fff;border-radius:10px}.stepper>span{min-width:40px;text-align:center;font-family:'Outfit';font-weight:600;font-size:18px}.component{border-top:1px solid var(--line);padding-top:18px;margin-top:18px}.component fieldset{margin:12px 0}.component p{font-size:14px;color:var(--muted)}.bottom-bar{position:fixed;z-index:3;bottom:0;left:0;right:0;background:#fff;padding:14px 20px calc(18px + env(safe-area-inset-bottom));border-top:1px solid var(--line);display:flex;align-items:center;flex-direction:column;gap:8px}.bottom-bar p{font-size:13px;color:var(--muted);margin:0}.primary{width:100%;max-width:680px;min-height:56px;border:0;border-radius:99px;padding:12px 22px;background:var(--orange);color:#fff;font-size:19px;font-weight:700;justify-content:space-between;line-height:1.5}.primary.blue{background:var(--blue)}button:disabled{background:#e0e5ed;color:#66728a;border:0;cursor:not-allowed}.secondary{background:#fff;border:1px solid #b8c4d8;padding:10px 16px;color:var(--blue)}.full{width:100%}.text-button{background:transparent;border:0;color:var(--blue);padding:4px 0;font-size:14px}.steps{list-style:none;display:flex;justify-content:space-between;padding:0;margin:0 0 30px;font-size:12px;color:var(--muted);gap:6px}.steps li{display:flex;align-items:center;gap:5px;white-space:nowrap}.steps li>span{height:22px;width:22px;border-radius:99px;background:#e5eaf2;display:flex;align-items:center;justify-content:center;font-family:'Outfit';font-size:12px}.steps .current{color:#0046d6;font-weight:700}.steps .current>span,.steps .done>span{background:var(--blue);color:#fff}.line{display:flex;gap:14px;padding:20px 0;border-bottom:1px solid var(--line)}.line:first-child{padding-top:0}.line-body{flex:1;min-width:0}.line-body p{font-size:13px;color:var(--muted);margin:0 0 8px}.line-price{display:flex;justify-content:space-between;gap:12px;font-size:14px}.line-price b{font-family:'Outfit';font-size:21px;font-weight:600}.line-price span{color:var(--muted)}.line-edit{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:10px}.line-edit .quantity{margin:0;gap:0}.line-edit .quantity>span{display:none}.line-edit .stepper>span{min-width:26px}.line-edit .icon{width:38px;min-width:38px}.invalid-copy{color:var(--danger)!important;margin-top:10px!important}.invalid h3{color:var(--danger)}.totals{background:#fff;border-radius:16px;padding:24px;margin-top:28px;align-self:start}.totals>div{display:flex;justify-content:space-between;gap:20px;margin:12px 0;font-size:15px}.totals b,.totals strong:last-child{font-family:'Outfit';font-size:19px;font-weight:600;font-variant-numeric:tabular-nums}.totals .grand{border-top:1px solid var(--line);padding-top:18px;margin-top:18px;align-items:center}.totals .grand strong:last-child{font-size:28px;color:#0046d6}.totals p{font-size:13px;color:var(--muted);margin:16px 0 0}.notice{padding:16px;background:#e9f0ff;border-radius:12px;color:#164495;display:flex;align-items:flex-start;gap:12px;margin:20px 0;font-size:14px;line-height:1.65}.notice svg{margin-top:2px}.notice.warning{background:#fff0e5;color:#823608}.notice.success{background:#e4f4e9;color:#176338}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px 14px}.field{display:flex;flex-direction:column;gap:8px;font-size:14px;font-weight:600}.field.wide{grid-column:1/-1}.field small{font-size:12px;color:var(--muted);font-weight:400}.field input,.field textarea{width:100%;min-height:50px;border:1px solid #bac5d7;background:#fff;border-radius:10px;padding:12px;color:var(--ink);font-size:16px;resize:none}.field [aria-invalid]{border-color:var(--danger)}.field .field-error{color:var(--danger)}.intro{font-size:15px;margin:0 0 28px}.form-grid+.muted{margin-top:24px}.recipient-summary,.payment-method,.shipping,.locked,.order-facts{padding:26px 0;border-bottom:1px solid var(--line)}.section-heading{display:flex;justify-content:space-between;gap:20px;align-items:center}.section-heading h2{margin-bottom:10px}.recipient-summary p{font-size:15px;margin:0}.recipient-name{font-weight:600;margin-bottom:5px!important}.payment-method strong{color:#0046d6}.payment-method p,.locked p{font-size:14px}.support{margin-top:26px;overflow-wrap:anywhere}.support span{color:#0046d6}.state-panel{background:#fff;border-radius:16px;padding:32px 20px;text-align:center;max-width:680px;margin:24px auto}.state-panel h2{font-size:24px;margin:18px 0 12px}.state-icon{display:flex;align-items:center;justify-content:center;background:#e6eeff;color:var(--blue);border-radius:99px;width:64px;height:64px;margin:auto}.success-icon{background:#e4f4e9;color:#176338}.state-panel.compact{margin-top:0}.payment{background:#fff;border-radius:16px;padding:24px 20px;align-self:start;text-align:center}.payment-heading{display:flex;align-items:center;flex-direction:column;gap:12px}.payment-amount{font-family:'Outfit';font-size:40px;font-weight:700;line-height:1.3;margin:20px 0 12px}.deadline{background:#e7efff;color:#164495;display:flex;justify-content:center;gap:7px;align-items:center;padding:10px;border-radius:10px;font-size:14px}.deadline strong{font-family:'Outfit';font-size:22px;font-variant-numeric:tabular-nums}.qr-placeholder,.qr-empty{width:100%;max-width:260px;aspect-ratio:1;margin:22px auto 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#f1f4f9;border:1px dashed #b7c2d5;border-radius:12px;color:var(--muted)}.qr-placeholder span,.qr-empty span{font-size:12px;padding:0 12px}.qr-placeholder strong{font-size:16px}.qr-empty{border:0;background:#f5f7fb}.reference{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:20px;margin:24px 0 0}.payment .secondary{margin:4px 0 14px}.payment>p{font-size:14px}.payment>.payment-amount{font-size:40px}.payment-details .recipient-summary{padding-top:26px}.locked h2{display:flex;gap:8px}.payment .notice{text-align:left}.order-list{background:#fff;border-radius:16px;padding:0 22px}.order-list article{padding:24px 0;border-bottom:1px solid var(--line)}.order-list article:last-child{border:0}.order-title{display:flex;align-items:center;justify-content:space-between;gap:12px}.order-title h2{font-family:'Outfit';font-size:21px;margin:0}.order-title>span{font-size:12px;color:var(--muted)}.order-list p{font-size:14px;color:var(--muted);margin:8px 0 14px}.statuses{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}.order-total{display:flex;justify-content:space-between;align-items:center;margin-top:18px}.order-total>b{font-family:'Outfit';font-size:24px}.shipping{margin-top:8px;padding-top:12px}.shipping h2{display:flex;align-items:center;gap:10px}.tracking{display:flex;justify-content:space-between;align-items:center;gap:10px}.tracking strong{font-family:'Outfit';font-size:22px;overflow-wrap:anywhere}.shipping p{margin-bottom:8px}.order-facts p{font-size:13px;color:var(--muted);margin:4px 0}.components{padding-top:6px}.review-footer{max-width:1160px;margin:0 auto;padding:20px;color:var(--muted);font-size:12px;border-top:1px solid var(--line)}body.has-bar .review-footer{margin-bottom:120px}
@media(min-width:768px){.header-inner{padding:0 32px}.tools{gap:14px}header img{width:170px}main{padding:28px 32px 60px}.title h1{font-size:36px}.title{margin-bottom:32px}.two-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.65fr);gap:40px;align-items:start}.totals{margin-top:0}.product-layout{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}.product-info{padding-top:0}.product-info>.status{margin-top:0}.steps{max-width:560px;font-size:14px;margin-bottom:36px}.steps li{gap:8px}.steps li>span{width:28px;height:28px;font-size:14px}.line .small{width:88px;min-width:88px;height:96px}.payment{padding:28px}.payment-details .recipient-summary{padding-top:0}.order-list{padding:0 30px}.order-list article{padding:26px 0}.order-list .statuses{margin-bottom:0}.review-label{font-size:13px}.bottom-bar{padding:16px 32px 20px}.state-panel{padding:40px}.title p{font-size:16px}}
@media(min-width:1280px){.desktop-nav{display:flex;gap:24px;align-items:center;font-size:14px;font-weight:600}.desktop-nav .active{color:var(--blue)}.header-inner{height:88px}.two-columns{grid-template-columns:minmax(0,1fr) 360px;gap:64px}.product-layout{grid-template-columns:1fr .9fr;gap:72px}.product-layout>.photo{max-height:560px}.title h1{font-size:40px}.product-info{padding-top:8px}.order-list{max-width:900px}.bottom-bar .primary{max-width:600px}}
@media(max-width:359px){.header-inner{padding:0 12px;gap:8px}header img{width:124px}.tools{gap:2px}main{padding-left:14px;padding-right:14px}.steps{font-size:11px;gap:3px}.steps li{gap:3px}.steps li>span{width:19px;height:19px}.line{gap:10px}.photo.small{width:65px;min-width:65px}.primary{font-size:19px}.form-grid{grid-template-columns:1fr}.field{grid-column:1/-1}.title h1{font-size:26px}}
`;

await mkdir(path.join(root, "assets/fonts"), { recursive: true });
await mkdir(path.join(root, "mockups"), { recursive: true });
await mkdir(path.join(root, "pages"), { recursive: true });
await copyFile(
  path.join(repo, "public/assets/Img/logo/Logo-Final .png"),
  path.join(root, "assets/logo.png"),
);
// Copy existing self-hosted Next font outputs; do not add a new font dependency/network request.
const cssDir = path.join(repo, ".next/static/css");
const compiled = (
  await Promise.all(
    (await readdir(cssDir))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFile(path.join(cssDir, f), "utf8")),
  )
).join("\n");
const faces = [
  ...new Set(
    (compiled.match(/@font-face\{[^}]+\}/g) || []).filter(
      (s) =>
        /font-family:(?:Outfit|Noto Sans Thai|["'](?:Outfit|Noto Sans Thai)["']);/.test(
          s,
        ) && s.includes("/_next/static/media/"),
    ),
  ),
];
assert(faces.length > 0, "Incumbent font faces must exist");
for (const f of new Set(
  faces.flatMap((s) =>
    [...s.matchAll(/\/_next\/static\/media\/([^\s)"']+)/g)].map((m) => m[1]),
  ),
))
  await copyFile(
    path.join(repo, ".next/static/media", f),
    path.join(root, "assets/fonts", f),
  );
await writeFile(
  path.join(root, "references.css"),
  faces.join("\n").replaceAll("/_next/static/media/", "assets/fonts/") +
    "\n" +
    css,
);
await writeFile(
  path.join(root, "references.css"),
  `\n/* Static-reference refinements following the single initial visual review. */
.line-name{font-size:16px;line-height:1.5;margin:0 0 4px;font-weight:700}
.text-button{min-width:44px;justify-content:flex-end}
.primary:disabled{background:#e0e5ed;color:#59657b}.line-edit .icon{width:44px;min-width:44px}.payment-heading{flex-direction:row;justify-content:center;flex-wrap:wrap;gap:8px 12px}.qr-placeholder{max-width:220px;margin:16px auto}.qr-empty{max-width:220px;height:160px;aspect-ratio:auto}.payment>.payment-amount{font-size:36px;margin:14px 0 12px}.payment{padding:20px}.product-info>.price:first-child{margin-top:0}
/* Full-page PNGs place the one dock at the end so it never cuts across content.
   The HTML remains a fixed-dock layout for its separate viewport checks. */
body.capture{position:relative;min-height:100vh;display:flex;flex-direction:column}body.capture main{width:100%;flex:1;padding-bottom:32px}body.capture .bottom-bar{position:absolute}body.capture .review-footer{width:100%;margin-bottom:100px}body.capture:not(.has-bar) .review-footer{margin-bottom:0}
`,
  { flag: "a" },
);
for (const s of screens) {
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${s.name} · ภาพตรวจแบบ</title><link rel="stylesheet" href="../references.css"></head><body class="${s.bar ? "has-bar" : ""}">${synthetic}${header.replace('src="assets/', 'src="../assets/')}<main>${s.body}</main><footer class="review-footer">ภาพอ้างอิงการจัดวางเท่านั้น · รูป ราคา ตัวเลือก และข้อมูลผู้รับเป็นข้อมูลสังเคราะห์<br>ส่วนท้ายเว็บไซต์เดิมคงไว้ในการพัฒนา ไม่เพิ่มนโยบายหรือเอกสารรับเงิน</footer>${s.bar}</body></html>`;
  await writeFile(path.join(root, "pages", s.id + ".html"), html);
}
await writeFile(
  path.join(root, "index.html"),
  `<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>P03 · ตรวจแบบขั้นตอนซื้อ</title><link rel="stylesheet" href="references.css"><body><main><h1>ภาพอ้างอิงขั้นตอนซื้อ</h1><p>ต่อจากหน้าร้านที่ยืนยันแล้ว · รอตรวจรับ P03</p><p>ทั้งหมดเป็นภาพนิ่ง ข้อมูลสังเคราะห์ ไม่มี QR ชำระเงินจริง</p><ol>${screens.map((s) => `<li><a href="mockups/${s.id}-mobile.png">${s.name}</a> · <a href="mockups/${s.id}-mobile.png">ภาพ Mobile</a></li>`).join("")}</ol><h2>ภาพ Tablet / Desktop</h2><ul>${[
    ["05-recipient", "tablet"],
    ["07-review", "tablet"],
    ["01-product-options", "desktop"],
    ["07-review", "desktop"],
    ["09-qr-ready", "desktop"],
    ["16-history", "desktop"],
  ]
    .map(
      ([id, v]) =>
        `<li><a href="mockups/${id}-${v}.png">${screens.find((s) => s.id === id).name} · ${v}</a></li>`,
    )
    .join(
      "",
    )}</ul><p><a href="review.md">รายละเอียดสำหรับตรวจรับ</a></p></main></body></html>`,
);

const server = createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const f = path.resolve(root, "." + (name === "/" ? "/index.html" : name));
    if (!f.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    const data = await readFile(f);
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css",
        ".png": "image/png",
        ".woff2": "font/woff2",
        ".md": "text/plain; charset=utf-8",
      }[path.extname(f)] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(3104, "127.0.0.1", resolve));
const browser = await chromium.launch();
const inventory = [];
const checks = [];
try {
  const variants = [
    ...screens.map((s) => [s, "mobile", 390, 844]),
    ...["05-recipient", "07-review"].map((id) => [
      screens.find((s) => s.id === id),
      "tablet",
      834,
      1112,
    ]),
    ...["01-product-options", "07-review", "09-qr-ready", "16-history"].map(
      (id) => [screens.find((s) => s.id === id), "desktop", 1440, 1000],
    ),
  ];
  for (const [s, device, width, height] of variants) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:3104/pages/${s.id}.html`);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      font: document.fonts.check('400 16px "Noto Sans Thai"'),
      logo: document.querySelector("header img").complete,
      cta: [...document.querySelectorAll("button.primary")].map((e) => ({
        height: e.getBoundingClientRect().height,
        font: getComputedStyle(e).fontSize,
        weight: getComputedStyle(e).fontWeight,
      })),
      brokenImages: [...document.images].filter((e) => !e.naturalWidth).length,
    }));
    assert.equal(layout.scrollWidth, width, `${s.id}/${device} overflow`);
    assert(layout.font);
    assert.equal(layout.brokenImages, 0);
    assert.equal(errors.length, 0);
    assert(
      layout.cta.every(
        (c) =>
          c.height >= 56 && parseFloat(c.font) >= 19 && Number(c.weight) >= 700,
      ),
    );
    const file = `mockups/${s.id}-${device}.png`;
    // Viewport layout and fixed-dock checks happen before this full-page export style.
    await page.evaluate(() => document.body.classList.add("capture"));
    await page.screenshot({
      path: path.join(root, file),
      fullPage: true,
      animations: "disabled",
    });
    const bytes = await readFile(path.join(root, file));
    inventory.push({
      id: s.id,
      name: s.name,
      device,
      viewport: { width, height },
      file,
      sha256: sha(bytes),
      bytes: bytes.length,
      approvedAt: null,
    });
    checks.push({ id: s.id, device, ...layout, pageErrors: errors });
    await page.close();
  }
  // Breakpoint proof without producing additional review images.
  for (const width of [320, 430, 768, 1024, 1280, 1920])
    for (const id of [
      "01-product-options",
      "05-recipient",
      "07-review",
      "09-qr-ready",
      "16-history",
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`http://127.0.0.1:3104/pages/${id}.html`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth),
        width,
        `${id}/${width} overflow`,
      );
      await page.close();
    }
  await writeFile(
    path.join(root, "inventory.json"),
    JSON.stringify(
      {
        version: "1.0.0-review",
        status: "awaiting_user_review",
        approvedAt: null,
        images: inventory,
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    path.join(root, "layout-checks.json"),
    JSON.stringify(
      {
        kind: "static_reference_layout_only",
        functionalOrProviderTest: false,
        capturedReferences: checks.length,
        additionalBreakpointChecks: 30,
        checks,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      images: inventory.length,
      additionalBreakpointChecks: 30,
      status: "awaiting_user_review",
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
