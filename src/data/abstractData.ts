export const abstractTimeline = [
  {
    label: "Opening Date",
    date: "4 February 2026",
    status: "completed",
    color: "green",
  },
  {
    label: "Submission Deadline",
    date: "15 May 2026",
    status: "active",
    color: "red",
  },
  {
    label: "Notification of Acceptance",
    date: "To be announced",
    status: "upcoming",
    color: "blue",
  },
];

export const abstractCategories = [
  { id: 1, title: "Clinical Pharmacy / Patient Care" },
  { id: 2, title: "Social and Administrative Pharmacy" },
  { id: 3, title: "Pharmaceutical Sciences and Medication Management" },
  { id: 4, title: "Pharmacology and Pharmacogenomics" },
  { id: 5, title: "Pharmacy Education" },
  { id: 6, title: "Digital Pharmacy and Health Technology" },
];

export const submissionGuidelines = {
  intro: "The Second PRIS 2026 Organizing Committee invites all interested individuals to submit abstracts for Oral and Poster Presentations. All abstracts must be submitted online through the PRIS 2026 website.",
  general: [
    "Abstracts must be submitted in Microsoft Word format (.doc or .docx).",
    "All submissions must be in English only.",
    "The abstract body should not exceed 300 words (excluding title, authors, and affiliations).",
    "Each participant may submit and present a maximum of TWO abstracts.",
    "At least one author of each accepted abstract must register and pay the registration fee.",
  ],
  importantNote: "One author can present a maximum of TWO abstracts per registration.",
  formatting: [
    "Font: Times New Roman",
    "Font size: 12 pt for body text",
    "Line spacing: Single-spaced",
    "Standard abbreviations may be used; unusual ones must be defined in parentheses when first used.",
    "Do not include tables, figures, or references in the abstract.",
  ],
  policies: {
    declaration: [
      "The author(s) declare that the work is original and has not been published elsewhere.",
      "Any studies involving human subjects or animals must have received appropriate ethical approval.",
      "The author(s) grant PRIS 2026 permission to publish the abstract in the conference proceedings.",
    ],
    acceptance: [
      "All abstracts will be reviewed by the Scientific Committee.",
      "Notification of acceptance will be sent via email to the corresponding author.",
      "The committee reserves the right to decide the final presentation format.",
    ],
    withdrawal: "Requests for abstract withdrawal must be sent in writing to the Secretariat before 30 June 2026.",
  },
};

export const submissionSteps = [
  {
    step: 1,
    title: "Prepare Your Abstract",
    description: "Ensure your abstract follows the formatting guidelines and structure mentioned above.",
  },
  {
    step: 2,
    title: "Register/Login",
    description: "Create an account or login to the PRIS 2026 portal to access the submission form.",
  },
  {
    step: 3,
    title: "Upload & Submit",
    description: "Complete the submission form and upload your abstract file. You will receive a confirmation email upon successful submission.",
  },
];

export const abstractExample = {
  title: "IMPACT OF CLINICAL PHARMACY SERVICES ON PATIENT OUTCOMES IN A TERTIARY CARE HOSPITAL",
  authors: [
    { name: "John Doe", affiliation: 1, isPresenter: true },
    { name: "Jane Smith", affiliation: 2 },
  ],
  affiliations: [
    { id: 1, name: "Department of Pharmacy Practice, Faculty of Pharmacy, University A" },
    { id: 2, name: "School of Pharmaceutical Sciences, University B" },
  ],
  sections: [
    {
      heading: "Background",
      content: "Clinical pharmacy services have evolved significantly to improve patient safety and therapeutic outcomes...",
    },
    {
      heading: "Objectives",
      content: "To evaluate the impact of clinical pharmacist interventions on medication adherence and clinical markers...",
    },
    {
      heading: "Methods",
      content: "A prospective randomized controlled study was conducted over 6 months involving 200 patients...",
    },
    {
      heading: "Results",
      content: "Patients in the intervention group showed a significant improvement in medication adherence (p < 0.05)...",
    },
    {
      heading: "Conclusions",
      content: "The integration of clinical pharmacists into the multidisciplinary care team significantly enhances patient care...",
    },
  ],
  keywords: ["Clinical Pharmacy", "Patient Outcomes", "Medication Adherence", "Pharmacy Practice"],
};

export const submissionFormLabels = {
  steps: ["Author Information", "Co-Authors", "Abstract Details", "Content & Upload", "Review"],
  fields: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    affiliation: "Institution / Affiliation",
    country: "Country",
    phone: "Phone Number",
    abstractTitle: "Abstract Title",
    category: "Submission Category",
    presentationType: "Preferred Presentation Type",
    keywords: "Keywords (separated by semi-colon)",
    abstractFile: "Abstract File (PDF only)",
  },
  placeholders: {
    name: "e.g. Somchai",
    institution: "University, Hospital, or Organization",
    keywords: "e.g. Pharmacy; Clinical; Research",
  },
};

export const abstractStatusLabels = {
  summary: {
    total: "Total Submitted",
    accepted: "Accepted",
    pending: "Under Review",
    rejected: "Rejected",
  },
  table: {
    id: "Tracking ID",
    title: "Abstract Title",
    date: "Submitted Date",
    status: "Status",
    actions: "Actions",
  },
  statusText: {
    pending: "Under Review",
    accepted: "Accepted",
    rejected: "Rejected",
    revision: "Revision Required",
  },
};
