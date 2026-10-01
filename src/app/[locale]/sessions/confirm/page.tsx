import type { Metadata } from "next";
import { Suspense } from "react";
import SessionInvitationResponse from "./SessionInvitationResponse";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function SessionInvitationConfirmPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<div className="rounded-3xl bg-white p-8 text-center shadow-sm">…</div>}>
          <SessionInvitationResponse />
        </Suspense>
      </div>
    </main>
  );
}
