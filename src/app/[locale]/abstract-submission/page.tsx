/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import PageHero from "@/components/sections/PageHero";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE || "";

interface CategoryOption {
  id: number;
  name: string;
}

export default function AbstractSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const t = useTranslations("abstractSubmission");
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();
  
  // Login guard — redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/abstract-submission");
    }
  }, [isAuthenticated, router]);

  // Fetch categories from API
  useEffect(() => {
    if (EVENT_CODE) {
      fetch(`${API_URL}/api/events/${EVENT_CODE}/abstract-categories`)
        .then(res => res.json())
        .then(data => {
          if (data.categories) setCategories(data.categories);
        })
        .catch(() => { /* silently fail, categories will be empty */ });
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    author: { firstName: "", lastName: "", email: "", affiliation: "", phone: "" },
    coAuthors: [] as { firstName: string, lastName: string, institution: string, email: string }[],
    abstract: { title: "", category: "", type: "", keywords: "" },
    content: { background: "", objective: "", methods: "", results: "", conclusion: "" },
    file: null as File | null
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

  // Don't render form until authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </main>
    );
  }

  const handleNext = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Step 1: Presenting Author — mirror API: firstName/lastName/email/affiliation required (min 1), email valid
    if (currentStep === 1) {
      const { firstName, lastName, email, affiliation } = formData.author;
      const missing: string[] = [];
      if (!firstName.trim()) missing.push('First Name');
      if (!lastName.trim()) missing.push('Last Name');
      if (!email.trim()) missing.push('Email');
      else if (!emailRe.test(email.trim())) missing.push('Valid Email');
      if (!affiliation.trim()) missing.push('Affiliation');
      if (missing.length > 0) {
        setShowErrors(true);
        toast.error(`Please complete: ${missing.join(', ')}`);
        return;
      }
    }

    // Step 2: Co-Authors are optional, but if added each must be complete (API requires firstName/lastName/email/institution)
    if (currentStep === 2) {
      for (let i = 0; i < formData.coAuthors.length; i++) {
        const ca = formData.coAuthors[i];
        const missing: string[] = [];
        if (!ca.firstName.trim()) missing.push('First Name');
        if (!ca.lastName.trim()) missing.push('Last Name');
        if (!ca.email.trim()) missing.push('Email');
        else if (!emailRe.test(ca.email.trim())) missing.push('Valid Email');
        if (!ca.institution.trim()) missing.push('Institution');
        if (missing.length > 0) {
          setShowErrors(true);
          toast.error(`Co-Author #${i + 1}: ${missing.join(', ')}`);
          return;
        }
      }
    }

    // Step 3: title min 10 / max 500, category, presentationType, keywords required
    if (currentStep === 3) {
      const { title, category, type, keywords } = formData.abstract;
      const missing: string[] = [];
      if (!title.trim()) missing.push('Title');
      else if (title.trim().length < 10) missing.push('Title (min 10 chars)');
      else if (title.trim().length > 500) missing.push('Title (max 500 chars)');
      if (!category.trim()) missing.push('Submission Theme');
      if (!type.trim()) missing.push('Presentation Mode');
      if (!keywords.trim()) missing.push('Keywords');
      if (missing.length > 0) {
        setShowErrors(true);
        toast.error(`Please fix: ${missing.join(', ')}`);
        return;
      }
    }

    // Step 4: per-section min character count (matches API: background/methods/results/conclusion ≥ 50, objective ≥ 20) + total words ≤ 300
    if (currentStep === 4) {
      const minChars: Record<string, number> = {
        background: 50,
        objective: 20,
        methods: 50,
        results: 50,
        conclusion: 50,
      };
      const issues: string[] = [];
      for (const [k, min] of Object.entries(minChars)) {
        const v = ((formData.content as any)[k] || '').trim();
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        if (!v) issues.push(label);
        else if (v.length < min) issues.push(`${label} (min ${min} chars, currently ${v.length})`);
      }
      if (issues.length > 0) {
        setShowErrors(true);
        toast.error(`Please fix: ${issues.join(', ')}`);
        return;
      }
      const totalText = Object.keys(minChars).map(k => (formData.content as any)[k] || '').join(' ');
      const totalWords = totalText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      if (totalWords > 300) {
        toast.error(`Total word count (${totalWords}) exceeds the 300-word limit.`);
        return;
      }
      // File required (matches API: 'Abstract file (PDF) is required')
      if (!formData.file) {
        setShowErrors(true);
        toast.error('Please attach the abstract PDF file before continuing.');
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
    if (!formData.file) {
      setSubmitError('Abstract PDF file is required.');
      toast.error('Please attach the abstract PDF file.');
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
      if (formData.file) {
        fd.append("abstractFile", formData.file);
      }

      const res = await fetch(`${API_URL}/api/abstracts/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Submission failed. Please try again.");
        return;
      }

      setTrackingId(data.abstract?.trackingId || "");
      setIsSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
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


          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-16">
            <div className="flex gap-4 items-start justify-center text-left max-w-3xl mx-auto">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Important Note</h4>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                  Please double-check all author affiliations and the abstract structure before final submission.
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
                      Stage 0{step.id}
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
                {currentStep === 3 && <Step3Details data={formData.abstract} setFormData={setFormData} categories={categories} showErrors={showErrors} />}
                {currentStep === 4 && <Step4Content content={formData.content} file={formData.file} setFormData={setFormData} showErrors={showErrors} />}
                {currentStep === 5 && <Step5Review data={formData} />}
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
                      Previous Phase
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
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-16 py-6 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[4px] text-[11px] hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-4 group/next shadow-2xl active:scale-95 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : currentStep === 5 ? "Submit Final Abstract" : "Proceed to Next Stage"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover/next:translate-x-1 transition-transform" />}
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
              Submission Complete
            </h2>
            {trackingId && (
              <div className="bg-slate-50 rounded-2xl px-6 py-4 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1">Tracking ID</p>
                <p className="text-2xl font-black text-slate-900">{trackingId}</p>
              </div>
            )}
            <p className="text-lg text-slate-500 font-medium mb-3">
              ส่ง Abstract เสร็จสิ้นแล้ว<br/>รอรับการอนุมัติผ่านทาง Email
            </p>
            <p className="text-xs font-bold text-slate-400 mb-10 px-6 uppercase tracking-widest">
              Please wait for approval via Email.
            </p>
            <Link 
              href="/"
              onClick={() => setIsSubmitted(false)}
              className="px-10 py-5 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[4px] text-[10px] sm:text-[11px] hover:bg-gold hover:text-black shadow-lg transition-all block w-full sm:w-auto"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// Sub-component: Step 1
function Step1Author({ data, setFormData, showErrors }: { data: any, setFormData: React.Dispatch<React.SetStateAction<any>>, showErrors: boolean }) {
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
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Presenting <span className="text-orange-500/80">Author</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">The primary voice of your research.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleChange} placeholder="e.g. John" required error={showErrors && !data.firstName.trim()} />
        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleChange} placeholder="e.g. Doe" required error={showErrors && !data.lastName.trim()} />
        <div className="md:col-span-2">
          <InputGroup label="Email Address" name="email" value={data.email} onChange={handleChange} placeholder="john.doe@university.edu" type="email" required error={showErrors && (!data.email.trim() || !emailRe.test(data.email.trim()))} />
        </div>
        <div className="md:col-span-2">
          <InputGroup label="Affiliation / Institution" name="affiliation" value={data.affiliation} onChange={handleChange} placeholder="e.g. Faculty of Pharmacy, Chulalongkorn University" required error={showErrors && !data.affiliation.trim()} />
        </div>
        <InputGroup label="Phone Number" name="phone" value={data.phone} onChange={handleChange} placeholder="+66 XX XXX XXXX" />
      </div>
    </div>
  );
}

// Sub-component: Step 2
function Step2CoAuthors({ list, setFormData, showErrors }: { list: any[], setFormData: React.Dispatch<React.SetStateAction<any>>, showErrors: boolean }) {
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
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Co-<span className="text-orange-500/80">Authors</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">Include all contributors who made this possible.</p>
        </div>
        <button 
          onClick={addAuthor}
          className="px-8 py-4 bg-slate-950 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-[3px] shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Co-Author
        </button>
      </div>

      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        {list.length === 0 && (
          <div className="p-16 border-2 border-dashed border-blue-100 rounded-[3rem] text-center bg-blue-50/30">
            <div className="w-20 h-20 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-blue-900/40 font-black uppercase tracking-[3px] text-xs">No co-authors added yet. (Optional)</p>
          </div>
        )}
        {list.map((author: any, idx: number) => (
          <div key={idx} className="p-10 bg-white shadow-sm rounded-[3rem] border border-slate-100 relative group hover:border-orange-500/30 transition-all duration-500">
            <button 
              onClick={() => removeAuthor(idx)}
              className="absolute top-8 right-8 text-rose-400 hover:text-rose-600 transition-colors p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl"
              aria-label="Remove co-author"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label="First Name" name="firstName" value={author.firstName} onChange={(e: any) => handleChange(idx, e)} placeholder="e.g. Jane" required error={showErrors && !author.firstName.trim()} />
              <InputGroup label="Last Name" name="lastName" value={author.lastName} onChange={(e: any) => handleChange(idx, e)} placeholder="e.g. Smith" required error={showErrors && !author.lastName.trim()} />
              <div className="md:col-span-2">
                <InputGroup label="Institution / Affiliation" name="institution" value={author.institution} onChange={(e: any) => handleChange(idx, e)} placeholder="Institution name" required error={showErrors && !author.institution.trim()} />
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Email Address (Contact)" name="email" value={author.email} onChange={(e: any) => handleChange(idx, e)} placeholder="jane.smith@example.com" type="email" required error={showErrors && (!author.email.trim() || !emailRe.test(author.email.trim()))} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-component: Step 3
function Step3Details({ data, setFormData, categories, showErrors }: { data: any, setFormData: React.Dispatch<React.SetStateAction<any>>, categories: CategoryOption[], showErrors: boolean }) {
  const locale = useLocale();
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

  const selectCategory = (name: string) => {
    setFormData((prev: any) => ({
      ...prev,
      abstract: { ...prev.abstract, category: name }
    }));
    setIsCategoryOpen(false);
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Abstract <span className="text-orange-500/80">Details</span></h2>
        <p className="text-slate-500 font-medium text-lg italic">The identity and core focus of your work.</p>
        <p className="text-xs font-bold text-slate-400 mt-2"><span className="text-rose-500">*</span> indicates a required field</p>
      </div>
      
      <div className="space-y-10">
        <InputGroup label="Complete Abstract Title" name="title" value={data.title} onChange={handleChange} placeholder="ALL CAPS STRONGLY RECOMMENDED" required error={showErrors && (data.title.trim().length < 10 || data.title.trim().length > 500)} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-black text-gold uppercase tracking-[2px]">Submission Theme <span className="text-rose-500">*</span></label>
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full text-left px-6 py-5 bg-white border rounded-2xl text-sm font-bold outline-none transition-all flex items-center justify-between shadow-sm ${
                  isCategoryOpen ? "border-blue-500 ring-2 ring-blue-500/20" : showErrors && !data.category ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
                } ${data.category ? "text-slate-900" : "text-slate-400"}`}
              >
                <span>{data.category || (locale === "th" ? "เลือกหัวข้อ" : "Select Category")}</span>
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
                      onClick={() => selectCategory(cat.name)}
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
            <label className="text-sm font-black text-gold uppercase tracking-[2px]">Presentation Mode <span className="text-rose-500">*</span></label>
            <div className="flex gap-3">
              {['Oral', 'Poster'].map(type => {
                let typeLabel = type;
                if (locale === "th") {
                  if (type === "Oral") typeLabel = "ปากเปล่า";
                  if (type === "Poster") typeLabel = "โปสเตอร์";
                }
                return (
                  <button 
                    key={type}
                    onClick={() => handleChange({ target: { name: 'type', value: type } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                    className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[3px] transition-all ${
                      data.type === type ? "bg-blue-600 text-white border-blue-600 shadow-md" : showErrors && !data.type ? "bg-white text-slate-400 border-rose-400 ring-2 ring-rose-100" : "bg-white text-slate-400 border-slate-200 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {typeLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <InputGroup label="Key Terminologies (Semicolon separated)" name="keywords" value={data.keywords} onChange={handleChange} placeholder="e.g. Pharmacy; Clinical; Outcomes" required error={showErrors && !data.keywords.trim()} />
      </div>
    </div>
  );
}

// Sub-component: Step 4
function Step4Content({ content, file, setFormData, showErrors }: { content: any, file: File | null, setFormData: React.Dispatch<React.SetStateAction<any>>, showErrors: boolean }) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      content: { ...prev.content, [name]: value }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFormData((prev: any) => ({ ...prev, file: selected }));
  };

  const removeFile = () => {
    setFormData((prev: any) => ({ ...prev, file: null }));
  };

  // Word count helper
  const countWords = (text: string) => text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

  // Per-section word counts
  const sectionWordCounts: Record<string, number> = {};
  ['background', 'objective', 'methods', 'results', 'conclusion'].forEach(k => {
    sectionWordCounts[k] = countWords(content[k] || '');
  });

  // Total word count across all sections
  const totalWords = Object.values(sectionWordCounts).reduce((a, b) => a + b, 0);
  const wordPercent = Math.min((totalWords / 300) * 100, 100);

  const sections = [
    { key: 'background', label: 'Background' },
    { key: 'objective', label: 'Objective' },
    { key: 'methods', label: 'Methods' },
    { key: 'results', label: 'Results' },
    { key: 'conclusion', label: 'Conclusion' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Body & <span className="text-orange-500/80">File</span></h2>
          <p className="text-slate-500 font-medium text-lg italic">Structure your abstract and provide the documentation.</p>
          <p className="text-xs font-bold text-slate-400 mt-2"><span className="text-rose-500">*</span> indicates a required field</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-5 py-3 rounded-2xl text-sm font-black ${totalWords > 300 ? 'bg-rose-50 text-rose-600' : totalWords >= 250 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
            {totalWords} / 300 words
          </div>
          <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${totalWords > 300 ? 'bg-rose-500' : totalWords >= 250 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${wordPercent}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-10 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
        {sections.map(section => {
          const minChars = section.key === 'objective' ? 20 : 50;
          const currentText = (content[section.key] || '').trim();
          const hasError = showErrors && currentText.length < minChars;
          return (
          <div key={section.key} className="space-y-4">
            <label className="text-sm font-black text-gold uppercase tracking-[2px] block">{section.label} <span className="text-rose-500">*</span> <span className="text-[10px] text-slate-400 font-bold normal-case tracking-normal">(min {minChars} chars)</span></label>
            <textarea 
              name={section.key}
              value={content[section.key]}
              onChange={handleTextChange}
              className={`w-full px-6 py-6 bg-white border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 min-h-[120px] resize-none leading-relaxed shadow-sm ${hasError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              placeholder={`Elaborate your ${section.label.toLowerCase()}...`}
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold tracking-wide ${hasError ? 'text-rose-500' : 'text-slate-500'}`}>
                {currentText.length} / {minChars} chars
              </span>
              <span className="text-xs font-bold text-slate-500 tracking-wide">
                {sectionWordCounts[section.key]} {sectionWordCounts[section.key] === 1 ? 'word' : 'words'}
              </span>
            </div>
          </div>
          );
        })}
        
        <div className="pt-10 border-t border-white/5">
          <label className="text-sm font-black text-gold uppercase tracking-[2px] block mb-6">Full Abstract Document (PDF FORMAT ONLY)</label>
          {!file ? (
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className="p-16 border-2 border-dashed rounded-[3rem] text-center transition-all duration-500 bg-white border-slate-200 group-hover:border-gold group-hover:bg-gold/5">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-10 h-10 text-slate-300 group-hover:text-gold" />
                  </div>
                  <p className="text-sm font-black text-slate-400 mb-2 uppercase tracking-[3px]">Upload Document</p>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[2px]">PDF Document Only (Max 30MB)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-emerald-950 truncate">{file.name}</p>
                  <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={removeFile} 
                className="p-3 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-400 hover:text-rose-600 transition-colors shadow-sm"
                aria-label="Remove file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component: Step 5
function Step5Review({ data }: { data: any }) {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-950 uppercase tracking-tight leading-tight">
          Manuscript <span className="text-blue-600/80">Verification</span>
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[11px]">Phase 05 / Final Audit Protocol</p>
      </div>
      
      <div className="relative">
        {/* Subtle Architectural Background Lines */}
        <div className="absolute -inset-10 border border-slate-100 rounded-[3rem] pointer-events-none" />
        
        <div className="relative z-10 space-y-20">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-slate-100">
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">Category</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.category || "General Pharmacy"}</p>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">Presentation</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.type || "Oral"} Mode</p>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-black text-orange-500/70 uppercase tracking-[2px]">Reference</span>
              <p className="text-xl font-black text-slate-900 uppercase">PRIS-2026-TMP</p>
            </div>
          </div>

          {/* Research Title Section */}
          <div className="space-y-8">
            <span className="text-sm font-black text-blue-600/60 uppercase tracking-[3px] block">Full Research Title</span>
            <h3 className="text-4xl md:text-6xl font-black text-slate-950 leading-[1.1] uppercase tracking-tight">
              &quot;{data.abstract.title || "Untitled Research Submission"}&quot;
            </h3>
          </div>

          {/* Authors Dossier — Principal */}
          <div className="space-y-10">
            <div className="pb-4 border-b-2 border-slate-950 w-fit">
              <span className="text-sm font-black text-slate-950 uppercase tracking-[2px]">Author</span>
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
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">Supporting Contributors</span>
            </div>
            <div className="space-y-6">
              {data.coAuthors.length === 0 ? (
                <p className="text-slate-300 italic font-medium">No additional authors identified.</p>
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
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">Abstract Content Overview</span>
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-sm items-center text-blue-600/70 uppercase tracking-[2px] font-black mb-2 block">Keywords</span>
                <p className="text-sm font-bold text-slate-900">{data.abstract.keywords || "None provided"}</p>
              </div>
              <div className="space-y-6">
                {['background', 'objective', 'methods', 'results', 'conclusion'].map((section) => (
                  <div key={section} className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <span className="text-sm items-center text-slate-500 uppercase tracking-[2px] font-black mb-2 block">{section}</span>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.content[section] || "None provided"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attached Document */}
          <div className="space-y-10 pt-10 border-t border-slate-100">
            <div className="pb-4 border-b border-slate-200 w-fit">
              <span className="text-sm font-black text-slate-500 uppercase tracking-[2px]">Attached Document(s)</span>
            </div>
            {data.file ? (
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-emerald-950 truncate">{data.file.name}</p>
                  <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">PDF Document</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-900">No Documents</p>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-[2px] mt-1">Required</p>
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
