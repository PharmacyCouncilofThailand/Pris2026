export const abstractTimeline = [
  {
    label: "Abstract Submission — Round 1",
    labelTh: "การส่งบทคัดย่อ — รอบที่ 1",
    date: "1 July - 31 August 2026",
    dateTh: "1 กรกฎาคม 2569 - 31 สิงหาคม 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Round 1 Result Announcement",
    labelTh: "ประกาศผลบทคัดย่อรอบที่ 1",
    date: "10 September 2026",
    dateTh: "10 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Abstract Submission — Round 2",
    labelTh: "การส่งบทคัดย่อ — รอบที่ 2",
    date: "1 - 20 September 2026",
    dateTh: "1 - 20 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Round 2 Result Announcement",
    labelTh: "ประกาศผลบทคัดย่อรอบที่ 2",
    date: "30 September 2026",
    dateTh: "30 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
];
export const abstractCategories = [
  { id: 1, title: "Clinical Pharmacy and Pharmaceutical Care", titleTh: "เภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม" },
  { id: 2, title: "Community Pharmacy and Professional Practice", titleTh: "เภสัชกรรมชุมชนและการปฏิบัติงานวิชาชีพ" },
  { id: 3, title: "Pharmacy Administration", titleTh: "การบริหารเภสัชกิจ" },
  { id: 4, title: "Pharmaceutical Sciences, Technology and Industrial Pharmacy", titleTh: "เภสัชศาสตร์และเทคโนโลยีเภสัชกรรมและเภสัชกรรมอุตสาหการ" },
  { id: 5, title: "Digital Pharmacy and Health Informatics", titleTh: "เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ" },
  { id: 6, title: "Health and Drug Consumer Protection", titleTh: "การคุ้มครองผู้บริโภคด้านยาและสุขภาพ" },
  { id: 7, title: "Herbal Pharmacy", titleTh: "เภสัชกรรมสมุนไพร" },
  { id: 8, title: "Pharmacogenomics and Precision Medicine", titleTh: "เภสัชพันธุศาสตร์และการแพทย์แม่นยำ" },
];

export const submissionGuidelines = {
  intro: "The Organising Scientific Committee of the Pharmaceutical Research and Innovation Symposium (PRIS 2026) invites you to submit an abstract. Please see guidelines below for the required format of the abstracts. Each abstract will undergo a peer review process.",
  introTh: "คณะกรรมการจัดการประชุมวิชาการ PRIS 2026 ขอเชิญร่วมส่งบทคัดย่อ โปรดดูคำแนะนำในการจัดรูปแบบบทคัดย่อด้านล่าง บทคัดย่อแต่ละเรื่องจะได้รับการพิจารณาโดยผู้ทรงคุณวุฒิ",

  importantDates: [
    {
      label: "Abstract Submission — Round 1",
      labelTh: "การส่งบทคัดย่อ — รอบที่ 1",
      value: "1 July - 31 August 2026",
      valueTh: "1 กรกฎาคม 2569 - 31 สิงหาคม 2569",
      highlight: true,
    },
    {
      label: "Abstract Submission — Round 2",
      labelTh: "การส่งบทคัดย่อ — รอบที่ 2",
      value: "1 - 20 September 2026",
      valueTh: "1 - 20 กันยายน 2569",
      highlight: true,
    },
    {
      label: "Round 1 Result Announcement",
      labelTh: "ประกาศผลบทคัดย่อรอบที่ 1",
      value: "10 September 2026",
      valueTh: "10 กันยายน 2569",
    },
    {
      label: "Round 2 Result Announcement",
      labelTh: "ประกาศผลบทคัดย่อรอบที่ 2",
      value: "30 September 2026",
      valueTh: "30 กันยายน 2569",
    },
  ],
  importantDatesReservationNote: "The special Early Bird payment extension is reserved for participants who created their PRIS 2026 account and submitted at least one PRIS 2026 abstract by 31 August 2026, 23:59 (Bangkok time).",
  importantDatesReservationNoteTh: "สิทธิ์ขยายเวลาชำระในราคา Early Bird สงวนสำหรับผู้ที่สร้างบัญชี PRIS 2026 และส่งบทคัดย่อ PRIS 2026 อย่างน้อย 1 เรื่อง ภายในวันที่ 31 สิงหาคม 2569 เวลา 23:59 น.",
  presenterRegistrationNote: "Eligible participants may complete registration at the Early Bird rate of THB 1,250 until 15 September 2026, 23:59 (Bangkok time). After that deadline, the Regular rate is THB 2,500. Creating an account before the cutoff alone is not sufficient; if the first PRIS 2026 abstract is submitted on or after 1 September 2026, the Regular rate applies.",
  presenterRegistrationNoteTh: "ผู้มีสิทธิ์สามารถลงทะเบียนในราคา Early Bird 1,250 บาท ได้ถึงวันที่ 15 กันยายน 2569 เวลา 23:59 น. หลังจากนั้นใช้อัตราปกติ 2,500 บาท การสร้างบัญชีก่อนวันตัดสิทธิ์เพียงอย่างเดียวไม่เพียงพอ หากบทคัดย่อ PRIS 2026 เรื่องแรกถูกส่งตั้งแต่วันที่ 1 กันยายน 2569 เป็นต้นไป จะใช้อัตราปกติ",
  presenterRegistrationNoteSegments: [
    { text: "Early Bird extension requires both " },
    { text: "an account created by 31 August 2026, 23:59", accent: true },
    { text: " and " },
    { text: "at least one PRIS 2026 abstract submitted by 31 August 2026, 23:59", accent: true },
    { text: ". The THB 1,250 payment privilege ends on 15 September 2026, 23:59 (Bangkok time); after that, the Regular rate is THB 2,500. A first abstract submitted on or after 1 September does not qualify for the extension." },
  ],
  presenterRegistrationNoteSegmentsTh: [
    { text: "สิทธิ์ขยายราคา Early Bird ต้องมีทั้ง " },
    { text: "บัญชีที่สร้างภายใน 31 สิงหาคม 2569 เวลา 23:59 น.", accent: true },
    { text: " และ " },
    { text: "บทคัดย่อ PRIS 2026 อย่างน้อย 1 เรื่องที่ส่งภายใน 31 สิงหาคม 2569 เวลา 23:59 น.", accent: true },
    { text: " สิทธิ์ชำระราคา 1,250 บาทสิ้นสุดวันที่ 15 กันยายน 2569 เวลา 23:59 น. หลังจากนั้นใช้อัตราปกติ 2,500 บาท และการส่งบทคัดย่อเรื่องแรกตั้งแต่วันที่ 1 กันยายนเป็นต้นไปจะไม่ได้สิทธิ์ขยาย Early Bird" },
  ],

  generalInformation: [
    { label: "Presentation type", labelTh: "ประเภทการนำเสนอ (กรุณาเลือกหนึ่งประเภท)", value: "Poster presentation / Oral presentation", valueTh: "นำเสนอแบบโปสเตอร์ / นำเสนอแบบปากเปล่า" },
    { label: "Language", labelTh: "ภาษาที่ใช้ในการนำเสนอ", value: "Thai", valueTh: "ภาษาไทยเท่านั้น" },
  ],

  abstractTopics: [
    "Clinical Pharmacy and Pharmaceutical Care",
    "Community Pharmacy and Professional Practice",
    "Pharmacy Administration",
    "Pharmaceutical Sciences, Technology and Industrial Pharmacy",
    "Digital Pharmacy and Health Informatics",
    "Health and Drug Consumer Protection",
    "Herbal Pharmacy",
    "Pharmacogenomics and Precision Medicine",
  ],
  abstractTopicsTh: [
    "เภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม",
    "เภสัชกรรมชุมชนและการปฏิบัติงานวิชาชีพ",
    "การบริหารเภสัชกิจ",
    "เภสัชศาสตร์และเทคโนโลยีเภสัชกรรมและเภสัชกรรมอุตสาหการ",
    "เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
    "การคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
    "เภสัชกรรมสมุนไพร",
    "เภสัชพันธุศาสตร์และการแพทย์แม่นยำ",
  ],

  guidelines: [
    "Abstracts must be submitted online via the PRIS 2026 website only.",
    "Abstracts must contain original work that has not previously been reported.",
    "Only the presenting author may submit the abstract.",
    "The abstract MUST NOT exceed 300 words, excluding the title, authors and affiliations.",
    "Full papers are NOT required.",
    "Abstracts that describe plans for a study or state \"results will be presented\" will NOT be accepted.",
    "Do NOT include references.",
    "Do NOT submit abstracts with typographical or grammatical errors.",
    "All abbreviations should be given in brackets after the first full use of the word.",
    "Presentation type: Poster presentation / Oral presentation.",
    "Language: Thai",
  ],
  guidelinesTh: [
    "ต้องส่งบทคัดย่อผ่านระบบออนไลน์บนเว็บไซต์ PRIS 2026 เท่านั้น",
    "บทคัดย่อต้องเป็นผลงานดั้งเดิมที่ยังไม่เคยนำเสนอที่ใดมาก่อน",
    "ผู้นำเสนอผลงานเท่านั้นที่สามารถเป็นผู้ส่งบทคัดย่อได้",
    "ความยาวบทคัดย่อต้องไม่เกิน 300 คำ (ไม่รวมชื่อเรื่อง ชื่อผู้นิพนธ์ และสถานที่ทำงาน)",
    "ไม่จำเป็นต้องส่งผลงานฉบับเต็ม",
    "ขอสงวนสิทธิ์ไม่รับพิจารณาบทคัดย่อที่มีเพียงแผนการดำเนินงาน หรือระบุว่า 'จะนำเสนอผลในภายหลัง'",
    "ไม่จำเป็นต้องใส่เอกสารอ้างอิง",
    "บทคัดย่อต้องผ่านการตรวจสอบตัวสะกด ไวยากรณ์ และรูปแบบที่ถูกต้อง",
    "คำย่อทั้งหมดจะต้องระบุไว้ในวงเล็บหลังจากการใช้คำเต็มครั้งแรก",
    "ประเภทการนำเสนอ (กรุณาเลือกหนึ่งประเภท): นำเสนอแบบโปสเตอร์ / นำเสนอแบบปากเปล่า",
    "ภาษาที่ใช้ในการนำเสนอ: ภาษาไทย",
  ],
  acknowledgementNote: "Notification of acceptance will be sent automatically to the abstract submitter only. Please contact the secretariat at pr@pharmacycouncil.org if you do not receive the confirmation email.",
  acknowledgementNoteTh: "การแจ้งผลการพิจารณาจะถูกส่งให้ผู้ส่งรายงานเท่านั้น กรุณาติดต่อเลขาธิการที่ pr@pharmacycouncil.org หากท่านไม่ได้รับอีเมลยืนยัน",
  reviewNote: "All submitted abstracts will be reviewed by the PRIS scientific committee according to the review process.",
  reviewNoteTh: "บทคัดย่อทั้งหมดที่ส่งมาจะได้รับการพิจารณาโดยคณะกรรมการวิชาการ PRIS ตามกระบวนการ",
  noMediaNote: "Pictures/Graphs/Tables are not allowed.",
  noMediaNoteTh: "ไม่อนุญาตให้แนบรูปภาพ กราฟ หรือตาราง",

  abstractStructure: [
    { title: "Title", titleTh: "ชื่อเรื่อง", desc: "Concise and informative", descTh: "กระชับและให้ข้อมูลที่ชัดเจน" },
    { title: "Authors and Affiliations", titleTh: "ผู้นิพนธ์และสังกัด", items: ["Full names of all authors", "Institution(s), city, and country", "Presenting author clearly indicated"], itemsTh: ["รายชื่อและนามสกุลเต็มของผู้นิพนธ์ทุกคน", "สังกัด เมือง และประเทศ", "ระบุผู้นำเสนอให้ชัดเจน"] },
    { title: "Background", titleTh: "ความเป็นมาและความสำคัญ", items: ["Brief context and rationale", "Clearly state the problem or gap"], itemsTh: ["บริบทโดยสั้นและเหตุผล", "ระบุปัญหาหรือช่องว่างให้ชัดเจน"] },
    { title: "Objectives", titleTh: "วัตถุประสงค์", desc: "Clear and specific study objectives", descTh: "ระบุวัตถุประสงค์การวิจัยอย่างชัดเจนและเฉพาะเจาะจง" },
    { title: "Methods", titleTh: "รูปแบบและวิธีการวิจัย", items: ["Study design", "Setting and participants", "Interventions/exposures", "Outcomes and statistical analysis"], itemsTh: ["รูปแบบการวิจัย", "สถานที่และผู้เข้าร่วมวิจัย", "สิ่งแทรกแซง/การรับประทานยา", "ผลการประเมินและการวิเคราะห์ข้อมูลทางสถิติ"] },
    { title: "Results", titleTh: "ผลการศึกษา", desc: "Key findings", descTh: "ข้อค้นพบหลัก" },
    { title: "Conclusions", titleTh: "สรุปผลการศึกษา", desc: "Clinical or research implications", descTh: "นัยยะทางคลินิกหรือการวิจัย" },
  ],

  maxWordLimit: "300 words (excluding title, authors and affiliation)",
  maxWordLimitTh: "300 คำ (ไม่รวมชื่อเรื่อง ผู้นิพนธ์ และสังกัด)",

  formatting: [
    "Font: Times New Roman or Arial",
    "Font size: 12 pt",
    "Line spacing: Single",
    "Use standard abbreviations (define at first use)",
    "No tables, figures, or references allowed",
  ],
  formattingTh: [
    "แบบอักษร: Times New Roman หรือ Arial",
    "เป็น font ขนาด 12",
    "ระยะห่างระหว่างบรรทัด: ระยะบรรทัดเดียว",
    "ใช้คำย่อมาตรฐาน (อธิบายเมื่อใช้งานครั้งแรก)",
    "ไม่อนุญาตให้มีตาราง รูปภาพ และเอกสารอ้างอิง",
  ],

  policies: {
    declaration: [
      "Abstracts must not have been published or presented at any other conference.",
      "The authors grant the PRIS 2026 Organizing Committee a royalty-free, irrevocable, and non-exclusive right to publish, reproduce, distribute, display or otherwise use the submitted abstracts.",
      "The authors will also retain the copyright of their abstracts.",
    ],
    declarationTh: [
      "บทคัดย่อต้องไม่เคยตีพิมพ์หรือนำเสนอในการประชุมอื่นมาก่อน",
      "ผู้นิพนธ์มอบสิทธิ์ขาดที่ไม่อาจเพิกถอนและไม่ผูกขาดให้แก่คณะกรรมการจัดการประชุม PRIS 2026 ในการตีพิมพ์ คัดลอก แจกจ่าย แสดง หรือใช้บทคัดย่อที่ส่งมา",
      "ลิขสิทธิ์ของบทคัดย่อยังคงเป็นของผู้นิพนธ์",
    ],
    acceptance: [
      "Acceptance notification will be sent to the abstract submitter only.",
      "After receiving the result notification, the presenting author must complete the required participation confirmation. Registration fees and payment deadlines follow the current PRIS 2026 registration policy displayed on this website and in the result email.",
    ],
    acceptanceTh: [
      "การแจ้งผลการพิจารณาจะถูกส่งให้ผู้ส่งรายงานเท่านั้น",
      "หลังได้รับอีเมลแจ้งผล ผู้นำเสนอต้องดำเนินการยืนยันการเข้าร่วมตามที่กำหนด โดยอัตราค่าลงทะเบียนและกำหนดเวลาชำระเงินให้เป็นไปตามนโยบายการลงทะเบียน PRIS 2026 ปัจจุบันที่แสดงบนเว็บไซต์นี้และในอีเมลแจ้งผล",
    ],
    withdrawal: "Authors who wish to withdraw an abstract should send a written request to the secretariat at pr@pharmacycouncil.org.",
    withdrawalTh: "ผู้ประพันธ์ที่ต้องการถอนบทคัดย่อควรส่งคำขอเป็นลายลักษณ์อักษรถึงสำนักเลขาธิการที่ pr@pharmacycouncil.org",
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
    keywords: "Keywords (comma separated, max 6)",
    abstractFile: "Abstract File (PDF only)",
  },
  placeholders: {
    name: "e.g. Somchai",
    institution: "University, Hospital, or Organization",
    keywords: "e.g. Pharmacy, Clinical, Research",
  },
};

export const abstractStatusLabels = {
  summary: {
    total: "Total Submitted",
    totalTh: "ส่งผลงานทั้งหมด",
    accepted: "Accepted",
    acceptedTh: "ยอมรับแล้ว",
    pending: "Under Review",
    pendingTh: "กำลังตรวจสอบ",
    rejected: "Rejected",
    rejectedTh: "ไม่ผ่านการพิจารณา",
  },
  table: {
    id: "Tracking ID",
    idTh: "รหัสติดตาม",
    title: "Abstract Title",
    titleTh: "ชื่อเรื่อง",
    date: "Submitted Date",
    dateTh: "วันที่ส่ง",
    status: "Status",
    statusTh: "สถานะ",
    actions: "Actions",
    actionsTh: "จัดการ",
  },
  statusText: {
    pending: "Under Review",
    pendingTh: "กำลังตรวจสอบ",
    accepted: "Accepted",
    acceptedTh: "ยอมรับแล้ว",
    rejected: "Rejected",
    rejectedTh: "ไม่ผ่านการพิจารณา",
    revision: "Revision Required",
    revisionTh: "ต้องแก้ไข",
  },
};
