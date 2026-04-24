const fs = require('fs');

const files = [
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');

  // Headers
  c = c.replace(/Join as Student/g, '{t("joinAsStudent")}');
  c = c.replace(/Join as Pharmacist/g, '{t("joinAsPharmacist")}');
  c = c.replace(/Join as Healthcare Professional/g, '{t("joinAsHealthcare")}');
  c = c.replace(/Please fill in your details to register your account/g, '{t("fillDetails")}');

  // Form Labels that missed the first pass
  c = c.replace(/First Name <span/g, '{t("firstName")} <span');
  c = c.replace(/Last Name <span/g, '{t("lastName")} <span');
  c = c.replace(/National ID \/ Passport Number <span/g, '{t("nationalId")} <span');
  c = c.replace(/Email Address <span/g, '{t("emailAddress")} <span');
  c = c.replace(/University \/ Institution/g, '{t("organization")}');
  c = c.replace(/Student Level <span/g, '{t("studentLevel")} <span');
  c = c.replace(/Phone Number/g, '{t("phoneNumber")}');
  c = c.replace(/>Password <span/g, '>{t("password")} <span');
  c = c.replace(/Confirm Password <span/g, '{t("confirmPassword")} <span');
  
  c = c.replace(/Pharmacy Council License <span/g, '{t("uploadLicenseTitle")} <span');
  c = c.replace(/Professional Certificate \/ ID <span/g, '{t("uploadCertTitle")} <span');

  // Terms and checkboxes
  c = c.replace(/I agree to the <Link/g, '{t("iAgree")} <Link');
  c = c.replace(/>Terms of Service<\/Link> and <Link/g, '>{t("tos")}</Link> {t("and")} <Link');
  c = c.replace(/>Privacy Policy<\/Link>/g, '>{t("privacy")}</Link>');

  // Dropsdowns
  c = c.replace(/Undergraduate/g, '{t("undergrad")}');
  c = c.replace(/Postgraduate/g, '{t("postgrad")}');
  c = c.replace(/Select student level/g, '{t("selectLevel")}');

  // Files
  c = c.replace(/Click to change file/g, '{t("clickToChange")}');
  c = c.replace(/Select student certificate or related document/g, '{t("selectDoc")}');
  c = c.replace(/Choose File/g, '{t("chooseFile")}');

  // Create account
  c = c.replace(/'Creating Account\.\.\.'/g, 't("creatingAcc")');

  fs.writeFileSync(f, c);
});

// Also inject the language switcher into ALL 6 pages
const allFiles = [
  'c:/Pris2026/src/app/[locale]/login/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pending/page.tsx'
];

allFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');

  // Check if we already have a language switcher
  if (!c.includes('switchLocale')) {
    // Add import useLocale
    if (c.includes('useTranslations } from "next-intl"')) {
      c = c.replace(/import \{ useTranslations \} from "next-intl";/, 'import { useTranslations, useLocale } from "next-intl";');
    } else {
      c = c.replace(/import \{ useTranslations, useLocale \} from "next-intl";/, 'import { useTranslations, useLocale } from "next-intl";'); // fallback
    }

    // Add useTransition for smooth switching
    if (c.includes('import React, { useRef')) {
      c = c.replace(/import React, \{ useRef([^}]*)\} from "react";/, 'import React, { useRef$1, useTransition } from "react";');
    }

    // Inject switchLocale function inside component
    const functionStartMatch = c.match(/export default function \w+\(\) \{/);
    if (functionStartMatch) {
      const functionStart = functionStartMatch[0];
      const injection = `
  const locale = useLocale();
  const [isPendingLang, startTransitionLang] = useTransition();
  const switchLocale = () => {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransitionLang(() => {
      router.replace(window.location.pathname, { locale: nextLocale });
    });
  };`;
      c = c.replace(functionStart, functionStart + injection);
    }

    // Inject Language Switcher Button UI
    const mainTagMatch = c.match(/<main className="[^"]+ relative z-40">/);
    if (mainTagMatch) {
      const mainTag = mainTagMatch[0];
      const buttonInjection = `
      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={switchLocale}
          disabled={isPendingLang}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {locale === "en" ? "TH" : "EN"}
        </button>
      </div>`;
      c = c.replace(mainTag, mainTag + buttonInjection);
    }
    
    fs.writeFileSync(f, c);
  }
});
console.log('Language switcher and forms updated');
