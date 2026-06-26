"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

function PaymentReturnToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("paymentReturn");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const status = searchParams.get("status");
    if (status !== "registered") return;

    handled.current = true;

    const regCode = searchParams.get("regCode");
    toast.success(regCode ? t("successWithCode", { regCode }) : t("success"), {
      duration: 6000,
    });

    // Strip the payment-return params so a refresh doesn't re-trigger the toast.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("regCode");
    params.delete("orderNumber");
    const query = params.toString();
    router.replace(
      `${window.location.pathname}${query ? `?${query}` : ""}`,
      { scroll: false }
    );
  }, [searchParams, router, t]);

  return null;
}

export default function PaymentReturnToast() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnToastInner />
    </Suspense>
  );
}
