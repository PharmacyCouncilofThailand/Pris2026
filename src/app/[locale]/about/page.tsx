"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ══════════════════════════════════════
   DATA
   ══════════════════════════════════════ */

const advisors = [
  { name: "Mr. Preecha Bhandtivej", position: "President of the Pharmacy Council of Thailand" },
];

const orgCommittee = [
  { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", role: "Chairman" },
  { name: "Asst. Prof. Dr. Chotirat Nakaranurack", role: "Vice Chairman" },
  { name: "Dr. Noppadon Atjimathira", role: "Vice Chairman" },
  { name: "Assoc. Prof. Sunee Lertsinudom", role: "Vice Chairman" },
  { name: "Miss Chanakit Imbumrung", role: "Vice Chairman" },
  { name: "Miss Chomchanok Pumsaydon", role: "Vice Chairman" },
  { name: "Mr. Aphinan Watcharaphichart", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Preecha Montakantikul", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Weerachai Chaijamorn", role: "Vice Chairman" },
  { name: "Dr. Suvit Teerakulchon", role: "Vice Chairman" },
  { name: "Mr. Komsan Sotangkur", role: "Vice Chairman" },
  { name: "Ms. Penthipha Kaewketthong", role: "Vice Chairman" },
  { name: "Prof. Dr. Pornsak Sriamornsak", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Wanna Sriwiriyanupap", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Narisa Kamkaen", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Satit Puttipipatkhachorn", role: "Vice Chairman" },
  { name: "Asst. Prof. Dr. Surasit Lochid-amnuay", role: "Vice Chairman" },
  { name: "Assoc. Prof. Dr. Korn Sornlertlamvanich", role: "Vice Chairman" },
  { name: "Prof. Dr. Chonlaphat Sukasem", role: "Vice Chairman" },
  { name: "Asst. Prof. Dr. Thanompong Sathienluckana", role: "Vice Chairman" },
  { name: "Asst. Prof. Dr. Weerayuth Saelim", role: "Secretary" },
  { name: "Mr. Jesada Chantharaprasert", role: "Assistant Secretary" },
  { name: "Acting Sub Lt. Piyawat Jarusit", role: "Assistant Secretary" },
  { name: "Miss Pinchaya Toprayoon", role: "Assistant Secretary" },
  { name: "Mr. Chanayus Jittamornchai", role: "Assistant Secretary" },
  { name: "Mr. Thanaphat Kitcharoen", role: "Assistant Secretary" },
  { name: "Miss Sirarat Rattanachai", role: "Assistant Secretary" },
];

interface SubMember { name: string; affiliation: string }
interface SubGroup { title: string; members: SubMember[] }

const subcommittees: SubGroup[] = [
  {
    title: "Academic Conference Organizing",
    members: [
      { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Asst. Prof. Dr. Thanompong Sathienluckana", affiliation: "Faculty of Pharmacy, Siam University" },
      { name: "Asst. Prof. Dr. Chotirat Nakaranurack", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Assoc. Prof. Dr. Weerachai Chaijamorn", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Assoc. Prof. Dr. Preecha Montakantikul", affiliation: "Faculty of Pharmacy, Mahidol University" },
      { name: "Asst. Prof. Dr. Orawan Sae-Lim", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University" },
      { name: "Asst. Prof. Dr. Yotsaya Kunlamas", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Dr. Thitinun Raknoo", affiliation: "Department of Pharmacy, Suratthani Hospital" },
      { name: "Dr. Nint Polruang", affiliation: "Department of Pharmacy, Khon Kaen Hospital" },
      { name: "Dr. Thanawat Chattaweelarp", affiliation: "Faculty of Pharmacy, Payap University" },
      { name: "Dr. Neeracha Phon-in", affiliation: "Department of Pharmacy, Songklanagarind Hospital" },
      { name: "Asst. Prof. Dr. Tuanthon Boonlue", affiliation: "Faculty of Pharmaceutical Sciences, Ubon Ratchathani University" },
      { name: "Miss Pinchaya Toprayoon", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Academic Writing",
    members: [
      { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Asst. Prof. Dr. Suthinee Taesottikul", affiliation: "Faculty of Pharmacy, Chiang Mai University" },
      { name: "Asst. Prof. Dr. Sirima Sitaruno", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University" },
      { name: "Asst. Prof. Dr. Daraporn Rungprai", affiliation: "Faculty of Pharmacy, Silpakorn University" },
    ],
  },
  {
    title: "Finance, Fundraising, and Sponsorship",
    members: [
      { name: "Asst. Prof. Dr. Warunsuda Sripakdee", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University" },
      { name: "Miss Chanakit Imbumrung", affiliation: "Treasurer of the Pharmacy Council of Thailand" },
      { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Mr. Chanayus Jittaamornchai", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Registration and Public Relations",
    members: [
      { name: "Assoc. Prof. Sunee Lertsinudom", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University" },
      { name: "Mr. Aphinan Watcharaphichart", affiliation: "Assistant Secretary-General of the Pharmacy Council of Thailand" },
      { name: "Miss Chomchanok Pumsaydon", affiliation: "Faculty of Pharmaceutical Sciences, Naresuan University" },
      { name: "Dr. Supanun Pungcharoenkijkul", affiliation: "Department of Pharmacy, Nopparat Rajathanee Hospital" },
      { name: "Dr. Pannee Leelawattanachai", affiliation: "College of Pharmacy, Rangsit University" },
      { name: "Asst. Prof. Dr. Tuanthon Boonlue", affiliation: "Faculty of Pharmaceutical Sciences, Ubon Ratchathani University" },
      { name: "Mr. Thanaphat Kitcharoen", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Venue, Accommodation, and Logistics",
    members: [
      { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Asst. Prof. Dr. Suthan Chanthawong", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University" },
      { name: "Miss Sirarat Rattana", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Ceremony and Audio-Visual",
    members: [
      { name: "Asst. Prof. Dr. Chotirat Nakaranurack", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Asst. Prof. Dr. Juthathip Suphanklang", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Assoc. Prof. Dr. Pornwalai Boonmuang", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Asst. Prof. Dr. Jatapat Hemapanpairoa", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Acting Sub Lt. Piyawat Jarusit", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Reception",
    members: [
      { name: "Asst. Prof. Dr. Manit Sae-teaw", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University" },
      { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Asst. Prof. Dr. Pitchaya Dilokpattanamongkol", affiliation: "Faculty of Pharmacy, Mahidol University" },
      { name: "Mr. Jesada Jantharaprasert", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Abstract Review",
    members: [
      { name: "Asst. Prof. Dr. Thanompong Sathienlackana", affiliation: "Faculty of Pharmacy, Siam University" },
      { name: "Dr. Thitinun Raknoo", affiliation: "Department of Pharmacy, Suratthani Hospital" },
      { name: "Dr. Neeracha Phon-in", affiliation: "Department of Pharmacy, Songklanagarind Hospital" },
      { name: "Dr. Usasiri Srisakul", affiliation: "Faculty of Pharmacy, Siam University" },
      { name: "Dr. Ploylarp Lertvipapath", affiliation: "Department of Pharmacy, Siriraj Hospital, Mahidol University" },
      { name: "Dr. Taniya Charoensareerat", affiliation: "Faculty of Pharmacy, Siam University" },
      { name: "Dr. Busaya Kulabusaya", affiliation: "Department of Pharmaceutical Care, Siriraj Hospital, Mahidol University" },
      { name: "Dr. Kittika Yampayon", affiliation: "Department of Pharmacy, Siriraj Hospital, Mahidol University" },
      { name: "Dr. Thitipon Yaowaluk", affiliation: "Department of Pharmacy, Siriraj Hospital, Mahidol University" },
      { name: "Mrs. Anusara Kraunual", affiliation: "Department of Pharmacy, Somdet Chaopraya Institute of Psychiatry" },
    ],
  },
];

/* ══════════════════════════════════════
   COLLAPSIBLE SUB-COMMITTEE CARD
   ══════════════════════════════════════ */

function SubcommitteeCard({ group, index }: { group: SubGroup; index: number }) {
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
            {group.title}
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
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pl-10 space-y-0">
            {group.members.map((m, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-6 py-2.5 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-700 text-sm flex-shrink-0 md:w-[40%]">{m.name}</span>
                <span className="text-gray-400 text-xs md:text-sm">{m.affiliation}</span>
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
  switch (role) {
    case "Chairman":
      return "text-orange-600 font-semibold";
    case "Secretary":
      return "text-emerald-600 font-semibold";
    case "Assistant Secretary":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
}

/* ══════════════════════════════════════
   PAGE
   ══════════════════════════════════════ */

export default function AboutPrisPage() {
  const pageRef = useRef<HTMLElement>(null!);
  const t = useTranslations("about");

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // ─── Hero entrance ───
    gsap.from(".about-hero-line", {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.6,
      ease: "power4.out",
      delay: 0.15,
    });
    gsap.from(".about-hero-sub", {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.8,
    });

    // ─── "What is PRIS" reveal on scroll ───
    gsap.fromTo(
      ".about-desc",
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
        scrollTrigger: { trigger: ".about-desc", start: "top 80%" },
      }
    );

    // ─── Committee cards fade-in ───
    const cards = gsap.utils.toArray(".committee-block") as HTMLElement[];
    cards.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    // ─── Stagger rows ───
    const rows = gsap.utils.toArray(".org-row") as HTMLElement[];
    gsap.fromTo(rows,
      { opacity: 0, y: 15 },
      {
        opacity: 1, y: 0, stagger: 0.03, duration: 0.5, ease: "power2.out",
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
      <section className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col justify-end items-center text-center">
        {/* decorative bg glows */}
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-500/[0.06] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="about-hero-sub flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-blue-600" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">PRIS 2026</span>
            <span className="text-gray-300 text-[10px] tracking-widest uppercase">— {t("location")}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter leading-tight text-gray-900">
            <div className="overflow-hidden py-2 -my-2">
              <span className="block about-hero-line">About</span>
            </div>
            <div className="overflow-hidden py-2 -my-2">
              <span className="block about-hero-line text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-500 to-blue-700 pb-2">
                PRIS 2026
              </span>
            </div>
          </h1>
        </div>
      </section>

      {/* ══════ WHAT IS PRIS ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-4xl mx-auto about-desc">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-gray-900">{t("whatIsTitle")}</h2>
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
                  <span className="text-gray-900 font-medium text-lg">{a.name}</span>
                  <span className="text-gray-400 text-sm">{a.position}</span>
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
                  <span className="text-gray-800 text-sm md:text-base md:w-[60%]">{m.name}</span>
                  <span className={`text-sm ${rolePill(m.role)}`}>{m.role}</span>
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
                <SubcommitteeCard key={idx} group={group} index={idx} />
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
