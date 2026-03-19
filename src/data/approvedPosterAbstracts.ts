export interface ApprovedPosterAbstract {
  id: string;
  title: string;
  presenter: string;
  affiliation: string;
  category: string;
  presentationType: "Poster" | "Oral";
  status: "Approved";
}

export const approvedPosterAbstracts: ApprovedPosterAbstract[] = [
  {
    id: "ABS-P-2026-001",
    title: "Impact of Pharmacist-Led Medication Reconciliation on Readmission Rates",
    presenter: "Nattapol Srisuk",
    affiliation: "Khon Kaen University",
    category: "Clinical Pharmacy",
    presentationType: "Oral",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-014",
    title: "Telepharmacy Follow-Up for Older Adults With Polypharmacy",
    presenter: "Ploypailin Wongsa",
    affiliation: "Chiang Mai University",
    category: "Social and Administrative Pharmacy",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-027",
    title: "Machine Learning Model for Detecting High-Risk Prescriptions",
    presenter: "Thanawat Lertchai",
    affiliation: "Mahidol University",
    category: "Digital Pharmacy and Health Technology",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-033",
    title: "Community Pharmacists' Role in Smoking Cessation Programs",
    presenter: "Kanya Rattanasiri",
    affiliation: "Naresuan University",
    category: "Social and Administrative Pharmacy",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-041",
    title: "Simulation-Based Training for Antimicrobial Stewardship Education",
    presenter: "Supawadee Jindawat",
    affiliation: "Prince of Songkla University",
    category: "Pharmacy Education",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-052",
    title: "Real-World Safety Signals of Herbal and Conventional Drug Co-Use",
    presenter: "Arisa Boonmee",
    affiliation: "Silpakorn University",
    category: "Pharmacology and Pharmacogenomics",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-067",
    title: "Stability Assessment of Extemporaneous Pediatric Formulations",
    presenter: "Kornkanok Chaisiri",
    affiliation: "Srinakharinwirot University",
    category: "Pharmaceutical Sciences and Medication Management",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-P-2026-074",
    title: "Medication Adherence Dashboard for Tuberculosis Care",
    presenter: "Peerawat Chaweewan",
    affiliation: "Chulalongkorn University",
    category: "Digital Pharmacy and Health Technology",
    presentationType: "Poster",
    status: "Approved",
  },
  {
    id: "ABS-O-2026-081",
    title: "Innovative Drug Delivery Systems in Oncology",
    presenter: "Pornpan Rakchart",
    affiliation: "Chulalongkorn University",
    category: "Pharmaceutics",
    presentationType: "Oral",
    status: "Approved",
  },
  {
    id: "ABS-O-2026-092",
    title: "Cost-Effectiveness Analysis of Novel Diabetes Treatments in Thailand",
    presenter: "Siraphat Maneewan",
    affiliation: "Mahidol University",
    category: "Pharmacoeconomics",
    presentationType: "Oral",
    status: "Approved",
  },
  {
    id: "ABS-O-2026-105",
    title: "Optimization of Antimicrobial Dosing in Critical Care Patients",
    presenter: "Kittipong Sooksawad",
    affiliation: "Siriraj Hospital",
    category: "Clinical Pharmacy",
    presentationType: "Oral",
    status: "Approved",
  },
  {
    id: "ABS-O-2026-118",
    title: "Developing Community Pharmacy Services for Geriatric Care",
    presenter: "Oranuch Jaisuk",
    affiliation: "Chiang Mai University",
    category: "Social and Administrative Pharmacy",
    presentationType: "Oral",
    status: "Approved",
  }
];