"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import PageHero from "@/components/sections/PageHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ══════════════════════════════════════
   DATA
   ══════════════════════════════════════ */

const advisors = [
  {
    name: "Preecha Bhandtivej R.PH.",
    nameTh: "ภก.ปรีชา พันธุ์ติเวช",
    position: "President of the Pharmacy Council of Thailand",
    positionTh: "นายกสภาเภสัชกรรม"
  },
];

const orgCommittee = [
  { name: "Prof. Dr. Chonlaphat Sukasem", nameTh: "ศ.ดร.ภก.ชลภัทร สุขเกษม", role: "Chair of the PRIS 2026 Organizing Committee", roleTh: "ประธานคณะกรรมการจัดงาน PRIS 2026" },
  { name: "Dr. Suwit Teerakulchon", nameTh: "ดร.ภก.สุวิทย์ ธีรกุลชน", role: "Advisor", roleTh: "ที่ปรึกษา" },
  { name: "Assoc. Prof. Sunee Lertsinudom", nameTh: "รศ.ภญ.สุณี เลิศสินอุดม", role: "Advisor", roleTh: "ที่ปรึกษา" },
  { name: "Pharm. Teerawit Bamrungsri", nameTh: "ภก.ธีรวิทย์ บำรุงศรี", role: "Committee Member", roleTh: "ผู้ทำงาน" },
  { name: "Pharm. Pornpitak Komsin", nameTh: "ภก.พรพิทักษ์ กอมสิน", role: "Committee Member", roleTh: "ผู้ทำงาน" },
  { name: "Pharm. Chanakit Imbumrung", nameTh: "ภญ.ชนาภิตต์ อิ่มบำรุง", role: "Committee Member", roleTh: "ผู้ทำงาน" },
  { name: "Pharm. Chomkanang Phumsaydon", nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร", role: "Committee Member", roleTh: "ผู้ทำงาน" },
  { name: "Pharm. Apinan Watcharaphichart", nameTh: "ภก.อภินันท์ วัชราภิชาต", role: "Committee Member & Secretary", roleTh: "ผู้ทำงานและเลขานุการ" },
  { name: "R.Ph. Thanaphat Kitcharoen", nameTh: "ภก.ธนพัฒน์ กิจเจริญ", role: "Committee Member & Assistant Secretary", roleTh: "ผู้ทำงานและผู้ช่วยเลขานุการ" },
  { name: "R.Ph. Pongsakon Somdee", nameTh: "ภก.พงศกร สมดี", role: "Committee Member & Assistant Secretary", roleTh: "ผู้ทำงานและผู้ช่วยเลขานุการ" },
];

interface SubMember { name: string; nameTh: string; }
interface SubGroup { title: string; titleTh: string; members: SubMember[] }

const subcommittees: SubGroup[] = [
  {
    title: "College of Pharmacotherapy",
    titleTh: "วิทยาลัยเภสัชบำบัด",
    members: [
      { name: "Dr. Usasiri Srisakul", nameTh: "ดร.ภญ.อุษาศิริ ศรีสกุล" },
      { name: "Dr. Sutee Limcharoen", nameTh: "ดร.ภก.สุธีร์ ลิ้มเจริญ" },
      { name: "Dr. Ploylarp Lertvipapath", nameTh: "ดร.ภญ.พลอยลาภ เลิศวิภาภัทร" },
    ],
  },
  {
    title: "College of Consumer Protection in Pharmacy and Health",
    titleTh: "วิทยาลัยการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
    members: [
      { name: "Assoc. Prof. Dr. Wanna Sriwiriyanupap", nameTh: "รศ.ดร.ภญ.วรรณา ศรีวิริยานุภาพ" },
      { name: "Ph.D. Chidchanok Ruengorn", nameTh: "อ.ดร.ภญ.ชิดชนก เรือนก้อน" },
      { name: "Assist. Prof. Dr. Roungtiva Muenpa", nameTh: "ผศ(พิเศษ)ดร.ภญ.รุ่งทิวา หมื่นปา" },
    ],
  },
  {
    title: "College of Herbal Pharmacy",
    titleTh: "วิทยาลัยเภสัชกรรมสมุนไพร",
    members: [
      { name: "Assoc. Prof. Dr. Prasob-orn Rinthong", nameTh: "รศ.ดร.ภญ.ประสบอร รินทอง" },
      { name: "Dr. Phakakrong Kwankhao", nameTh: "ดร.ภญ.ผกากรอง ขวัญข้าว" },
      { name: "Assistant Professor Dr. Wudtichai Wisuitiprot", nameTh: "ผศ.ดร.ภก.วุฒิชัย วิสุทธิพรต" },
    ],
  },
  {
    title: "College of Industrial Pharmacy",
    titleTh: "วิทยาลัยเภสัชกรรมอุตสาหการ",
    members: [
      { name: "Assoc. Prof. Dr. Somlak Kongmuang", nameTh: "รศ.ดร.ภก.สมลักษณ์ คงเมือง" },
      { name: "Assoc. Prof. Dr. Kwunchit Oungbho", nameTh: "รศ.ดร.ภญ.ขวัญจิต อึ๊งโพธิ์" },
      { name: "Assist. Prof. Dr. Narueporn Sutanthavibul", nameTh: "ผศ.ดร.ภญ.นฤพร สุตัณฑวิบูลย์" },
    ],
  },
  {
    title: "College of Community Pharmacy",
    titleTh: "วิทยาลัยเภสัชกรรมชุมชน",
    members: [
      { name: "Assist. Prof. Dr. Surasit Lochid-amnuay", nameTh: "ผศ.ดร.ภก.สุรสิทธิ์ ล้อจิตรอำนวย" },
      { name: "Chaiwat Limprasert", nameTh: "ภก.ชัยวัฒน์ ลิ้มประเสริฐ" },
      { name: "Associate Professor Wannakon Chuemongkon", nameTh: "รศ.ภญ.วรรณคล เชื้อมงคล" },
    ],
  },
  {
    title: "College of Pharmacy Administration",
    titleTh: "วิทยาลัยการบริหารเภสัชกิจ",
    members: [
      { name: "Associate Professor Korn Sornlertlumvanich", nameTh: "รศ.ดร.ภก.กร ศรล้ำเลิศวาณิช" },
      { name: "Assoc Prof Nusaraporn Kessomboon, PhD", nameTh: "รศ.ดร.ภญ.นุศราพร เกษสมบูรณ์" },
      { name: "Assoc Prof Hathaikan Chowwanapoonpohn, PhD", nameTh: "รศ.ดร.ภญ.หทัยกาญจน์ เชาวนพูนผล" },
    ],
  },
  {
    title: "College of Pharmacogenomics and Precision Medicine",
    titleTh: "วิทยาลัยเภสัชพันธุศาสตร์และการแพทย์แม่นยํา",
    members: [
      { name: "Assoc. Prof. Dr. Nontaya Nakkam", nameTh: "รศ.ดร.ภญ.นนทญา นาคคำ" },
      { name: "Assist. Prof. Dr. Teerapat Majam", nameTh: "ผศ.ดร.ภก.ธีรภัทร์ มาแจ่ม" },
      { name: "Assist. Prof. Dr. Varalee Yodsurang", nameTh: "ผศ.ดร.ภญ.วราลี ยอดสุรางค์" },
    ],
  },
  {
    title: "Digital Pharmacy",
    titleTh: "สาขาเภสัชกรรมดิจิทัล",
    members: [
      { name: "Dr. Samart Jamrat", nameTh: "อ.ดร.ภก.สามารถ จำรัส" },
      { name: "Isara Kaewkhum", nameTh: "ภก.อิศรา แก้วคำ" },
      { name: "Sakda Tianpaisan", nameTh: "ภก.ศักดา เธียรไพศาล" },
    ],
  },
];

/* ══════════════════════════════════════
   COLLAPSIBLE SUB-COMMITTEE CARD
   ══════════════════════════════════════ */

function SubcommitteeCard({ group, index, locale }: { group: SubGroup; index: number; locale: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sub-card border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left group cursor-pointer"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-gray-300 font-heading text-sm font-bold tabular-nums w-6">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-gray-700 font-medium text-sm md:text-base group-hover:text-gray-900 transition-colors duration-300">
            {locale === 'th' ? group.titleTh : group.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">{group.members.length}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="pl-10 space-y-0">
            {group.members.map((m, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-6 py-2.5 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-700 text-sm flex-shrink-0 md:w-full">{locale === 'th' ? m.nameTh : m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROLE ─ inline pill styling
   ══════════════════════════════════════ */

function rolePill(role: string) {
  return "text-gray-500";
}

/* ══════════════════════════════════════
   PAGE
   ══════════════════════════════════════ */

export default function AboutPrisPage() {
  const pageRef = useRef<HTMLElement>(null!);
  const t = useTranslations("about");
  const locale = useLocale();

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // ─── Hero entrance ───

    // ─── "What is PRIS" reveal on scroll ───
    gsap.fromTo(
      ".about-desc",
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: "power3.out", force3D: true,
        scrollTrigger: { trigger: ".about-desc", start: "top 80%" },
      }
    );

    // ─── Committee cards fade-in ───
    const cards = gsap.utils.toArray(".committee-block") as HTMLElement[];
    cards.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", force3D: true,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    // ─── Stagger rows ───
    const rows = gsap.utils.toArray(".org-row") as HTMLElement[];
    gsap.fromTo(rows,
      { opacity: 0, y: 15 },
      {
        opacity: 1, y: 0, stagger: 0.03, duration: 0.5, ease: "power2.out", force3D: true,
        scrollTrigger: { trigger: ".org-table", start: "top 85%" },
      }
    );

  }, { scope: pageRef });

  return (
    <main
      ref={pageRef}
      className="bg-white text-gray-900 overflow-hidden selection:bg-orange-500/20 min-h-screen"
    >

      {/* ══════ HERO ══════ */}
      <PageHero
        title1="About"
        title2="PRIS 2026"
        subtitle="Pharmacy Research and Innovation Summit"
      />

      {/* ══════ WHAT IS PRIS ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-4xl mx-auto about-desc will-change-transform transform-gpu">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-gray-900 pr-[0.15em]">{t("whatIsTitle")}</h2>
          <p
            className="text-gray-500 text-base md:text-lg leading-[1.8] font-light"
            dangerouslySetInnerHTML={{ __html: t.raw("whatIsDesc") }}
          />
        </div>
      </section>

      {/* ══════ COMMITTEE ══════ */}
      <section className="relative px-6 md:px-12 pb-32 md:pb-44">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <div className="committee-block mb-20 md:mb-28">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{t("orgTeam")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("committee")}
            </h2>
          </div>

          {/* ── Advisors ── */}
          <div className="committee-block mb-20">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">{t("advisors")}</h3>
            <div className="border-t border-gray-200">
              {advisors.map((a, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 py-5 border-b border-gray-200">
                  <span className="text-gray-900 font-medium text-lg md:w-[60%]">{locale === 'th' ? a.nameTh : a.name}</span>
                  <span className="text-gray-400 text-sm">{locale === 'th' ? a.positionTh : a.position}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Organizing Committee ── */}
          <div className="committee-block org-table mb-24">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">
              {t("orgCommittee")}
            </h3>
            <div className="border-t border-gray-200">
              {orgCommittee.map((m, i) => (
                <div
                  key={i}
                  className="org-row flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 py-4 border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                >
                  <span className="text-gray-800 text-sm md:text-base md:w-[60%]">{locale === 'th' ? m.nameTh : m.name}</span>
                  <span className={`text-sm ${rolePill(m.role)}`}>{locale === 'th' ? m.roleTh : m.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Subcommittees (Accordion) ── */}
          <div className="committee-block">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">
              {t("subcommittees")}
            </h3>
            <div className="border-t border-gray-200">
              {subcommittees.map((group, idx) => (
                <SubcommitteeCard key={idx} group={group} index={idx} locale={locale} />
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
