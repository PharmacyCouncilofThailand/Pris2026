import { ProductGridSkeleton } from "@/components/merchandise/MerchSkeletons";

export default function SouvenirLoading() {
  return (
    <main
      aria-busy="true"
      className="min-h-dvh bg-[#f4f8fc] px-5 pb-12 pt-28 text-slate-900"
    >
      <div className="mx-auto max-w-6xl">
        <ProductGridSkeleton label="กำลังโหลดร้านของที่ระลึก" />
      </div>
    </main>
  );
}
