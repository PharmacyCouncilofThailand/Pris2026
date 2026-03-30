/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  FileText,
  User
} from "lucide-react";
import { abstractStatusLabels } from "@/data/abstractData";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";

// Mock data for the dashboard
const mockSubmissions = [
  {
    id: "ABS-2026-001",
    title: "Impact of Clinical Pharmacy Services on Patient Outcomes in a Tertiary Care Hospital",
    date: "12 Feb 2026",
    status: "accepted",
    category: "Clinical Pharmacy",
    presenter: "John Doe"
  },
  {
    id: "ABS-2026-042",
    title: "Novel Drug Delivery Systems for Targeted Cancer Therapy",
    date: "05 Mar 2026",
    status: "pending",
    category: "Pharmaceutical Sciences",
    presenter: "Jane Smith"
  },
  {
    id: "ABS-2026-089",
    title: "AI in Pharmacy Education: A Systematic Review",
    date: "14 Mar 2026",
    status: "revision",
    category: "Pharmacy Education",
    presenter: "Alice Johnson"
  }
];

export default function AbstractStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("abstractStatus");
  const locale = useLocale();

  useGSAP(() => {
    gsap.from(".stat-card", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    });

    gsap.from(".table-row", {
      opacity: 0,
      x: -20,
      stagger: 0.05,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.4
    });
  }, { scope: containerRef });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "revision":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "revision": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pt-20">

      
      {/* Top Banner */}
      <section className="bg-[#0a0f1d] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white font-outfit uppercase tracking-tight mb-4">
                {t("title1")} <span className="text-gold">{t("title2")}</span>
              </h1>
              <p className="text-slate-400 font-medium">
                {t("desc")}
              </p>
            </div>
            <Link 
              href="/abstract-submission" 
              className="px-6 py-3 bg-gold text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-gold/10"
            >
              {t("newSubmissionBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard label={t("stats.total")} value="3" icon={<FileText />} color="blue" />
            <StatCard label={t("stats.accepted")} value="1" icon={<CheckCircle />} color="emerald" />
            <StatCard label={t("stats.underReview")} value="1" icon={<Clock />} color="amber" />
            <StatCard label={t("stats.revisionNeeded")} value="1" icon={<BarChart3 />} color="indigo" />
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-all">
                  <Filter className="w-4 h-4" />
                  {t("filterBtn")}
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{locale === "th" ? abstractStatusLabels.table.idTh : abstractStatusLabels.table.id}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{locale === "th" ? abstractStatusLabels.table.titleTh : abstractStatusLabels.table.title}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{locale === "th" ? abstractStatusLabels.table.dateTh : abstractStatusLabels.table.date}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{locale === "th" ? abstractStatusLabels.table.statusTh : abstractStatusLabels.table.status}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">{locale === "th" ? abstractStatusLabels.table.actionsTh : abstractStatusLabels.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockSubmissions.map((sub) => (
                    <tr key={sub.id} className="table-row hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-slate-500">{sub.id}</span>
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <p className="text-sm font-bold text-blue-900 line-clamp-2 md:line-clamp-1 group-hover:text-gold transition-colors">
                          {sub.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.presenter}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-semibold text-slate-500">{sub.date}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(sub.status)}`}>
                          {getStatusIcon(sub.status)}
                          {locale === "th" ? (abstractStatusLabels.statusText as Record<string, string>)[`${sub.status}Th`] : (abstractStatusLabels.statusText as Record<string, string>)[sub.status]}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-gold hover:text-black transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State Footer */}
            <div className="p-8 text-center bg-slate-50 group">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[3px]">
                {locale === "th" ? `แสดงผล ${mockSubmissions.length} จาก ${mockSubmissions.length} รายการ` : `Showing ${mockSubmissions.length} of ${mockSubmissions.length} Submissions`}
              </p>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactElement, color: "blue" | "emerald" | "amber" | "indigo" }) {
  const colors: Record<"blue" | "emerald" | "amber" | "indigo", string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  return (
    <div className={`stat-card p-6 rounded-[2rem] bg-white border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col justify-between h-40 group hover:-translate-y-1 transition-transform`}>
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
        </div>
        <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-gold transition-colors" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{label}</p>
        <p className="text-3xl font-black text-blue-900 font-outfit">{value}</p>
      </div>
    </div>
  );
}
