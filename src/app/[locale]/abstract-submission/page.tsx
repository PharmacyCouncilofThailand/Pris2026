/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Users, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  PencilLine
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import PageHero from "@/components/sections/PageHero";
import {
  ABSTRACT_SECTION_NAMES,
  type AbstractSectionName,
} from "@/lib/abstractWordCount";
import { useAuthoritativeWordCount } from "./useAuthoritativeWordCount";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE || "";
const MAX_ABSTRACT_FILES = 3;
const MAX_ABSTRACT_FILE_SIZE = 30 * 1024 * 1024;
const MAX_ABSTRACT_TOTAL_SIZE = MAX_ABSTRACT_FILE_SIZE * MAX_ABSTRACT_FILES;

interface CategoryOption {
  id: number;
  name: string;
}

interface ExistingAbstractFile {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  sortOrder?: number;
}

interface RevisionRequestFile {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

interface RevisionRequest {
  id: number;
  topic: string;
  comment: string;
  status: string;
  createdAt: string;
  files?: RevisionRequestFile[];
}

const BODY_REVISION_TOPICS = new Set(["background", "objective", "methods", "results", "conclusion", "documents"]);

function useRevisionTopicLabel() {
  const t = useTranslations("abstractSubmission");
  return (topic?: string) => {
    if (!topic) return t("ui.rewriteRequest");
    const map: Record<string, string> = {
      title: t("step3.abstractTitle"),
      keywords: t("step3.keywords"),
      background: t("step4.background"),
      objective: t("ui.objective"),
      methods: t("step4.methods"),
      results: t("step4.results"),
      conclusion: t("ui.conclusion"),
      documents: t("step5.attachedDocs"),
      other: t("ui.revisionTopicOther"),
    };
    return map[topic] || topic;
  };
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function AbstractSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountingForNavigation, setIsCountingForNavigation] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isEditParamReady, setIsEditParamReady] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editLoadError, setEditLoadError] = useState("");
  const [existingFiles, setExistingFiles] = useState<ExistingAbstractFile[]>([]);
  const [revisionRequest, setRevisionRequest] = useState<RevisionRequest | null>(null);
  const t = useTranslations("abstractSubmission");
  const ts = useTranslations("abstractSubmissionToasts");
  const tv = useTranslations("abstractSubmission.validation");
  const tu = useTranslations("abstractSubmission.ui");
  const getRevisionTopicLabel = useRevisionTopicLabel();
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();
  const isEditMode = editId !== null;

  useEffect(() => {
    const rawEditId = new URLSearchParams(window.location.search).get("edit");
    const parsedEditId = rawEditId ? Number(rawEditId) : null;
    setEditId(Number.isInteger(parsedEditId) && parsedEditId !== null && parsedEditId > 0 ? parsedEditId : null);
    setIsEditParamReady(true);
  }, []);
  
  // Login guard — redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const redirectTarget = `/abstract-submission${window.location.search || ""}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [isAuthenticated, router]);

  // Fetch categories from API
  useEffect(() => {
    if (EVENT_CODE) {
      fetch(`${API_URL}/api/events/${EVENT_CODE}/abstract-categories`)
        .then(res => res.json())
        .then(data => {
          if (data.categories) {
            setCategories([...data.categories].sort((a: CategoryOption, b: CategoryOption) => a.id - b.id));
          }
        })
        .catch(() => { /* silently fail, categories will be empty */ });
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    author: { firstName: "", lastName: "", email: "", affiliation: "", phone: "" },
    coAuthors: [] as { firstName: string, lastName: string, institution: string, email: string }[],
    abstract: { title: "", categoryId: undefined as number | undefined, category: "", type: "", keywords: "" },
    content: { background: "", objective: "", methods: "", results: "", conclusion: "" },
    files: [] as File[]
  });

  const wordCountInput = useMemo(
    () => ({
      title: formData.abstract.title,
      keywords: formData.abstract.keywords,
      background: formData.content.background,
      objective: formData.content.objective,
      methods: formData.content.methods,
      results: formData.content.results,
      conclusion: formData.content.conclusion,
    }),
    [
      formData.abstract.keywords,
      formData.abstract.title,
      formData.content.background,
      formData.content.conclusion,
      formData.content.methods,
      formData.content.objective,
      formData.content.results,
    ],
  );

  const authoritativeCount = useAuthoritativeWordCount({
    apiUrl: API_URL,
    token: token ?? null,
    input: wordCountInput,
    enabled: isAuthenticated && Boolean(token),
  });

  // Autofill user data when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          firstName: user.firstName || prev.author.firstName,
          lastName: user.lastName || prev.author.lastName,
          email: user.email || prev.author.email,
          // Fallback chain: institution (pharmacist/medical/general) → university (students)
          affiliation: user.institution || user.university || prev.author.affiliation,
          phone: user.phone || prev.author.phone,
        }
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isEditParamReady || !isEditMode || !editId || !token) return;

    let isMounted = true;
    const loadEditableAbstract = async () => {
      setIsLoadingEdit(true);
      setEditLoadError("");
      try {
        const res = await fetch(`${API_URL}/api/abstracts/user/${editId}/edit`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok || !data.abstract) {
          throw new Error(data.error || tu("loadRevisionError"));
        }

        if (!isMounted) return;
        const abstractData = data.abstract;
        const latestRevisionRequest = abstractData.latestRevisionRequest || null;

        setFormData(prev => ({
          ...prev,
          coAuthors: (abstractData.coAuthors || []).map((coAuthor: any) => ({
            firstName: coAuthor.firstName || "",
            lastName: coAuthor.lastName || "",
            institution: coAuthor.institution || "",
            email: coAuthor.email || "",
          })),
          abstract: {
            title: abstractData.title || "",
            categoryId: abstractData.categoryId || undefined,
            category: abstractData.category || "",
            type: abstractData.presentationType
              ? abstractData.presentationType.charAt(0).toUpperCase() + abstractData.presentationType.slice(1)
              : "",
            keywords: abstractData.keywords || "",
          },
          content: {
            background: abstractData.background || "",
            objective: abstractData.objective || "",
            methods: abstractData.methods || "",
            results: abstractData.results || "",
            conclusion: abstractData.conclusion || "",
          },
          files: [],
        }));
        setExistingFiles(
          abstractData.files && abstractData.files.length > 0
            ? [...abstractData.files].sort((a: ExistingAbstractFile, b: ExistingAbstractFile) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            : abstractData.fullPaperUrl
              ? [{ fileName: tu("currentAbstractPdf"), fileUrl: abstractData.fullPaperUrl }]
              : [],
        );
        setRevisionRequest(latestRevisionRequest);
        setTrackingId(abstractData.trackingId || "");
        setCurrentStep(latestRevisionRequest && BODY_REVISION_TOPICS.has(latestRevisionRequest.topic) ? 4 : 3);
      } catch (error) {
        if (!isMounted) return;
        setEditLoadError(error instanceof Error ? error.message : tu("loadRevisionError"));
      } finally {
        if (isMounted) setIsLoadingEdit(false);
      }
    };

    loadEditableAbstract();

    return () => {
      isMounted = false;
    };
  }, [editId, isEditMode, isEditParamReady, token, tu]);

  const steps = [
    { id: 1, label: t("steps.step1"), icon: <User className="w-5 h-5" /> },
    { id: 2, label: t("steps.step2"), icon: <Users className="w-5 h-5" /> },
    { id: 3, label: t("steps.step3"), icon: <FileText className="w-5 h-5" /> },
    { id: 4, label: t("steps.step4"), icon: <Upload className="w-5 h-5" /> },
    { id: 5, label: t("steps.step5"), icon: <CheckCircle className="w-5 h-5" /> },
  ];

  useGSAP(() => {
    // Transition effect when step changes
    gsap.fromTo(".step-content", 
      { opacity: 0, x: 20 }, 
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [currentStep]);

  // Don't render form until authenticated and edit data is ready
  if (!isAuthenticated || !isEditParamReady || (isEditMode && isLoadingEdit)) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </main>
    );
  }

  if (isEditMode && editLoadError) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-[2rem] border border-rose-100 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {tu("revisionUnavailable")}
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            {editLoadError}
          </p>
          <Link
            href="/profile"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-8 py-4 text-[10px] font-black uppercase tracking-[3px] text-white transition-all hover:bg-gold hover:text-black"
          >
            {tu("backToAbstractTracker")}
          </Link>
        </div>
      </main>
    );
  }

  const handleNext = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let freshWordCount = authoritativeCount.result;

    if (currentStep === 3 || currentStep === 4) {
      setIsCountingForNavigation(true);
      try {
        freshWordCount = await authoritativeCount.refresh();
      } catch {
        toast.error(ts("wordCountUnavailable"));
        return;
      } finally {
        setIsCountingForNavigation(false);
      }
    }

    // Step 1: Presenting Author — mirror API: firstName/lastName/email/affiliation required (min 1), email valid
    if (currentStep === 1) {
      const { firstName, lastName, email, affiliation } = formData.author;
      const missing: string[] = [];
      if (!firstName.trim()) missing.push(tv("firstName"));
      if (!lastName.trim()) missing.push(tv("lastName"));
      if (!email.trim()) missing.push(tv("email"));
      else if (!emailRe.test(email.trim())) missing.push(tv("validEmail"));
      if (!affiliation.trim()) missing.push(tv("affiliation"));
      if (missing.length > 0) {
        setShowErrors(true);
        toast.error(ts("completeFields", { fields: missing.join(", ") }));
        return;
      }
    }

    // Step 2: Co-Authors are optional, but if added each must be complete (API requires firstName/lastName/email/institution)
    if (currentStep === 2) {
      for (let i = 0; i < formData.coAuthors.length; i++) {
        const ca = formData.coAuthors[i];
        const missing: string[] = [];
        if (!ca.firstName.trim()) missing.push(tv("firstName"));
        if (!ca.lastName.trim()) missing.push(tv("lastName"));
        if (!ca.email.trim()) missing.push(tv("email"));
        else if (!emailRe.test(ca.email.trim())) missing.push(tv("validEmail"));
        if (!ca.institution.trim()) missing.push(tv("institution"));
        if (missing.length > 0) {
          setShowErrors(true);
          toast.error(ts("coAuthorFields", { index: i + 1, fields: missing.join(", ") }));
          return;
        }
      }
    }

    // Step 3: title min 10 / max 500, category, presentationType, keywords required
    if (currentStep === 3) {
      if (!freshWordCount) {
        toast.error(ts("wordCountUnavailable"));
        return;
      }
      const { title, category, type, keywords } = formData.abstract;
      const titleWordCount = freshWordCount.counts.title;
      const keywordCount = freshWordCount.counts.keywords;
      const { titleMax, keywordMax } = freshWordCount.limits;
      const missing: string[] = [];
      if (!title.trim()) missing.push(tv("title"));
      else if (title.trim().length < 10) missing.push(tv("titleMinChars"));
      else if (titleWordCount > titleMax) missing.push(tv("titleMaxWords", { limit: titleMax }));
      else if (title.trim().length > 500) missing.push(tv("titleMaxChars"));
      if (!category.trim()) missing.push(tv("submissionTheme"));
      if (!type.trim()) missing.push(tv("presentationMode"));
      if (!keywords.trim()) missing.push(tv("keywords"));
      else if (keywordCount > keywordMax) missing.push(tv("keywordsMax", { limit: keywordMax }));
      if (missing.length > 0) {
        setShowErrors(true);
        toast.error(ts("fixFields", { fields: missing.join(", ") }));
        return;
      }
    }

    // Step 4: validate section and total limits returned by the API.
    if (currentStep === 4) {
      if (!freshWordCount) {
        toast.error(ts("wordCountUnavailable"));
        return;
      }
      const issues: string[] = [];
      const sectionLabels: Record<AbstractSectionName, string> = {
        background: t("step4.background"),
        objective: tu("objective"),
        methods: t("step4.methods"),
        results: t("step4.results"),
        conclusion: tu("conclusion"),
      };
      for (const k of ABSTRACT_SECTION_NAMES) {
        const v = formData.content[k].trim();
        const label = sectionLabels[k];
        const sectionWords = freshWordCount.counts.sections[k];
        if (!v) issues.push(label);
        else if (sectionWords < freshWordCount.limits.sectionMin) {
          issues.push(tv("sectionMinWords", {
            label,
            min: freshWordCount.limits.sectionMin,
          }));
        }
      }
      if (issues.length > 0) {
        setShowErrors(true);
        toast.error(ts("fixFields", { fields: issues.join(", ") }));
        return;
      }
      const totalWords = freshWordCount.counts.total;
      if (totalWords > freshWordCount.limits.totalMax) {
        toast.error(ts("wordLimitExceeded", {
          count: totalWords,
          limit: freshWordCount.limits.totalMax,
        }));
        return;
      }
      // File required (matches API: at least one abstract PDF is required)
      if (formData.files.length === 0) {
        setShowErrors(true);
        toast.error(isEditMode ? ts("attachPdfEdit") : ts("attachPdf"));
        return;
      }
    }

    setShowErrors(false);
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Final guard — file is required by API
    if (formData.files.length === 0) {
      const fileRequiredMessage = isEditMode ? tu("fileRequiredEdit") : tu("fileRequired");
      setSubmitError(fileRequiredMessage);
      toast.error(fileRequiredMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const fd = new FormData();
      fd.append("firstName", formData.author.firstName);
      fd.append("lastName", formData.author.lastName);
      fd.append("email", formData.author.email);
      fd.append("affiliation", formData.author.affiliation);
      if (formData.author.phone) fd.append("phone", formData.author.phone);
      fd.append("title", formData.abstract.title);
      if (formData.abstract.categoryId) {
        fd.append("categoryId", String(formData.abstract.categoryId));
      }
      fd.append("category", formData.abstract.category);
      fd.append("presentationType", formData.abstract.type.toLowerCase());
      fd.append("keywords", formData.abstract.keywords);
      fd.append("background", formData.content.background);
      fd.append("objective", formData.content.objective);
      fd.append("methods", formData.content.methods);
      fd.append("results", formData.content.results);
      fd.append("conclusion", formData.content.conclusion);
      if (EVENT_CODE) fd.append("eventCode", EVENT_CODE);
      if (formData.coAuthors.length > 0) {
        fd.append("coAuthors", JSON.stringify(formData.coAuthors));
      }
      formData.files.forEach((file) => {
        fd.append("abstractFiles", file);
      });

      const endpoint = isEditMode && editId
        ? `${API_URL}/api/abstracts/user/${editId}/resubmit`
        : `${API_URL}/api/abstracts/submit`;

      const res = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || (isEditMode ? tu("resubmissionFailed") : tu("submissionFailed")));
        return;
      }

      setTrackingId(data.abstract?.trackingId || "");
      setIsSubmitted(true);
    } catch {
      setSubmitError(tu("networkSubmitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-gold selection:text-black overflow-x-hidden">

      
      {/* ─── Modern Research Studio Layout ─── */}
      <section className="pt-32 pb-40">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          {/* Header Info */}
          <PageHero
            title1={t("title1")}
            title2={t("title2")}
            subtitle={t("desc")}
          />

          {isEditMode && (
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mb-8">
              <div className="flex gap-4 items-start text-left max-w-4xl mx-auto">
                <PencilLine className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-[2px] mb-2">
                    {tu("revisionMode")}
                  </h4>
                  <p className="text-sm text-blue-700/80 leading-relaxed">
                    {tu("revisionModeDesc")}
                  </p>
                  {revisionRequest && (
                    <p className="mt-3 text-sm font-bold text-blue-950">
                      {tu("revisionTopic")} {getRevisionTopicLabel(revisionRequest.topic)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-16">
            <div className="flex gap-4 items-start justify-center text-left max-w-3xl mx-auto">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">{tu("importantNote")}</h4>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                  {tu("importantNoteDesc")}
                </p>
                <Link href="/abstract-guidelines" className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-2 inline-flex items-center gap-2 hover:text-blue-800 transition-colors">
                  {t("warning")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Horizontal Stepper */}
          <div className="mb-16 relative w-full">
            {/* Connecting Lines Base */}
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-200 z-0"></div>
            {/* Progress Fill */}
            <div 
              className="absolute top-5 left-8 h-[2px] bg-slate-950 z-0 transition-all duration-500" 
              style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 4rem + ${currentStep === 1 ? '4rem' : currentStep === steps.length ? '0rem' : '2rem'})` }}
            ></div>
            
            <div className="relative z-10 flex justify-between items-start">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-4 group bg-[#fafafa] px-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 border-2 relative z-10",
                    currentStep === step.id 
                      ? "bg-slate-950 border-slate-950 text-white shadow-xl scale-110" 
                      : currentStep > step.id 
                        ? "bg-slate-950 border-slate-950 text-white" 
                        : "bg-white border-slate-200 text-slate-300"
                  )}>
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : `0${step.id}`}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest mb-1",
                      currentStep === step.id ? "text-orange-500" : "text-slate-300"
                    )}>
                      {t("stage")} 0{step.id}
                    </span>
                    <span className={cn(
                      "text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center max-w-[100px]",
                      currentStep === step.id ? "text-slate-900" : "text-slate-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Form Workspace */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-slate-100 p-8 md:p-16 lg:p-20 overflow-hidden relative group">
            {/* Decorative Soft Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 min-h-[500px]">
              <div className="step-content">
                {currentStep === 1 && <Step1Author data={formData.author} setFormData={setFormData} showErrors={showErrors} />}
                {currentStep === 2 && <Step2CoAuthors list={formData.coAuthors} setFormData={setFormData} showErrors={showErrors} />}
                {currentStep === 3 && (
                  <Step3Details
                    data={formData.abstract}
                    setFormData={setFormData}
                    categories={categories}
                    showErrors={showErrors}
                    titleWordCount={authoritativeCount.result?.counts.title ?? null}
                    titleWordLimit={authoritativeCount.result?.limits.titleMax ?? null}
                    keywordCount={authoritativeCount.result?.counts.keywords ?? null}
                    keywordLimit={authoritativeCount.result?.limits.keywordMax ?? null}
                    wordCountLoading={authoritativeCount.status === "loading"}
                    wordCountStale={authoritativeCount.isStale}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Content
                    content={formData.content}
                    files={formData.files}
                    setFormData={setFormData}
                    showErrors={showErrors}
                    isEditMode={isEditMode}
                    existingFiles={existingFiles}
                    revisionRequest={revisionRequest}
                    sectionWordCounts={authoritativeCount.result?.counts.sections ?? null}
                    sectionWordMinimum={authoritativeCount.result?.limits.sectionMin ?? null}
                    totalWords={authoritativeCount.result?.counts.total ?? null}
                    totalWordLimit={authoritativeCount.result?.limits.totalMax ?? null}
                    wordCountLoading={authoritativeCount.status === "loading"}
                    wordCountStale={authoritativeCount.isStale}
                  />
                )}
                {currentStep === 5 && <Step5Review data={formData} isEditMode={isEditMode} trackingId={trackingId} />}
              </div>

              {/* Navigation Controls */}
              <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  {currentStep > 1 && (
                    <button 
                      onClick={handleBack}
                      className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[3px] text-slate-400 hover:text-slate-950 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      {t("previousPhase")}
                    </button>
                  )}
                </div>
                
                {submitError && (
                  <div className="w-full md:w-auto px-6 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 font-bold">
                    {submitError}
                  </div>
                )}
                <button 
                  onClick={currentStep === 5 ? handleSubmit : handleNext}
                  disabled={isSubmitting || isCountingForNavigation}
                  className="w-full md:w-auto px-16 py-6 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[4px] text-[11px] hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-4 group/next shadow-2xl active:scale-95 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCountingForNavigation ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {tu("wordCountChecking")}</>
                  ) : isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? tu("resubmitting") : tu("submitting")}</>
                  ) : currentStep === 5 ? (isEditMode ? tu("resubmitRevised") : t("submitFinalAbstract")) : t("proceedToNextStage")}
                  {!isSubmitting && !isCountingForNavigation && <ArrowRight className="w-4 h-4 group-hover/next:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Submit Abstract Success Modal ─── */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 max-w-xl w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
              {isEditMode ? tu("resubmissionComplete") : t("submissionComplete")}
            </h2>
            {trackingId && (
              <div className="bg-slate-50 rounded-2xl px-6 py-4 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1">{tu("trackingId")}</p>
                <p className="text-2xl font-black text-slate-900">{trackingId}</p>
              </div>
            )}
            {isEditMode ? (
              <p className="text-lg text-slate-500 font-medium mb-3 whitespace-pre-line">
                {tu("resubmissionSuccessDesc")}
              </p>
            ) : (
            <p className="text-lg text-slate-500 font-medium mb-3 whitespace-pre-line">
              {t("successDesc")}
            </p>
            )}
            <p className="text-xs font-bold text-slate-400 mb-10 px-6 uppercase tracking-widest">
              {t("successDescEn")}
            </p>
            <Link 
              href={isEditMode ? "/profile" : "/"}
              onClick={() => setIsSubmitted(false)}
              className="px-10 py-5 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[4px] text-[10px] sm:text-[11px] hover:bg-gold hover:text-black shadow-lg transition-all block w-full sm:w-auto"
            >
              {isEditMode ? tu("backToAbstractTracker") : t("returnToHomepage")}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// Sub-component: Step 1
function Step1Author({ data, setFormData, showErrors }: { data: any, setFormData: React.Dispatch<React.SetStateAction<any>>, showErrors: boolean }) {
  const t = useTranslations("abstractSubmission");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      author: { ...prev.author, [name]: value }
    }));
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">{t("step1.title1")} <span className="text-orange-500/80">{t("step1.title2")}</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">{t("step1.subtitle")}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label={t("step1.firstName")} name="firstName" value={data.firstName} onChange={handleChange} placeholder={t("step1.firstNamePlaceholder")} required error={showErrors && !data.firstName.trim()} />
        <InputGroup label={t("step1.lastName")} name="lastName" value={data.lastName} onChange={handleChange} placeholder={t("step1.lastNamePlaceholder")} required error={showErrors && !data.lastName.trim()} />
        <div className="md:col-span-2">
          <InputGroup label={t("step1.email")} name="email" value={data.email} onChange={handleChange} placeholder="john.doe@university.edu" type="email" required error={showErrors && (!data.email.trim() || !emailRe.test(data.email.trim()))} />
        </div>
        <div className="md:col-span-2">
          <InputGroup label={t("step1.affiliation")} name="affiliation" value={data.affiliation} onChange={handleChange} placeholder="e.g. Faculty of Pharmacy, Chulalongkorn University" required error={showErrors && !data.affiliation.trim()} />
        </div>
        <InputGroup label={t("step1.phone")} name="phone" value={data.phone} onChange={handleChange} placeholder={t("step1.phonePlaceholder")} />
      </div>
    </div>
  );
}

// Sub-component: Step 2
function Step2CoAuthors({ list, setFormData, showErrors }: { list: any[], setFormData: React.Dispatch<React.SetStateAction<any>>, showErrors: boolean }) {
  const t = useTranslations("abstractSubmission");
  const tu = useTranslations("abstractSubmission.ui");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const addAuthor = () => {
    setFormData((prev: any) => ({
      ...prev,
      coAuthors: [...prev.coAuthors, { firstName: "", lastName: "", institution: "", email: "" }]
    }));
  };

  const removeAuthor = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newList = [...list];
    newList[index][name] = value;
    setFormData((prev: any) => ({ ...prev, coAuthors: newList }));
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">{t("step2.title1")}<span className="text-orange-500/80">{t("step2.title2")}</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">{t("step2.subtitle")}</p>
        </div>
        <button 
          onClick={addAuthor}
          className="px-8 py-4 bg-slate-950 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-[3px] shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {t("buttons.addAuth")}
        </button>
      </div>

      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        {list.length === 0 && (
          <div className="p-16 border-2 border-dashed border-blue-100 rounded-[3rem] text-center bg-blue-50/30">
            <div className="w-20 h-20 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-blue-900/40 font-black uppercase tracking-[3px] text-xs">{t("step2.empty")}</p>
          </div>
        )}
        {list.map((author: any, idx: number) => (
          <div key={idx} className="p-10 bg-white shadow-sm rounded-[3rem] border border-slate-100 relative group hover:border-orange-500/30 transition-all duration-500">
            <button 
              onClick={() => removeAuthor(idx)}
              className="absolute top-8 right-8 text-rose-400 hover:text-rose-600 transition-colors p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl"
              aria-label={tu("removeCoAuthor")}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label={t("step2.firstName")} name="firstName" value={author.firstName} onChange={(e: any) => handleChange(idx, e)} placeholder={t("step2.firstNamePlaceholder")} required error={showErrors && !author.firstName.trim()} />
              <InputGroup label={t("step2.lastName")} name="lastName" value={author.lastName} onChange={(e: any) => handleChange(idx, e)} placeholder={t("step2.lastNamePlaceholder")} required error={showErrors && !author.lastName.trim()} />
              <div className="md:col-span-2">
                <InputGroup label={t("step2.affiliation")} name="institution" value={author.institution} onChange={(e: any) => handleChange(idx, e)} placeholder={tu("institutionPlaceholder")} required error={showErrors && !author.institution.trim()} />
              </div>
              <div className="md:col-span-2">
                <InputGroup label={t("step2.email")} name="email" value={author.email} onChange={(e: any) => handleChange(idx, e)} placeholder="jane.smith@example.com" type="email" required error={showErrors && (!author.email.trim() || !emailRe.test(author.email.trim()))} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-component: Step 3
function Step3Details({
  data,
  setFormData,
  categories,
  showErrors,
  titleWordCount,
  titleWordLimit,
  keywordCount,
  keywordLimit,
  wordCountLoading,
  wordCountStale,
}: {
  data: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  categories: CategoryOption[],
  showErrors: boolean,
  titleWordCount: number | null,
  titleWordLimit: number | null,
  keywordCount: number | null,
  keywordLimit: number | null,
  wordCountLoading: boolean,
  wordCountStale: boolean,
}) {
  const t = useTranslations("abstractSubmission");
  const tu = useTranslations("abstractSubmission.ui");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      abstract: { ...prev.abstract, [name]: value }
    }));
  };

  const selectCategory = (cat: CategoryOption) => {
    setFormData((prev: any) => ({
      ...prev,
      abstract: { ...prev.abstract, categoryId: cat.id, category: cat.name }
    }));
    setIsCategoryOpen(false);
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">{t("step3.title1")} <span className="text-orange-500/80">{t("step3.title2")}</span></h2>
        <p className="text-slate-500 font-medium text-lg italic">{t("step3.subtitle")}</p>
        <p className="text-xs font-bold text-slate-400 mt-2"><span className="text-rose-500">*</span> {tu("requiredFieldHint")}</p>
      </div>
      
      <div className="space-y-10">
        <div className="space-y-2">
          <InputGroup
            label={t("step3.abstractTitle")}
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder={t("step3.abstractTitlePlaceholder")}
            required
            error={showErrors && (
              data.title.trim().length < 10 ||
              data.title.trim().length > 500 ||
              (!wordCountStale && titleWordCount !== null && titleWordLimit !== null && titleWordCount > titleWordLimit)
            )}
          />
          <p className={`text-[10px] font-black uppercase tracking-[2px] text-right ${
            !wordCountStale && titleWordCount !== null && titleWordLimit !== null && titleWordCount >= titleWordLimit
              ? "text-amber-500"
              : "text-slate-300"
          }`}>
            {tu("titleWordCount", {
              current: titleWordCount ?? "—",
              limit: titleWordLimit ?? "—",
            })}
            {(wordCountLoading || wordCountStale) && ` · ${tu("wordCountStale")}`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-black text-gold uppercase tracking-[2px]">{t("step3.category")} <span className="text-rose-500">*</span></label>
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full text-left px-6 py-5 bg-white border rounded-2xl text-sm font-bold outline-none transition-all flex items-center justify-between shadow-sm ${
                  isCategoryOpen ? "border-blue-500 ring-2 ring-blue-500/20" : showErrors && !data.category ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
                } ${data.category ? "text-slate-900" : "text-slate-400"}`}
              >
                <span>{data.category || t("step3.selectCategory")}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                  {categories.map((cat: CategoryOption) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat)}
                      className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors ${
                        data.category === cat.name
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="text-sm font-black text-gold uppercase tracking-[2px]">{t("step3.preferPresentationMode")} <span className="text-rose-500">*</span></label>
            <div className="flex gap-3">
              {['Oral', 'Poster'].map(type => (
                  <button 
                    key={type}
                    onClick={() => handleChange({ target: { name: 'type', value: type } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                    className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[3px] transition-all ${
                      data.type === type ? "bg-blue-600 text-white border-blue-600 shadow-md" : showErrors && !data.type ? "bg-white text-slate-400 border-rose-400 ring-2 ring-rose-100" : "bg-white text-slate-400 border-slate-200 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {type}
                  </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <InputGroup
            label={t("step3.keywords")}
            name="keywords"
            value={data.keywords}
            onChange={handleChange}
            placeholder={tu("keywordsPlaceholderShort")}
            required
            error={showErrors && (
              !data.keywords.trim() ||
              (!wordCountStale && keywordCount !== null && keywordLimit !== null && keywordCount > keywordLimit)
            )}
          />
          <p className={`text-[10px] font-black uppercase tracking-[2px] text-right ${
            !wordCountStale && keywordCount !== null && keywordLimit !== null && keywordCount >= keywordLimit
              ? "text-amber-500"
              : "text-slate-300"
          }`}>
            {tu("keywordCount", {
              current: wordCountStale ? "—" : (keywordCount ?? "—"),
              limit: keywordLimit ?? "—",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Step 4
function Step4Content({
  content,
  files,
  setFormData,
  showErrors,
  isEditMode = false,
  existingFiles = [],
  revisionRequest = null,
  sectionWordCounts,
  sectionWordMinimum,
  totalWords,
  totalWordLimit,
  wordCountLoading,
  wordCountStale,
}: {
  content: any,
  files: File[],
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  showErrors: boolean,
  isEditMode?: boolean,
  existingFiles?: ExistingAbstractFile[],
  revisionRequest?: RevisionRequest | null,
  sectionWordCounts: Record<AbstractSectionName, number> | null,
  sectionWordMinimum: number | null,
  totalWords: number | null,
  totalWordLimit: number | null,
  wordCountLoading: boolean,
  wordCountStale: boolean,
}) {
  const t = useTranslations("abstractSubmission");
  const tu = useTranslations("abstractSubmission.ui");
  const ts = useTranslations("abstractSubmissionToasts");
  const tt = useTranslations("toasts");
  const getRevisionTopicLabel = useRevisionTopicLabel();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      content: { ...prev.content, [name]: value }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";

    if (selectedFiles.length === 0) return;

    const invalidFiles = selectedFiles.filter((file) => {
      const isPdfMime = file.type === "application/pdf";
      const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
      return !isPdfMime && !hasPdfExtension;
    });

    if (invalidFiles.length > 0) {
      toast.error(tt("pdfOnly"));
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_ABSTRACT_FILE_SIZE);
    if (oversizedFile) {
      toast.error(ts("fileExceedsLimit", { name: oversizedFile.name }));
      return;
    }

    const mergedFiles = [...files];
    for (const file of selectedFiles) {
      const isDuplicate = mergedFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );
      if (!isDuplicate) mergedFiles.push(file);
    }

    if (mergedFiles.length > MAX_ABSTRACT_FILES) {
      toast.error(ts("maxFiles", { count: MAX_ABSTRACT_FILES }));
      return;
    }

    const totalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_ABSTRACT_TOTAL_SIZE) {
      toast.error(ts("totalSizeExceeded", { size: formatFileSize(MAX_ABSTRACT_TOTAL_SIZE) }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, files: mergedFiles }));
  };

  const removeFile = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      files: prev.files.filter((_: File, fileIndex: number) => fileIndex !== index),
    }));
  };

  const hasFreshWordCount = !wordCountStale && totalWords !== null && totalWordLimit !== null;
  const wordPercent = totalWords !== null && totalWordLimit
    ? Math.min((totalWords / totalWordLimit) * 100, 100)
    : 0;
  const attachedSize = files.reduce((sum, file) => sum + file.size, 0);
  const hasFileError = showErrors && files.length === 0;

  const sections: Array<{ key: AbstractSectionName; label: string }> = [
    { key: 'background', label: t("step4.background") },
    { key: 'objective', label: tu("objective") },
    { key: 'methods', label: t("step4.methods") },
    { key: 'results', label: t("step4.results") },
    { key: 'conclusion', label: tu("conclusion") },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">{t("step4.title1")} <span className="text-orange-500/80">{t("step4.title2")}</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">{t("step4.subtitle")}</p>
          <p className="text-xs font-bold text-slate-400 mt-2"><span className="text-rose-500">*</span> {tu("requiredFieldHint")}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-5 py-3 rounded-2xl text-sm font-black ${hasFreshWordCount && totalWords > totalWordLimit ? 'bg-rose-50 text-rose-600' : hasFreshWordCount && totalWords >= totalWordLimit * 0.83 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
            {tu("wordsTotal", { current: totalWords ?? "—", limit: totalWordLimit ?? "—" })}
          </div>
          <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${hasFreshWordCount && totalWords > totalWordLimit ? 'bg-rose-500' : hasFreshWordCount && totalWords >= totalWordLimit * 0.83 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${wordPercent}%` }}
            />
          </div>
          <p className="max-w-xs text-right text-[10px] font-bold leading-relaxed text-slate-400">
            {(wordCountLoading || wordCountStale) && `${tu("wordCountStale")} · `}
            {tu("wordCountPolicyNote")}
          </p>
        </div>
      </div>

      {isEditMode && revisionRequest && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
          <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-500 mb-2">
            {tu("rewriteRequest")}
          </p>
          <p className="text-sm font-black text-slate-900 uppercase tracking-wide">
            {getRevisionTopicLabel(revisionRequest.topic)}
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">
            {revisionRequest.comment}
          </p>
          {revisionRequest.files && revisionRequest.files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {revisionRequest.files.map((file, index) => (
                <a
                  key={`${file.fileUrl}-${index}`}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-xs font-black text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.fileName || tu("revisionFile", { index: index + 1 })}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-10 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
        {sections.map(section => {
          const currentText = (content[section.key] || '').trim();
          const currentCount = sectionWordCounts?.[section.key] ?? null;
          const hasFreshSectionCount = !wordCountStale && currentCount !== null && sectionWordMinimum !== null;
          const hasError = showErrors && (
            !currentText || (hasFreshSectionCount && currentCount < sectionWordMinimum)
          );
          return (
          <div key={section.key} className="space-y-4">
            <label className="text-sm font-black text-gold uppercase tracking-[2px] block">{section.label} <span className="text-rose-500">*</span></label>
            <textarea 
              name={section.key}
              value={content[section.key]}
              onChange={handleTextChange}
              className={`w-full px-6 py-6 bg-white border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 min-h-[120px] resize-none leading-relaxed shadow-sm ${hasError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              placeholder={tu("elaboratePlaceholder", { label: section.label })}
            />
            <p className="text-right text-[10px] font-black uppercase tracking-[2px] text-slate-300">
              {tu("sectionWordCount", {
                current: currentCount ?? "—",
                min: sectionWordMinimum ?? "—",
              })}
              {(wordCountLoading || wordCountStale) && ` · ${tu("wordCountStale")}`}
            </p>
          </div>
          );
        })}
        
        <div className="pt-10 border-t border-white/5 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <label className="text-sm font-black text-gold uppercase tracking-[2px] block">
              {isEditMode ? tu("replacementDocsLabel") : tu("fullDocsLabel")} <span className="text-rose-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px]">
              {tu("filesMeta", { count: files.length, max: MAX_ABSTRACT_FILES, size: formatFileSize(attachedSize) })}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-4">
            <p className="text-xs font-bold leading-relaxed text-amber-800">
              {tu("abstractVersionNote")}
            </p>
          </div>

          {isEditMode && existingFiles.length > 0 && (
            <div className="order-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3">
                {tu("currentSubmittedDocs")}
              </p>
              <div className="space-y-2">
                {existingFiles.map((file, index) => (
                  <a
                    key={`${file.fileUrl}-${index}`}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {existingFiles.length > 1 ? `${index + 1}. ` : ""}
                      {file.fileName || tu("currentAbstractPdf")}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {files.length < MAX_ABSTRACT_FILES && (
            <div className="relative group order-2">
              <input 
                type="file" 
                accept=".pdf"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className={`p-16 border-2 border-dashed rounded-[3rem] text-center transition-all duration-500 bg-white group-hover:border-gold group-hover:bg-gold/5 ${
                hasFileError ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
              }`}>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-10 h-10 text-slate-300 group-hover:text-gold" />
                  </div>
                  <p className="text-sm font-black text-slate-400 mb-2 uppercase tracking-[3px]">
                    {files.length > 0 ? (isEditMode ? tu("addMoreReplacement") : tu("addMoreDocuments")) : (isEditMode ? tu("uploadReplacement") : tu("uploadDocuments"))}
                  </p>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[2px]">
                    {tu("pdfOnlyHint", { max: MAX_ABSTRACT_FILES })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {files.length > 0 ? (
            <div className="space-y-3 order-1">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-emerald-950 truncate">{file.name}</p>
                      <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">
                        {formatFileSize(file.size)} • {t("step5.pdfDoc")}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFile(index)} 
                    className="p-3 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-400 hover:text-rose-600 transition-colors shadow-sm"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            hasFileError && (
              <p className="order-1 text-xs font-bold text-rose-500 uppercase tracking-[2px]">
                {isEditMode ? tu("pleaseAttachReplacementPdf") : tu("pleaseAttachPdf")}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component: Step 5
function Step5Review({ data, isEditMode, trackingId }: { data: any, isEditMode: boolean, trackingId?: string }) {
  const t = useTranslations("abstractSubmission");
  const tu = useTranslations("abstractSubmission.ui");

  const sectionLabels: Record<string, string> = {
    background: t("step4.background"),
    objective: tu("objective"),
    methods: t("step4.methods"),
    results: t("step4.results"),
    conclusion: tu("conclusion"),
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-950 uppercase tracking-tight leading-tight">
          {isEditMode ? tu("revisionVerification") : tu("manuscriptVerification")}
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[11px]">{t("step5.subtitle")}</p>
      </div>
      
      <div className="relative">
        {/* Subtle Architectural Background Lines */}
        <div className="absolute -inset-10 border border-slate-100 rounded-[3rem] pointer-events-none" />
        
        <div className="relative z-10 space-y-20">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-slate-100">
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">{t("step5.category")}</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.category || t("step5.generalPharmacy")}</p>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">{t("step5.presentation")}</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.type || "Oral"} {t("step5.modeSuffix")}</p>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">{t("step5.reference")}</span>
              <p className="text-xl font-black text-slate-900 uppercase">{trackingId || "PRIS-2026-TMP"}</p>
            </div>
          </div>

          {/* Research Title Section */}
          <div className="space-y-8">
            <span className="text-sm font-black text-blue-600/60 uppercase tracking-[3px] block">{t("step5.fullTitle")}</span>
            <h3 className="text-4xl md:text-6xl font-black text-slate-950 leading-[1.1] uppercase tracking-tight">
              &quot;{data.abstract.title || t("step5.untitled")}&quot;
            </h3>
          </div>

          {/* Authors Dossier — Principal */}
          <div className="space-y-10">
            <div className="pb-4 border-b-2 border-slate-950 w-fit">
              <span className="text-sm font-black text-slate-950 uppercase tracking-[2px]">{t("step5.author")}</span>
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-black text-slate-950 uppercase leading-none">
                {data.author.firstName} {data.author.lastName}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{data.author.affiliation}</p>
                <p className="text-xs text-blue-600/60 font-black tracking-widest">{data.author.email}</p>
              </div>
            </div>
          </div>

          {/* Authors Dossier — Co-Authors */}
          <div className="space-y-10 pt-10 border-t border-slate-100">
            <div className="pb-4 border-b border-slate-200 w-fit">
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">{t("step5.coauthors")}</span>
            </div>
            <div className="space-y-6">
              {data.coAuthors.length === 0 ? (
                <p className="text-slate-300 italic font-medium">{t("step5.noCoauthors")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {data.coAuthors.map((ca: any, i: number) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-[10px] font-black text-slate-300 pt-1">0{i+1}</span>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase">{ca.firstName} {ca.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{ca.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Abstract Content Overview */}
          <div className="space-y-10 pt-10 border-t border-slate-100">
            <div className="pb-4 border-b border-slate-200 w-fit">
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">{t("step5.contentOverview")}</span>
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-sm items-center text-blue-600/70 uppercase tracking-[2px] font-black mb-2 block">{t("step5.keywords")}</span>
                <p className="text-sm font-bold text-slate-900">{data.abstract.keywords || t("step5.none")}</p>
              </div>
              <div className="space-y-6">
                {['background', 'objective', 'methods', 'results', 'conclusion'].map((section) => (
                  <div key={section} className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <span className="text-sm items-center text-slate-500 uppercase tracking-[2px] font-black mb-2 block">{sectionLabels[section] || section}</span>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.content[section] || t("step5.none")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attached Document */}
          <div className="space-y-10 pt-10 border-t border-slate-100">
            <div className="pb-4 border-b border-slate-200 w-fit">
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">{isEditMode ? t("step5.replacementDocs") : t("step5.attachedDocs")}</span>
            </div>
            {data.files.length > 0 ? (
              <div className="space-y-3">
                {data.files.map((file: File, index: number) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-emerald-950 truncate">
                        {index + 1}. {file.name}
                      </p>
                      <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">
                        {t("step5.pdfDoc")} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-900">{t("step5.noDocs")}</p>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-[2px] mt-1">{t("step5.required")}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper: Input Group
function InputGroup({ label, placeholder, value, onChange, name, type = "text", required = false, error = false }: { label: string, placeholder: string, value: string, onChange: (e: any) => void, name: string, type?: string, required?: boolean, error?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-black text-gold uppercase tracking-[2px]">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-6 py-5 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-200 placeholder:font-black placeholder:uppercase placeholder:tracking-[2px] shadow-sm ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
      />
    </div>
  );
}
