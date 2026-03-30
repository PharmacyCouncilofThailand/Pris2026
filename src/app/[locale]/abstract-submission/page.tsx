/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { abstractCategories } from "@/data/abstractData";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";

export default function AbstractSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const t = useTranslations("abstractSubmission");
  const { user, isAuthenticated } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    author: { firstName: "", lastName: "", email: "", affiliation: "", phone: "" },
    coAuthors: [] as { firstName: string, lastName: string, affiliation: string, email: string }[],
    abstract: { title: "", category: "", type: "", keywords: "" },
    content: { background: "", objectives: "", methods: "", results: "", conclusions: "" },
    files: [] as File[]
  });

  // Autofill user data when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          firstName: user.firstName || prev.author.firstName,
          lastName: user.lastName || prev.author.lastName,
          email: user.email || prev.author.email,
          affiliation: user.affiliation || prev.author.affiliation,
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

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Perform submission logic here.
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-gold selection:text-black overflow-x-hidden">

      
      {/* ─── Modern Research Studio Layout ─── */}
      <section className="pt-32 pb-40">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          {/* Header Info */}
          <div className="mb-16 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-[3px] bg-blue-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-700">PRIS 2026</span>
              <span className="w-12 h-[3px] bg-blue-600 rounded-full" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-slate-950">
              {t("title1")} <br className="hidden md:block" /> {t("title2")}
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed pt-2">
              {t("desc")}
            </p>
          </div>

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
                {currentStep === 1 && <Step1Author data={formData.author} setFormData={setFormData} />}
                {currentStep === 2 && <Step2CoAuthors list={formData.coAuthors} setFormData={setFormData} />}
                {currentStep === 3 && <Step3Details data={formData.abstract} setFormData={setFormData} />}
                {currentStep === 4 && <Step4Content content={formData.content} files={formData.files} setFormData={setFormData} />}
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
                
                <button 
                  onClick={currentStep === 5 ? handleSubmit : handleNext}
                  className="w-full md:w-auto px-16 py-6 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[4px] text-[11px] hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-4 group/next shadow-2xl active:scale-95 ml-auto"
                >
                  {currentStep === 5 ? "Submit Final Abstract" : "Proceed to Next Stage"}
                  <ArrowRight className="w-4 h-4 group-hover/next:translate-x-1 transition-transform" />
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
function Step1Author({ data, setFormData }: { data: any, setFormData: React.Dispatch<React.SetStateAction<any>> }) {
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
        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleChange} placeholder="e.g. John" />
        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleChange} placeholder="e.g. Doe" />
        <div className="md:col-span-2">
          <InputGroup label="Email Address" name="email" value={data.email} onChange={handleChange} placeholder="john.doe@university.edu" type="email" />
        </div>
        <div className="md:col-span-2">
          <InputGroup label="Affiliation / Institution" name="affiliation" value={data.affiliation} onChange={handleChange} placeholder="e.g. Faculty of Pharmacy, Chulalongkorn University" />
        </div>
        <InputGroup label="Phone Number" name="phone" value={data.phone} onChange={handleChange} placeholder="+66 XX XXX XXXX" />
      </div>
    </div>
  );
}

// Sub-component: Step 2
function Step2CoAuthors({ list, setFormData }: { list: any[], setFormData: React.Dispatch<React.SetStateAction<any>> }) {
  const addAuthor = () => {
    setFormData((prev: any) => ({
      ...prev,
      coAuthors: [...prev.coAuthors, { firstName: "", lastName: "", affiliation: "", email: "" }]
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
              className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors p-3 bg-slate-50 rounded-2xl"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label="First Name" name="firstName" value={author.firstName} onChange={(e: any) => handleChange(idx, e)} placeholder="e.g. Jane" />
              <InputGroup label="Last Name" name="lastName" value={author.lastName} onChange={(e: any) => handleChange(idx, e)} placeholder="e.g. Smith" />
              <div className="md:col-span-2">
                <InputGroup label="Institution / Affiliation" name="affiliation" value={author.affiliation} onChange={(e: any) => handleChange(idx, e)} placeholder="Institution name" />
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Email Address (Contact)" name="email" value={author.email} onChange={(e: any) => handleChange(idx, e)} placeholder="jane.smith@example.com" type="email" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-component: Step 3
function Step3Details({ data, setFormData }: { data: any, setFormData: React.Dispatch<React.SetStateAction<any>> }) {
  const locale = useLocale();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      abstract: { ...prev.abstract, [name]: value }
    }));
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Abstract <span className="text-orange-500/80">Details</span></h2>
        <p className="text-slate-500 font-medium text-lg italic">The identity and core focus of your work.</p>
      </div>
      
      <div className="space-y-10">
        <InputGroup label="Complete Abstract Title" name="title" value={data.title} onChange={handleChange} placeholder="ALL CAPS STRONGLY RECOMMENDED" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-gold uppercase tracking-[3px]">Submission Theme</label>
            <select 
              name="category" 
              value={data.category} 
              onChange={handleChange}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer shadow-sm"
            >
              <option value="">{locale === "th" ? "เลือกหัวข้อ" : "Select Category"}</option>
              {abstractCategories.map(cat => <option key={cat.id} value={cat.title}>{locale === "th" && cat.titleTh ? cat.titleTh : cat.title}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-gold uppercase tracking-[3px]">Presentation Mode</label>
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
                      data.type === type ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {typeLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <InputGroup label="Key Terminologies (Semicolon separated)" name="keywords" value={data.keywords} onChange={handleChange} placeholder="e.g. Pharmacy; Clinical; Outcomes" />
      </div>
    </div>
  );
}

// Sub-component: Step 4
function Step4Content({ content, files, setFormData }: { content: any, files: File[], setFormData: React.Dispatch<React.SetStateAction<any>> }) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      content: { ...prev.content, [name]: value }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFormData((prev: any) => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      files: prev.files.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 uppercase font-outfit tracking-tight">Body & <span className="text-orange-500/80">File</span></h2>
        <p className="text-slate-500 font-medium text-lg italic">Structure your abstract and provide the documentation.</p>
      </div>
      
      <div className="space-y-10 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
        {['Background', 'Objectives', 'Methods', 'Results', 'Conclusions'].map(section => (
          <div key={section} className="space-y-4">
            <label className="text-[10px] font-black text-gold uppercase tracking-[3px] block">{section}</label>
            <textarea 
              name={section.toLowerCase()}
              value={content[section.toLowerCase()]}
              onChange={handleTextChange}
              className="w-full px-6 py-6 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 min-h-[120px] resize-none leading-relaxed shadow-sm"
              placeholder={`Elaborate your ${section.toLowerCase()}...`}
            />
          </div>
        ))}
        
        <div className="pt-10 border-t border-white/5">
          <label className="text-[10px] font-black text-gold uppercase tracking-[3px] block mb-6">Full Abstract Document (PDF FORMAT ONLY)</label>
          <div className="relative group">
            <input 
              type="file" 
              accept=".pdf"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            <div className="p-16 border-2 border-dashed rounded-[3rem] text-center transition-all duration-500 bg-white border-slate-200 group-hover:border-gold group-hover:bg-gold/5">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-10 h-10 text-slate-300 group-hover:text-gold" />
                </div>
                <p className="text-sm font-black text-slate-400 mb-2 uppercase tracking-[3px]">Add Documents</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[2px]">PDF Document Only (Max 5MB)</p>
              </div>
            </div>
          </div>
          
          {/* List of Uploaded Files */}
          {files && files.length > 0 && (
            <div className="mt-8 space-y-4">
               {files.map((f: File, idx: number) => (
                 <div key={idx} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-4 overflow-hidden">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                       <CheckCircle className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div className="overflow-hidden">
                       <p className="text-sm font-black text-emerald-950 truncate">{f.name}</p>
                       <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => removeFile(idx)} 
                     className="p-3 bg-white hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </div>
               ))}
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
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">
          Manuscript<br/>
          <span className="text-blue-600/80">Verification</span>
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Phaze 05 / Final Audit Protocol</p>
      </div>
      
      <div className="relative">
        {/* Subtle Architectural Background Lines */}
        <div className="absolute -inset-10 border border-slate-100 rounded-[3rem] pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-50 hidden xl:block" />
        
        <div className="relative z-10 space-y-20">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-slate-100">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-[4px]">Category</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.category || "General Pharmacy"}</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-[4px]">Presentation</span>
              <p className="text-xl font-black text-slate-900 uppercase">{data.abstract.type || "Oral"} Mode</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-[4px]">Reference</span>
              <p className="text-xl font-black text-slate-900 uppercase">PRIS-2026-TMP</p>
            </div>
          </div>

          {/* Research Title Section */}
          <div className="space-y-8">
            <span className="text-[10px] font-black text-blue-600/40 uppercase tracking-[6px] block">Full Research Title</span>
            <h3 className="text-4xl md:text-6xl font-black text-slate-950 leading-[1.1] uppercase tracking-tight">
              &quot;{data.abstract.title || "Untitled Research Submission"}&quot;
            </h3>
          </div>

          {/* Authors Dossier */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
            <div className="space-y-10">
              <div className="pb-4 border-b-2 border-slate-950 w-fit">
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-[4px]">Principal Investigator</span>
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

            <div className="space-y-10">
              <div className="pb-4 border-b border-slate-200 w-fit">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Supporting Contributors</span>
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
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{ca.affiliation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Abstract Content & File Matching Grid Layout */}
          <div className="pt-10 border-t border-slate-100 flex items-stretch">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 w-full">
              {/* Key Terminologies & Content Summary */}
              <div className="space-y-10">
                <div className="pb-4 border-b border-slate-200 w-fit">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Abstract Content Overview</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] items-center text-blue-600/60 uppercase tracking-[3px] font-black mb-2 block">Keywords</span>
                    <p className="text-sm font-bold text-slate-900">{data.abstract.keywords || "None provided"}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {['background', 'objectives', 'methods', 'results', 'conclusions'].map((section) => (
                      <div key={section}>
                        <span className="text-[9px] items-center text-slate-400 uppercase tracking-[3px] font-black mb-1 block">{section}</span>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{data.content[section] || "None provided"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Attached Files Section aligned precisely with Supporting Contributors */}
              <div className="space-y-10 xl:pl-0 border-t xl:border-t-0 border-slate-100 pt-10 xl:pt-0">
                <div className="pb-4 border-b border-slate-200 w-fit">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Attached Document(s)</span>
                </div>
                {data.files && data.files.length > 0 ? (
                  <div className="space-y-4">
                    {data.files.map((f: File, idx: number) => (
                      <div key={idx} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-emerald-950 truncate">{f.name}</p>
                          <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[2px] mt-1">PDF Document</p>
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
                      <p className="text-sm font-black text-rose-900">No Documents</p>
                      <p className="text-[10px] text-rose-600 font-bold uppercase tracking-[2px] mt-1">Required</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper: Input Group
function InputGroup({ label, placeholder, value, onChange, name, type = "text" }: { label: string, placeholder: string, value: string, onChange: (e: any) => void, name: string, type?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-[10px] font-black text-gold uppercase tracking-[3px]">{label}</label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-200 placeholder:font-black placeholder:uppercase placeholder:tracking-[2px] shadow-sm"
      />
    </div>
  );
}
