"use client";

import React from "react";
import RegistrationCTASection from "@/components/sections/RegistrationCTASection";

export default function RegistrationInfoPage() {
  return (
    <main className="bg-white min-h-screen flex flex-col selection:bg-[#0055FF]/20">
      <div className="flex-grow w-full pt-10">
        <RegistrationCTASection />
      </div>
    </main>
  );
}

