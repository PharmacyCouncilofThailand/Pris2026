import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

const footerLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About PRIS", href: "/about" },
    { label: "Call for Abstracts", href: "/call-for-abstracts" },
    { label: "Registration", href: "/registration" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const locale = "en"; // Mock locale until configured

  return (
    <footer className="bg-zinc-950 text-white border-t border-white/10 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] pt-24 pb-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Brand & Address (Col Span 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <Link href={`/${locale}`} className="inline-block mb-10">
              <Image
                src="/assets/Img/sponsors/logo สภา.jpg"
                alt="Pharmacy Council Logo"
                width={80}
                height={80}
                className="h-auto w-[65px] brightness-90 hover:brightness-100 transition-all duration-300"
              />
            </Link>
            
            <div className="flex gap-4 items-start">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
              <div className="text-zinc-400 text-sm md:text-base font-light leading-relaxed flex flex-col">
                <span className="text-white font-medium mb-1">สำนักงานเลขาธิการสภาเภสัชกรรม</span>
                <span>อาคารมหิตลาธิเบศร ชั้น 8</span>
                <span>กระทรวงสาธารณสุข เลขที่ 88/19 หมู่ 4</span>
                <span>ถนนติวานนท์ ตำบลตลาดขวัญ</span>
                <span>อำเภอเมือง จังหวัดนนทบุรี 11000</span>
              </div>
            </div>
          </div>

          {/* Quick Links (Col Span 3) */}
          <div className="lg:col-span-3 lg:pl-8 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-8 flex items-center gap-3">
              <span className="w-4 h-px bg-zinc-700"></span>
              Navigation
            </h3>
            <ul className="flex flex-col gap-4">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={`/${locale}${link.href}`}
                    className="text-zinc-400 hover:text-white transition-colors duration-300 text-sm font-light inline-flex items-center group"
                  >
                    <span className="w-0 h-px bg-[#D4AF37] mr-0 group-hover:w-3 group-hover:mr-3 transition-all duration-300 ease-out" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-8 flex items-center gap-3">
              <span className="w-4 h-px bg-zinc-700"></span>
              Contact Us
            </h3>
            <ul className="flex flex-col gap-6">
              <li>
                <a 
                  href="tel:+6625919992" 
                  className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10 transition-all duration-300 shrink-0">
                    <Phone className="h-4 w-4 text-zinc-300 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <span className="text-sm md:text-base font-light tracking-wide">+6625 919 992</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:pharthai@pharmacycouncil.org" 
                  className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10 transition-all duration-300 shrink-0">
                    <Mail className="h-4 w-4 text-zinc-300 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <span className="text-sm md:text-base font-light tracking-wide">pharthai@pharmacycouncil.org</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pharmacycouncil.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10 transition-all duration-300 shrink-0">
                    <Globe className="h-4 w-4 text-zinc-300 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <span className="text-sm md:text-base font-light tracking-wide">www.pharmacycouncil.org</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs md:text-sm font-light">
            © {currentYear} Pharmacy Council of Thailand. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-zinc-600 font-light text-xs">PRIS 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
