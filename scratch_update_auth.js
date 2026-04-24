const fs = require('fs');

const files = [
  'c:/Pris2026/src/app/[locale]/login/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pending/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  // 1. Fix Logo
  c = c.replace(/width=\{140\}/g, 'width={200}');
  c = c.replace(/height=\{56\}/g, 'height={80}');
  c = c.replace(/h-14 w-auto/g, 'h-[55px] w-auto');

  // 2. Remove GSAP
  c = c.replace(/import gsap from "gsap";\n/g, '');
  c = c.replace(/import \{ useGSAP \} from "@gsap\/react";\n/g, '');
  c = c.replace(/const containerRef = useRef<HTMLDivElement>\(null!\);\n/g, '');
  // Matches useGSAP block across multiple lines
  c = c.replace(/useGSAP\(\(\) => \{[\s\S]*?\}, \{ scope: containerRef \}\);\n/g, '');
  c = c.replace(/ref=\{containerRef\}/g, '');
  c = c.replace(/fade-in-element/g, '');

  // 3. Add translation import and hook
  if (!c.includes('useTranslations')) {
    c = c.replace(/import \{ Link[^\n]*\} from "@\/i18n\/routing";/g, match => match + '\nimport { useTranslations } from "next-intl";');
    c = c.replace(/export default function \w+\(\) \{/g, match => match + '\n  const t = useTranslations("auth");');
  }

  // 4. Basic translations
  c = c.replace(/>\s*Login\s*<\/h1>/g, '>{t("login")}</h1>');
  c = c.replace(/>\s*Enter your email and password to access your account\s*<\/p>/g, '>{t("loginDesc")}</p>');
  c = c.replace(/>\s*Sign In\s*<\/button>/g, '>{t("signIn")}</button>');
  c = c.replace(/'Signing in\.\.\.'/g, 't("signingIn")');
  c = c.replace(/'Sign In'/g, 't("signIn")');
  c = c.replace(/>\s*Sign Up\s*<\/Link>/g, '>{t("signUp")}</Link>');
  c = c.replace(/>\s*Don't have an account\?\s*\{?" "\}?/g, '>{t("noAccount")} {" "}');
  c = c.replace(/>\s*Already have an account\?\s*\{?" "\}?/g, '>{t("alreadyHaveAccount")} {" "}');
  
  c = c.replace(/>\s*Create Account\s*<\/h1>/g, '>{t("createAccount")}</h1>');
  c = c.replace(/>\s*Select your academic or professional profile\s*<\/p>/g, '>{t("selectProfile")}</p>');
  
  c = c.replace(/>\s*Student\s*<\/h3>/g, '>{t("student")}</h3>');
  c = c.replace(/>\s*For academic attendees\s*<\/p>/g, '>{t("studentDesc")}</p>');
  c = c.replace(/>\s*Pharmacist\s*<\/h3>/g, '>{t("pharmacist")}</h3>');
  c = c.replace(/>\s*For licensed pharmacists\s*<\/p>/g, '>{t("pharmacistDesc")}</p>');
  c = c.replace(/>\s*Healthcare Professional\s*<\/h3>/g, '>{t("healthcare")}</h3>');
  c = c.replace(/>\s*For healthcare personnel\s*<\/p>/g, '>{t("healthcareDesc")}</p>');
  
  c = c.replace(/>\s*Back\s*<\/span>/g, '>{t("back")}</span>');
  c = c.replace(/>\s*Go\s*<\/div>/g, '>{t("go")}</div>');
  
  // Placeholders and labels
  c = c.replace(/>\s*Email\s*<\/label>/g, '>{t("email")}</label>');
  c = c.replace(/placeholder="Enter your email"/g, 'placeholder={t("emailPlaceholder")}');
  c = c.replace(/>\s*Password\s*<\/label>/g, '>{t("password")}</label>');
  c = c.replace(/placeholder="Enter your password"/g, 'placeholder={t("passwordPlaceholder")}');
  c = c.replace(/>\s*Remember me\s*<\/span>/g, '>{t("rememberMe")}</span>');
  c = c.replace(/>\s*Forgot Password\s*<\/Link>/g, '>{t("forgotPassword")}</Link>');
  
  // Registration forms
  c = c.replace(/>\s*First Name\s*<\/label>/g, '>{t("firstName")}</label>');
  c = c.replace(/placeholder="John"/g, 'placeholder={t("firstName")}');
  c = c.replace(/>\s*Last Name\s*<\/label>/g, '>{t("lastName")}</label>');
  c = c.replace(/placeholder="Doe"/g, 'placeholder={t("lastName")}');
  c = c.replace(/>\s*License Number\s*<\/label>/g, '>{t("license")}</label>');
  c = c.replace(/placeholder="Enter your license number"/g, 'placeholder={t("license")}');
  c = c.replace(/>\s*Hospital \/ Institution\s*<\/label>/g, '>{t("hospital")}</label>');
  c = c.replace(/placeholder="Enter your hospital or institution"/g, 'placeholder={t("hospital")}');
  c = c.replace(/>\s*University\s*<\/label>/g, '>{t("university")}</label>');
  c = c.replace(/placeholder="Enter your university"/g, 'placeholder={t("university")}');
  c = c.replace(/>\s*Faculty\s*<\/label>/g, '>{t("faculty")}</label>');
  c = c.replace(/placeholder="Enter your faculty"/g, 'placeholder={t("faculty")}');
  c = c.replace(/>\s*Profession\s*<\/label>/g, '>{t("profession")}</label>');
  c = c.replace(/placeholder="e\.g\. Nurse, Doctor"/g, 'placeholder={t("profession")}');

  c = c.replace(/>\s*Create Account\s*<\/button>/g, '>{t("createBtn")}</button>');
  c = c.replace(/'Creating\.\.\.'/g, 't("creating")');
  c = c.replace(/'Create Account'/g, 't("createBtn")');
  
  fs.writeFileSync(f, c);
});
console.log('Processed all auth pages');
