import Link from "next/link";
import Image from "next/image";
import { Mail, Facebook, Instagram, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About PRIS", href: "/about" },
    { label: "Call for Abstracts", href: "/call-for-abstracts" },
    { label: "Registration", href: "/registration" },
  ],
};

const galleryImages = [
  { src: "/assets/img/all-images/memory/memory1.jpg", alt: "Memory 1" },
  { src: "/assets/img/all-images/memory/memory3.jpg", alt: "Memory 3" },
  { src: "/assets/img/all-images/memory/memory4.jpg", alt: "Memory 4" },
  { src: "/assets/img/all-images/bangkok/img1.jpg", alt: "Bangkok 1" },
  { src: "/assets/img/all-images/bangkok/img3.jpg", alt: "Bangkok 3" },
  { src: "/assets/img/all-images/bangkok/img9.jpg", alt: "Bangkok 9" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const locale = "en"; // Mock locale until configured

  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Description */}
          <div className="flex flex-col gap-6">
            <Link href={`/${locale}`}>
              <Image
                src="/assets/img/logo/footer-logo-2026.png"
                alt="Pris 2026 Logo"
                width={120}
                height={60}
                className="h-auto w-[120px]"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Join us for the most comprehensive international pharmacy conference in 2026, 
              fostering innovation and collaboration across borders.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold font-heading text-white">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={`/${locale}${link.href}`}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold font-heading text-white">Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a 
                  href="mailto:Pris2026@gmail.com" 
                  className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 text-gold" />
                  Pris2026@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/profile.php?id=61584025641109" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Facebook className="h-4 w-4 text-gold" />
                  Pris2026
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Instagram className="h-4 w-4 text-gold" />
                  Pris2026
                </a>
              </li>
            </ul>
          </div>

          {/* Event Gallery */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold font-heading text-white">Gallery</h3>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, idx) => (
                <Link 
                  key={idx} 
                  href={`/${locale}/gallery`}
                  className="group relative aspect-square overflow-hidden rounded-md bg-gray-800"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowRight className="text-gold h-5 w-5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © Copyright {currentYear} - Pharmacy Council of Thailand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
