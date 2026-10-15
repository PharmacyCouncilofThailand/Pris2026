export default function SouvenirLoading() {
  return (
    <main
      aria-busy="true"
      className="min-h-dvh bg-white px-5 pb-12 pt-28 text-slate-900"
    >
      <p role="status" className="mx-auto max-w-6xl text-base">
        กำลังโหลดร้านของที่ระลึก…
      </p>
    </main>
  );
}
