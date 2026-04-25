"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Users,
  Inbox,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface CoAuthor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
  country?: string;
}

interface AbstractItem {
  id: number;
  trackingId: string;
  title: string;
  category: string;
  presentationType: string;
  status: string;
  keywords: string;
  background: string;
  methods: string;
  results: string;
  conclusion: string;
  fullPaperUrl?: string;
  createdAt: string;
  coAuthors: CoAuthor[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending: {
    label: "Under Review",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export default function AbstractTracker() {
  const { token } = useAuth();
  const [abstracts, setAbstracts] = useState<AbstractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchAbstracts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/abstracts/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setAbstracts(data.abstracts || []);
        } else {
          setError(data.error || "Failed to load abstracts");
        }
      } catch {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchAbstracts();
  }, [token]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-bold text-rose-500">{error}</p>
      </div>
    );
  }

  if (abstracts.length === 0) {
    return (
      <div className="text-center py-24 space-y-5">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <Inbox className="w-9 h-9 text-slate-300" />
        </div>
        <p className="text-lg font-black text-slate-400 uppercase tracking-wider">No Submissions Yet</p>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Once you submit an abstract, you can track its review status here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {abstracts.map((item) => {
        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const StatusIcon = status.icon;
        const isExpanded = expandedId === item.id;
        const typeLabel = item.presentationType === "oral" ? "Oral" : "Poster";

        return (
          <div
            key={item.id}
            className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${
              isExpanded ? "shadow-lg border-slate-200" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            {/* Header Row */}
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full px-8 py-7 flex items-center gap-6 text-left group transition-colors hover:bg-slate-50/50"
            >
              {/* Status Indicator */}
              <div className={`w-11 h-11 rounded-2xl ${status.bg} ${status.border} border flex items-center justify-center shrink-0`}>
                <StatusIcon className={`w-5 h-5 ${status.color}`} />
              </div>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight leading-tight">
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {item.trackingId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">
                    {typeLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wide">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg} ${status.border} border`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Expand Toggle */}
              <div className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="px-8 pb-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Mobile Status Badge */}
                <div className={`sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg} ${status.border} border mt-6 mb-4`}>
                  <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Submitted</p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Keywords</p>
                    <p className="text-sm font-bold text-slate-700">{item.keywords || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Document</p>
                    {item.fullPaperUrl ? (
                      <a
                        href={item.fullPaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View PDF
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-slate-400">—</p>
                    )}
                  </div>
                </div>

                {/* Abstract Sections */}
                <div className="mt-8 space-y-5">
                  {[
                    { label: "Background", value: item.background },
                    { label: "Methods", value: item.methods },
                    { label: "Results", value: item.results },
                    { label: "Conclusion", value: item.conclusion },
                  ].map((section) => (
                    <div key={section.label}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1.5">{section.label}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{section.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Co-Authors */}
                {item.coAuthors.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
                        Co-Authors ({item.coAuthors.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {item.coAuthors.map((ca) => (
                        <div
                          key={ca.id}
                          className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600"
                        >
                          {ca.firstName} {ca.lastName}
                          {ca.institution && (
                            <span className="text-slate-400 font-medium ml-1.5">— {ca.institution}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
