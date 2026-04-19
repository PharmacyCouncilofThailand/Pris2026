"use client";

import { useLocale } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";

type PageCopy = {
  eyebrow: string;
  title1: string;
  title2: string;
  desc: string;
  emailLabel: string;
  emailValue: string;
  emailDesc: string;
  phoneLabel: string;
  phoneValue: string;
  phoneDesc: string;
  addressLabel: string;
  addressValue: string;
  formTitle1: string;
  formTitle2: string;
  formDesc: string;
  formFirstName: string;
  formLastName: string;
  formEmail: string;
  formSubject: string;
  formMessage: string;
  formSubmit: string;
};

export default function ContactPage() {
  const locale = useLocale();
  const pageRef = useRef<HTMLDivElement>(null!);

  const copy: PageCopy =
    locale === "th"
      ? {
          eyebrow: "การติดต่อ",
          title1: "Get in",
          title2: "Touch",
          desc: "มีข้อสงสัยเกี่ยวกับการลงทะเบียน การส่งผลงาน หรือการสนับสนุน? ติดต่อทีมงาน PRIS 2026 ได้ตามช่องทางด้านล่าง",
          emailLabel: "อีเมล",
          emailValue: "pharthai@pharmacycouncil.org",
          emailDesc: "สำหรับข้อซักถามทั่วไป การส่งบทคัดย่อ และการสนับสนุน",
          phoneLabel: "โทรศัพท์",
          phoneValue: "02-590-2625",
          phoneDesc: "เวลาทำการ: จันทร์ - ศุกร์, 08:30 - 16:30 น.",
          addressLabel: "ที่อยู่สำนักงาน",
          addressValue: "สำนักงานเลขาธิการสภาเภสัชกรรม\nอาคารมหิตลาธิเบศร ชั้น 8\nกระทรวงสาธารณสุข ซอย 4\nถนนติวานนท์ อำเภอเมือง จังหวัดนนทบุรี 11000",
          formTitle1: "ส่ง",
          formTitle2: "ข้อความ.",
          formDesc: "กรอกข้อมูลด้านล่าง แล้วทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง",
          formFirstName: "ชื่อ",
          formLastName: "นามสกุล",
          formEmail: "อีเมล",
          formSubject: "หัวข้อข้อความ",
          formMessage: "รายละเอียดข้อความ",
          formSubmit: "ส่งข้อความ",
        }
      : {
          eyebrow: "Contact Us",
          title1: "Get in",
          title2: "Touch",
          desc: "Have a question about registration, abstract submission, or sponsorship? Reach out to the PRIS 2026 organizing team.",
          emailLabel: "Email Us",
          emailValue: "pharthai@pharmacycouncil.org",
          emailDesc: "For general inquiries, abstract submissions, and sponsorship details.",
          phoneLabel: "Call Us",
          phoneValue: "02-590-2625",
          phoneDesc: "Mon-Fri, 08:30 AM - 04:30 PM (ICT)",
          addressLabel: "Office Address",
          addressValue: "The Pharmacy Council of Thailand\nMahitalathibet Building, 8th Floor\nMinistry of Public Health, 88/19 Moo 4\nTiwanon Road, Talat Khwan\nMueang Nonthaburi, Nonthaburi 11000",
          formTitle1: "Send",
          formTitle2: "Inquiry.",
          formDesc: "Fill out the details below, and our organizing team will get back to you within 24 hours.",
          formFirstName: "First Name",
          formLastName: "Last Name",
          formEmail: "Email Address",
          formSubject: "Subject",
          formMessage: "Your Message",
          formSubmit: "Submit Form",
        };

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
      gsap.from(".hero-line", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.6,
        ease: "power4.out",
        delay: 0.15,
      });
      gsap.from(".hero-sub", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
      });
  }, { scope: pageRef });

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
    >
      <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center">
        {/* Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.05] rounded-full blur-[120px] pointer-events-none md:w-[800px] md:h-[800px] md:blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px] pointer-events-none md:w-[600px] md:h-[600px] md:blur-[150px]" />

        <div className="max-w-4xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="hero-sub flex items-center justify-center gap-3 mb-6 md:mb-8 md:gap-4">
            <span className="h-px w-8 bg-orange-500 md:w-12" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-orange-500 md:text-xs">PRIS 2026</span>
            <span className="text-gray-400 text-[10px] tracking-widest uppercase md:text-xs">— {copy.eyebrow}</span>
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tighter leading-tight text-slate-900 sm:text-7xl md:text-8xl lg:text-[7rem]">
            <div className="overflow-hidden py-2 -my-2">
              <span className="block hero-line text-black">{copy.title1}</span>
            </div>
            <div className="overflow-hidden py-2 -my-2 flex flex-col items-center">
              <span className="block hero-line text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 pb-2">
                {copy.title2}
              </span>
            </div>
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-sm text-slate-500 font-light leading-relaxed md:mt-10 md:text-lg">
            {copy.desc}
          </p>
        </div>

        {/* ══════ EXPERIMENTAL FORM SECTION ══════ */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-16 md:mt-24 mb-10 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
            
            {/* Left: Huge typography & Info */}
            <div className="flex flex-col gap-6 md:sticky top-32 h-fit">
              <div className="pt-2 flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.emailLabel}</h4>
                  <a href={`mailto:${copy.emailValue}`} className="text-base font-medium text-slate-900 hover:text-blue-600 transition-colors">
                    {copy.emailValue}
                  </a>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.phoneLabel}</h4>
                  <p className="text-base font-medium text-slate-900">{copy.phoneValue}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.addressLabel}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-line max-w-xs">
                    {copy.addressValue}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Standard Unified Form Fields */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="firstName" className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] ml-1">{copy.formFirstName}</label>
                    <input type="text" id="firstName" required className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-normal text-slate-900 placeholder:text-slate-300" placeholder="e.g. John" />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <label htmlFor="lastName" className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] ml-1">{copy.formLastName}</label>
                    <input type="text" id="lastName" required className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-normal text-slate-900 placeholder:text-slate-300" placeholder="e.g. Doe" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="email" className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] ml-1">{copy.formEmail}</label>
                  <input type="email" id="email" required className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-normal text-slate-900 placeholder:text-slate-300" placeholder="you@example.com" />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="subject" className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] ml-1">{copy.formSubject}</label>
                  <input type="text" id="subject" required className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-normal text-slate-900 placeholder:text-slate-300" placeholder="How can we help?" />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="message" className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] ml-1">{copy.formMessage}</label>
                  <textarea id="message" required rows={4} className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-normal text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed" placeholder="..." />
                </div>

                <div className="pt-4 mt-2">
                  <button type="submit" className="group relative inline-flex items-center justify-between gap-8 bg-blue-600 text-white px-8 py-4 rounded-2xl overflow-hidden hover:bg-blue-700 hover:shadow-lg transition-all duration-300 w-full md:w-auto font-medium shadow-md shadow-blue-600/20">
                    <span className="relative z-10 text-xs font-bold uppercase tracking-[0.15em]">{copy.formSubmit}</span>
                    <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <ArrowUpRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}
