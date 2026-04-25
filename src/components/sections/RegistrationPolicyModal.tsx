"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationPolicyModal({ isOpen, onClose }: Props) {
  const t = useTranslations("registrationCTA");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-5 border-b border-black/5 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg tracking-tight">{t("cancelTitle")}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-black/60" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 text-[14px] text-black/60 leading-relaxed mb-8">
             {t.raw("cancelItems").map((item: string, idx: number) => (
               <div key={idx} className="flex gap-4 items-start">
                 <span className="text-[#0055FF] text-xl leading-none mt-0.5">•</span>
                 <span>{item}</span>
               </div>
             ))}
          </div>

          {/* Table wrapper */}
          <div className="border border-black/10 rounded-xl overflow-hidden bg-white mb-8 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] text-black/70 min-w-[500px]">
                <thead className="bg-[#f8f9fa] border-b border-black/5 text-[12px] uppercase tracking-widest font-bold text-black/80">
                  <tr>
                    <th className="px-6 py-5 whitespace-nowrap">{t("cancelTableTh1")}</th>
                    <th className="px-6 py-5 whitespace-nowrap">{t("cancelTableTh2")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-5">{t("cancelR1C1")}</td>
                    <td className="px-6 py-5 font-semibold text-black">{t("cancelR1C2")}</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-5">{t("cancelR2C1")}</td>
                    <td className="px-6 py-5 font-semibold text-black">{t("cancelR2C2")}</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] transition-colors bg-[#FF5A00]/5">
                    <td className="px-6 py-5">{t("cancelR3C1")}</td>
                    <td className="px-6 py-5 font-bold text-[#FF5A00]">{t("cancelR3C2")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Form Button - currently disabled per user spec */}
          <div className="flex justify-center md:justify-start">
             <button
              disabled
              className="bg-black/5 text-black/40 px-6 py-3 rounded-lg text-[13px] font-medium flex items-center gap-2 cursor-not-allowed border border-black/5"
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
               {t("cancelDownloadBtn")}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
