"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import { galleryImages } from "@/data/galleryData";

const quickLinks = [
  { labelKey: "home", href: "/" },
  { labelKey: "aboutPris", href: "/about" },
  { labelKey: "callForAbstracts", href: "/call-for-abstracts" },
  { labelKey: "registration", href: "/registration" },
  { labelKey: "gallery", href: "/gallery" },
];

const galleryThumbs = galleryImages.slice(0, 6);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();

  if (pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/approved-abstracts")) {
    return null;
  }

  return (
    <footer className="bg-zinc-950 text-white border-t border-white/10 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] pt-14 pb-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-10">

          {/* Brand & Address (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" prefetch={true} className="inline-block mb-6">
              <Image
                src="/assets/Img/logo/logo-pharmacy.png"
                alt="Pharmacy Council Logo"
                width={800}
                height={800}
                className="h-auto w-[250px] brightness-90 hover:brightness-100 transition-all duration-300"
              />
            </Link>

            <div className="flex gap-4 items-start">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
              <div className="text-zinc-400 text-sm md:text-base font-light leading-relaxed flex flex-col">
                <span className="text-white font-medium mb-1">{tFooter("address.title")}</span>
                <span>{tFooter("address.line1")}</span>
                <span>{tFooter("address.line2")}</span>
                <span>{tFooter("address.line3")}</span>
                <span>{tFooter("address.line4")}</span>
              </div>
            </div>
          </div>

          {/* Quick Links (Col Span 2) */}
          <div className="lg:col-span-2 lg:pl-8 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-5 flex items-center gap-3">
              <span className="w-4 h-px bg-zinc-700"></span>
              {tFooter("navigation")}
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={link.href as any}
                    prefetch={true}
                    className="text-zinc-400 hover:text-white transition-colors duration-300 text-sm font-light inline-flex items-center group"
                  >
                    <span className="w-0 h-px bg-[#D4AF37] mr-0 group-hover:w-3 group-hover:mr-3 transition-all duration-300 ease-out" />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(link.labelKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (Col Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-5 flex items-center gap-3">
              <span className="w-4 h-px bg-zinc-700"></span>
              {tFooter("contactUs")}
            </h3>
            <ul className="flex flex-col gap-4">
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

          {/* Gallery Thumbnails (Col Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-5 flex items-center gap-3">
              <span className="w-4 h-px bg-zinc-700"></span>
              Gallery
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {galleryThumbs.map((src, idx) => (
                <Link key={idx} href="/gallery" prefetch={true} className="block">
                  <div className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image
                      src={src}
                      alt={`PRIS Gallery ${idx + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs md:text-sm font-light">
            {tFooter("copyright", { year: currentYear })}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-zinc-600 font-light text-xs">PRIS 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
