"use client";

import { useLocale } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import PageHero from "@/components/sections/PageHero";

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
          eyebrow: "ช่องทางการติดต่อ",
          title1: "ติดต่อ",
          title2: "พวกเรา",
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
          eyebrow: "Get in Touch",
          title1: "CONTACT",
          title2: "US",
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

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden w-full relative"
    >
      <PageHero
        title1={copy.title1}
        title2={copy.title2}
        subtitle={copy.desc}
        inlineTitle={locale === "en"}
      />

      <section className="relative px-6 pb-20 md:pb-32 overflow-hidden flex flex-col items-center">

        {/* ══════ EXPERIMENTAL FORM SECTION ══════ */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-16 md:mt-24 mb-10 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
            
            {/* Left: Huge typography & Info */}
            <div className="flex flex-col gap-6 md:sticky top-32 h-fit">
              <div className="pt-2 flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.emailLabel}</h4>
                  <a href={`mailto:${copy.emailValue}`} className="text-base font-medium text-slate-900 hover:text-blue-600 transition-colors break-all">
                    {copy.emailValue}
                  </a>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.phoneLabel}</h4>
                  <p className="text-base font-medium text-slate-900">{copy.phoneValue}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{copy.addressLabel}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-line max-w-xs break-words">
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
