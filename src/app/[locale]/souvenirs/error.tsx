"use client";
export default function SouvenirError({ reset }: { reset(): void }) {
  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-28 text-slate-900">
      <section
        className="mx-auto max-w-6xl space-y-4"
        aria-label="โหลดข้อมูลไม่สำเร็จ"
      >
        <h1 className="text-2xl font-bold">โหลดข้อมูลไม่สำเร็จ</h1>
        <p className="text-base">กรุณาลองโหลดข้อมูลอีกครั้ง</p>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-xl bg-[#0055FF] px-6 py-3 font-semibold text-white outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#0055FF]"
        >
          ลองอีกครั้ง
        </button>
      </section>
    </main>
  );
}
