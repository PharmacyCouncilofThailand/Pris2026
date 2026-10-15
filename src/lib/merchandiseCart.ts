import type { CartDto, CartLine, StoreDto } from "../types/merchandise";
import { variantLabel } from "./merchandiseSelection";
export function canCheckout(cart: CartDto, store: StoreDto): boolean {
  return (
    store.state === "open" &&
    cart.items.length > 0 &&
    cart.items.every((item) => item.valid) &&
    cart.amounts !== null
  );
}
export function cartLineOptions(line: CartLine): string {
  if (!line.product) return "ไม่สามารถโหลดตัวเลือกเดิมได้";
  if (line.product.kind === "bundle") return "ชุดสินค้า";
  const variant = line.product.variants.find((v) => v.id === line.variantId);
  return variant ? variantLabel(variant) : "ตัวเลือกเดิมไม่พร้อมขาย";
}
export function cartIssueMessage(codes: string[]): string {
  if (codes.includes("MERCH_PREORDER_CLOSED")) return "ปิดรับพรีออเดอร์แล้ว";
  if (codes.includes("MERCH_PREORDER_NOT_OPEN"))
    return "ยังไม่ถึงเวลาเปิดรับพรีออเดอร์";
  if (codes.includes("MERCH_BUNDLE_DEPENDENCY"))
    return "ส่วนประกอบในชุดไม่พร้อมขาย กรุณานำรายการออกหรือตรวจสอบชุดสินค้า";
  if (
    codes.includes("MERCH_ITEM_UNAVAILABLE") ||
    codes.includes("MERCH_VALIDATION")
  )
    return "ตัวเลือกนี้ไม่พร้อมขาย กรุณานำออกหรือเลือกใหม่";
  return "กรุณาตรวจสอบรายการที่ไม่พร้อมขายก่อนดำเนินการต่อ";
}
