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

  // Side text
  c = c.replace(/You can achieve significant breakthroughs when you connect, explore, and commit to the vision of PRIS 2026\./g, '{t("loginSideText")}');
  c = c.replace(/Create an account to securely access submissions, schedules, and personalized conference experiences\./g, '{t("signupSideText")}');

  // Modals in login/page.tsx
  c = c.replace(/Account Pending Approval/g, '{t("accountPending")}');
  c = c.replace(/Your account is currently under review by our admin team\. You will receive an email notification once your account has been approved\./g, '{t("accountPendingDesc")}');
  c = c.replace(/This process usually takes/g, '{t("processTakes")}');
  c = c.replace(/5-7 business days/g, '{t("businessDays")}');
  c = c.replace(/>I Understand</g, '>{t("iUnderstand")}<');
  c = c.replace(/Account Rejected/g, '{t("accountRejected")}');
  c = c.replace(/Your account registration has been rejected by the admin team\./g, '{t("accountRejectedDesc")}');
  c = c.replace(/Reason:/g, '{t("reason")}');
  c = c.replace(/If you believe this is an error, please contact our support team\./g, '{t("contactSupport")}');
  c = c.replace(/>Close</g, '>{t("close")}<');

  // Modals and File Uploads in student, pharmacist, healthcare
  c = c.replace(/Upload Student ID \/ Certificate/g, '{t("uploadIdTitle")}');
  c = c.replace(/Upload your student ID card or an official university certificate\./g, '{t("uploadIdDesc")}');
  c = c.replace(/PDF, JPG, or PNG \(Max 5MB\)/g, '{t("fileFormat")}');
  c = c.replace(/>Select File</g, '>{t("selectFile")}<');
  c = c.replace(/>Cancel</g, '>{t("cancel")}<');

  c = c.replace(/Pharmacy Council License/g, '{t("uploadLicenseTitle")}');
  c = c.replace(/Upload a copy of your valid Pharmacy Council license\./g, '{t("uploadLicenseDesc")}');
  
  c = c.replace(/Professional Certificate \/ ID/g, '{t("uploadCertTitle")}');
  c = c.replace(/Upload your professional certificate or official ID card\./g, '{t("uploadCertDesc")}');

  // pending/page.tsx
  c = c.replace(/Registration Complete/g, '{t("regComplete")}');
  c = c.replace(/Your account is pending approval\./g, '{t("accPendingApproval")}');
  c = c.replace(/We have received your registration details\. Our team will review your information, which typically takes 5-7 business days\./g, '{t("receivedDetails")}');
  c = c.replace(/You will receive an email notification once your account has been approved\./g, '{t("notifyEmail")}');
  c = c.replace(/>Return to Home</g, '>{t("returnHome")}<');
  
  fs.writeFileSync(f, c);
});
console.log('Final text replacements complete');
