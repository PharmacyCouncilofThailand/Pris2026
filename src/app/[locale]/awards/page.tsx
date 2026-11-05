import type { Metadata } from "next";
import { AwardsPage } from "@/components/awards/AwardsPage";

export const metadata: Metadata = {
  title: "ประกาศผลรางวัล | Research Awards | PRIS 2026",
};
export default function Page() {
  return <AwardsPage />;
}
