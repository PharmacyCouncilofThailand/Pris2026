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
  title: "Telehealth for optimizing asthma management during pregnancy: a randomized controlled trial",
  authors: [
    { name: "Elida Zairina", affiliation: 1, isPresenter: true },
    { name: "Michael J Abramson", affiliation: 2 },
    { name: "Kay Stewart", affiliation: 3 },
    { name: "Johnson George", affiliation: 3 },
  ],
  affiliations: [
    { id: 1, name: "Dept of Pharmacy Practice, Faculty of Pharmacy, Universitas Airlangga, Surabaya, Indonesia" },
    { id: 2, name: "Dept of Epidemiology, School of Public Health and Preventive Medicine, Monash University, Melbourne, Australia" },
    { id: 3, name: "Centre for Medicine Use and Safety, Faculty of Pharmacy and Pharmaceutical Sciences, Monash University, Melbourne, Australia" },
  ],
  sections: [
    {
      heading: "Background",
      content: "Managing asthma in pregnant women is an integral part of asthma guidelines; however poorly controlled asthma during pregnancy remains a major problem. This study aimed to evaluate the efficacy of a telehealth program supported by a handheld respiratory device in improving asthma control during pregnancy.",
    },
    {
      heading: "Methods",
      content: "Pregnant women with asthma (n=72) from two antenatal clinics in Melbourne, Australia were randomized to one of the two groups: 1) intervention – involving a telehealth program and written asthma action plan supported by a handheld respiratory device and a smart phone application (Breathe-easy®); or 2) control group – usual care. Both groups were followed prospectively, and their asthma control scores were compared at 3 and 6 months.",
    },
    {
      heading: "Results",
      content: "At baseline, participants' mean (±SD) age was 31.4±4.5 years and gestational age 16.7±3.1 weeks. No significant differences in demographic, maternal or clinical characteristics were observed. At 6 months, compared to the usual care group, the intervention group had better asthma control (p=0.02) and asthma-related quality of life (p<0.01). There were no significant differences between groups in lung function, unscheduled healthcare visits, days off work/study, oral corticosteroid use or perinatal outcomes. No significant differences between groups were found in 3 months.",
    },
    {
      heading: "Conclusions",
      content: "Telehealth interventions supporting self-management are feasible and efficacious to improve asthma control and asthma-related quality of life during pregnancy.",
    },
  ],
  keywords: ["asthma", "pregnant women", "quality-of-life", "telehealth"],
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
