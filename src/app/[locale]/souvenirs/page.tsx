import { Suspense } from "react";
import StorefrontClient from "@/components/merchandise/StorefrontClient";
import Loading from "./loading";
export default function SouvenirsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StorefrontClient />
    </Suspense>
  );
}
