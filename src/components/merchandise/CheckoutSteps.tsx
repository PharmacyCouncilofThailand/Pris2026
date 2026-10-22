import { Check } from "lucide-react";

const LABELS = ["ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"];

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <ol className="merch-steps" aria-label="ขั้นตอนสั่งซื้อ">
      {LABELS.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? "step" : undefined}
          data-completed={index < current ? "true" : undefined}
        >
          <span className="merch-steps-dot">
            {index < current ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              index + 1
            )}
          </span>
          <span className="merch-steps-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}
