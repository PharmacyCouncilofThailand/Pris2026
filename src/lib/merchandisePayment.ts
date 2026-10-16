import type { PaymentState, PaymentView } from "../types/merchandise";
export interface DeadlineAnchor {
  serverEpochMs: number;
  receivedMonotonicMs: number;
}
export function deadlineRemainingMs(
  expiresAt: string,
  anchor: DeadlineAnchor,
  monotonicNowMs: number,
): number {
  const deadline = Date.parse(expiresAt);
  if (
    ![
      deadline,
      anchor.serverEpochMs,
      anchor.receivedMonotonicMs,
      monotonicNowMs,
    ].every(Number.isFinite)
  )
    throw new Error("เวลาหมดอายุยังไม่ยืนยัน");
  return Math.max(
    0,
    deadline -
      anchor.serverEpochMs -
      Math.max(0, monotonicNowMs - anchor.receivedMonotonicMs),
  );
}
export function formatPaymentRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) throw new Error("Invalid remaining time");
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export const ORDER_POLL_MS = 10_000;
export const CHECK_COOLDOWN_MS = 5_000;

export function anchorFrom(
  view: PaymentView,
  monotonicNow: number,
): DeadlineAnchor {
  const serverEpochMs = Date.parse(view.serverNow);
  if (!Number.isFinite(serverEpochMs) || !Number.isFinite(monotonicNow))
    throw new Error("เวลาจากเซิร์ฟเวอร์ไม่ถูกต้อง");
  return { serverEpochMs, receivedMonotonicMs: monotonicNow };
}

export type PanelModel = {
  state: PaymentState | "creating" | "checking";
  title: string;
  message: string | null;
  showQr: boolean;
  primary: "request_qr" | "check" | null;
};

export function panelModel(
  view: PaymentView,
  local: { busy: "creating" | "checking" | null; expiredLocally: boolean },
  orderNumber: string,
): PanelModel {
  if (local.busy === "creating")
    return {
      state: "creating",
      title: "กำลังสร้าง QR",
      message: null,
      showQr: false,
      primary: null,
    };
  if (local.busy === "checking")
    return {
      state: "checking",
      title: "กำลังตรวจสอบ",
      message: null,
      showQr: false,
      primary: null,
    };
  const state: PaymentState =
    view.state === "qr_active" && local.expiredLocally
      ? "verifying"
      : view.state;
  const request = view.canRequestNewQr ? "request_qr" : null;
  const check = view.canCheck ? "check" : null;
  const base = { state, showQr: false, primary: null as PanelModel["primary"] };
  switch (state) {
    case "awaiting_qr":
      return {
        ...base,
        title: "รอสร้าง QR",
        message: "ยังไม่มี QR สำหรับชำระเงิน",
        primary: request,
      };
    case "qr_active":
      return {
        ...base,
        title: "รอชำระเงิน",
        message: "ใช้แอปธนาคารสแกน หรือบันทึกภาพ QR แล้วเลือกรูปในแอปธนาคาร",
        showQr: !!view.attempt?.qrPayload,
        primary: check,
      };
    case "verifying":
      return {
        ...base,
        title: "กำลังตรวจสอบ",
        message: "กำลังตรวจสอบการชำระ กรุณารอสักครู่",
      };
    case "qr_expired_open":
      return {
        ...base,
        title: "QR หมดอายุ",
        message: "QR หมดอายุ",
        primary: request,
      };
    case "qr_expired_closed":
      return {
        ...base,
        title: "หมดเวลาชำระเงิน",
        message: "หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว",
      };
    case "check_failed":
      return {
        ...base,
        title: "ตรวจสอบไม่สำเร็จ",
        message: "ตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง",
        primary: check,
      };
    case "review":
      return {
        ...base,
        title: "รอเจ้าหน้าที่ตรวจสอบ",
        message: `รอเจ้าหน้าที่ตรวจสอบการชำระเงิน หากมีข้อสงสัยติดต่อ pr@pharmacycouncil.org พร้อมเลขออเดอร์ ${orderNumber}`,
      };
    case "paid":
      return { ...base, title: "ชำระเงินสำเร็จ", message: "ชำระเงินสำเร็จ" };
  }
}
