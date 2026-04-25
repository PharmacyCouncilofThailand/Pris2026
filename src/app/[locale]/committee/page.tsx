"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Award, BookOpen, Wallet, Megaphone, MapPin, Presentation, HandshakeIcon, FileSearch } from "lucide-react";
import PageHero from "@/components/sections/PageHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ────────── Committee Data ────────── */

interface CommitteeMember {
  name: string;
  role?: string;
  affiliation?: string;
}

interface CommitteeSection {
  title: string;
  icon: React.ReactNode;
  members: CommitteeMember[];
}

const advisorData: CommitteeMember[] = [
  { name: "Mr. Preecha Phantuwecha", role: "President of the Pharmacy Council of Thailand" },
];

const organizingCommitteeData: CommitteeMember[] = [
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

const subcommittees: CommitteeSection[] = [
  {
    title: "Subcommittee on Academic Conference Organizing",
    icon: <BookOpen className="w-5 h-5" />,
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
    title: "Subcommittee on Academic Writing",
    icon: <BookOpen className="w-5 h-5" />,
    members: [
      { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Asst. Prof. Dr. Suthinee Taesottikul", affiliation: "Faculty of Pharmacy, Chiang Mai University" },
      { name: "Asst. Prof. Dr. Sirima Sitaruno", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University" },
      { name: "Asst. Prof. Dr. Daraporn Rungprai", affiliation: "Faculty of Pharmacy, Silpakorn University" },
    ],
  },
  {
    title: "Subcommittee on Finance, Fundraising, and Sponsorship",
    icon: <Wallet className="w-5 h-5" />,
    members: [
      { name: "Asst. Prof. Dr. Warunsuda Sripakdee", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University" },
      { name: "Miss Chanakit Imbumrung", affiliation: "Treasurer of the Pharmacy Council of Thailand" },
      { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University" },
      { name: "Mr. Chanayus Jittaamornchai", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Subcommittee on Registration and Public Relations",
    icon: <Megaphone className="w-5 h-5" />,
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
    title: "Subcommittee on Venue, Accommodation, and Logistics",
    icon: <MapPin className="w-5 h-5" />,
    members: [
      { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Asst. Prof. Dr. Suthan Chanthawong", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University" },
      { name: "Miss Sirarat Rattana", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Subcommittee on Ceremony and Audio-Visual Team",
    icon: <Presentation className="w-5 h-5" />,
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
    title: "Subcommittee on Reception",
    icon: <HandshakeIcon className="w-5 h-5" />,
    members: [
      { name: "Asst. Prof. Dr. Manit Sae-teaw", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University" },
      { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University" },
      { name: "Asst. Prof. Dr. Pitchaya Dilokpattanamongkol", affiliation: "Faculty of Pharmacy, Mahidol University" },
      { name: "Mr. Jesada Jantharaprasert", affiliation: "Pharmacy Council of Thailand" },
    ],
  },
  {
    title: "Subcommittee on Abstract Review",
    icon: <FileSearch className="w-5 h-5" />,
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

/* ────────── Helpers ────────── */

function getRoleBadgeColor(role: string) {
  if (role === "Chairman") return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
  if (role === "Vice Chairman") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (role === "Secretary") return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white";
  if (role === "Assistant Secretary") return "bg-white/5 text-gray-300 border border-white/10";
  return "bg-gold/10 text-gold border border-gold/20";
}

/* ────────── Page Component ────────── */

export default function CommitteePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // Hero text entrance handled by PageHero component

    // Section cards entrance
    const cards = gsap.utils.toArray(".committee-card") as HTMLElement[];
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });

    // Table rows stagger
    const tables = gsap.utils.toArray(".committee-table") as HTMLElement[];
    tables.forEach((table) => {
      const rows = table.querySelectorAll("tbody tr");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: table,
            start: "top 85%",
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#0a0a0f] text-white selection:bg-gold/30 overflow-hidden relative"
    >
      {/* ═══ Decorative BG Glows ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px]" />
      </div>

      {/* ═══ Hero Header ═══ */}
      <PageHero
        dark
        title1="Committee"
        subtitle="Meet the dedicated team of professionals organizing the 2nd Pharmacy Research and Innovation Summit."
      />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-32 relative z-10 space-y-16 md:space-y-20">

        {/* ═══ Advisors ═══ */}
        <div className="committee-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-orange-500/10 border border-gold/20">
              <Award className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Advisors</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <table className="committee-table w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Position</th>
                </tr>
              </thead>
              <tbody>
                {advisorData.map((member, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-medium text-white/90">{member.name}</td>
                    <td className="px-6 py-4 text-white/50 text-sm">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ Organizing Committee ═══ */}
        <div className="committee-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Organizing Committee</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <table className="committee-table w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Role</th>
                </tr>
              </thead>
              <tbody>
                {organizingCommitteeData.map((member, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white/90 group-hover:text-white transition-colors">{member.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role || "")}`}>
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ Subcommittees ═══ */}
        <div className="committee-hero-text">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-gold/50" />
            <h3 className="text-gold tracking-[0.3em] uppercase text-xs font-semibold">Working Groups</h3>
            <span className="w-8 h-px bg-gold/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 text-center">Subcommittees</h2>
        </div>

        {subcommittees.map((sub, idx) => (
          <div key={idx} className="committee-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60">
                {sub.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white/90">{sub.title}</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <table className="committee-table w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 w-[40%]">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Affiliation</th>
                  </tr>
                </thead>
                <tbody>
                  {sub.members.map((member, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-3 font-medium text-white/90 group-hover:text-white transition-colors text-sm">
                        {member.name}
                      </td>
                      <td className="px-6 py-3 text-white/40 text-sm">
                        {member.affiliation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* ═══ Footer Decoration ═══ */}
        <div className="flex items-center justify-center gap-4 pt-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-semibold">PRIS 2026 Committee</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </div>
    </main>
  );
}
