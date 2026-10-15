import type { ReactNode } from "react";
import { MerchandiseProvider } from "@/components/merchandise/MerchandiseProvider";
export default function SouvenirLayout({ children }: { children: ReactNode }) {
  return <MerchandiseProvider>{children}</MerchandiseProvider>;
}
