export const abstractTimeline = [
  {
    label: "Abstract Submission Round 1",
    labelTh: "Abstract รอบ 1",
    date: "15 May - 10 June 2026",
    dateTh: "15 พฤษภาคม 2569 - 10 มิถุนายน 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Abstract Submission Round 1 Result Announcement",
    labelTh: "ประกาศผล Abstract รอบที่ 1",
    date: "20 June 2026",
    dateTh: "20 มิถุนายน 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Abstract Submission Round 2",
    labelTh: "Abstract รอบ 2",
    date: "1 July - 31 August 2026",
    dateTh: "1 กรกฎาคม 2569 - 31 สิงหาคม 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Abstract Submission Round 2 Result Announcement",
    labelTh: "ประกาศผล Abstract รอบที่ 2",
    date: "10 September 2026",
    dateTh: "10 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
];
export const abstractCategories = [
  { id: 1, title: "Clinical Pharmacy / Patient Care", titleTh: "เภสัชกรรมคลินิก / การดูแลผู้ป่วย" },
  { id: 2, title: "Social and Administrative Pharmacy", titleTh: "เภสัชกรรมสังคมและบริหาร" },
  { id: 3, title: "Pharmaceutical Sciences and Medication Management", titleTh: "วิทยาศาสตร์เภสัชกรรมและการจัดการด้านยา" },
  { id: 4, title: "Pharmacology and Pharmacogenomics", titleTh: "เภสัชวิทยาและเภสัชพันธุศาสตร์" },
  { id: 5, title: "Pharmacy Education", titleTh: "เภสัชศาสตรศึกษา" },
  { id: 6, title: "Digital Pharmacy and Health Technology", titleTh: "เภสัชกรรมดิจิทัลและเทคโนโลยีสุขภาพ" },
];

export const submissionGuidelines = {
  intro: "The Organising Scientific Committee of the Pharmaceutical Research and Innovation Symposium (PRIS 2026) invites you to submit an abstract. Please see guidelines below for the required format of the abstracts. Each abstract will undergo a peer review process.",
  introTh: "คณะกรรมการจัดการประชุมวิชาการ PRIS 2026 ขอเชิญร่วมส่งบทคัดย่อ โปรดดูคำแนะนำในการจัดรูปแบบบทคัดย่อด้านล่าง บทคัดย่อแต่ละเรื่องจะได้รับการพิจารณาโดยผู้ทรงคุณวุฒิ",

  importantDates: [
    {
      label: "Abstract Submission Round 1",
      labelTh: "Abstract รอบ 1",
      value: "15 May - 10 June 2026",
      valueTh: "15 พฤษภาคม 2569 - 10 มิถุนายน 2569",
      highlight: true,
    },
    {
      label: "Abstract submission round 1 result announcement",
      labelTh: "ประกาศผล Abstract รอบที่ 1",
      value: "20 June 2026",
      valueTh: "20 มิถุนายน 2569",
    },
    {
      label: "Abstract submission round 2",
      labelTh: "Abstract รอบที่ 2",
      value: "1 July - 31 August 2026",
      valueTh: "1 กรกฎาคม 2569 - 31 สิงหาคม 2569",
    },
    {
      label: "Abstract submission round 2 result announcement",
      labelTh: "ประกาศผล Abstract รอบที่ 2",
      value: "10 September 2026",
      valueTh: "10 กันยายน 2569",
    },
  ],
  importantDatesReservationNote: "This consideration is reserved only for participants who submit an abstract in Round 1 and receive an approved abstract.",
  importantDatesReservationNoteTh: "หมายเหตุ: สิทธินี้จะมอบให้เฉพาะผู้ที่ส่งผลงานในรอบที่ 1 และได้รับการยืนยันผลการพิจารณา (Approved Abstracts) เป็นที่เรียบร้อยแล้วเท่านั้น",
  presenterRegistrationNote: "Authors whose Round 1 abstracts are approved will receive the Early Bird registration rate (THB 1,250) even if the approval is granted after the Early Bird period ends.",
  presenterRegistrationNoteTh: "ผู้ส่งบทคัดย่อในรอบที่ 1 และได้รับการอนุมัติ จะได้รับสิทธิ์ลงทะเบียนในราคา Early Bird (1,250 บาท) แม้ว่าจะพ้นช่วงเวลาดังกล่าวไปแล้ว",
  presenterRegistrationNoteSegments: [
    { text: "If you " },
    { text: "submit your abstract during Round 1", accent: true },
    { text: " (15 May - 10 June 2026) and your abstract " },
    { text: "must be approved only", accent: true },
    { text: ", you will still be eligible for the Early Bird registration rate of THB 1,250 even if approval is granted after the Early Bird period has ended." },
  ],
  presenterRegistrationNoteSegmentsTh: [
    { text: "สำหรับท่านที่ส่งบทคัดย่อ (Abstract) ภายในช่วงเวลา " },
    { text: "รอบที่ 1 คือวันที่ 15 พฤษภาคม – 10 มิถุนายน 2569", accent: true },
    { text: " ท่านจะยังคงได้รับสิทธิ์ซื้อบัตรเข้างานในราคา Early Bird 1,250 บาท แม้จะพ้นกำหนดช่วงเวลาดังกล่าวไปแล้ว " },
    { text: "หากบทคัดย่อของท่านได้รับการอนุมัติให้เข้าร่วมนำเสนอผลงาน", accent: true },
  ],

  generalInformation: [
    { label: "Presentation type", labelTh: "ประเภทการนำเสนอ (กรุณาเลือกหนึ่งประเภท)", value: "Poster presentation / Oral presentation", valueTh: "นำเสนอแบบโปสเตอร์ / นำเสนอแบบปากเปล่า" },
    { label: "Language", labelTh: "ภาษาที่ใช้ในการนำเสนอ", value: "Thai", valueTh: "ภาษาไทยเท่านั้น" },
  ],

  abstractTopics: [
    "Clinical Pharmacy",
    "Social and Administrative Pharmacy",
    "Community Pharmacy",
    "Pharmacology",
    "Pharmacy Education",
    "Digital Pharmacy and Innovation",
  ],
  abstractTopicsTh: [
    "เภสัชกรรมคลินิก",
    "เภสัชกรรมสังคมและบริหาร",
    "เภสัชกรรมชุมชน",
    "เภสัชวิทยา",
    "เภสัชศาสตรศึกษา",
    "เภสัชกรรมดิจิทัลและนวัตกรรม",
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
    "ภาษาที่ใช้ในการนำเสนอ: ภาษาไทยเท่านั้น",
  ],
  acknowledgementNote: "Notification of acceptance will be sent automatically to the abstract submitter only. Please contact the secretariat at pris2026@pharmacy.org if you do not receive the confirmation email.",
  acknowledgementNoteTh: "การแจ้งผลการพิจารณาจะถูกส่งให้ผู้ส่งรายงานเท่านั้น กรุณาติดต่อเลขาธิการที่ pris2026@pharmacy.org หากท่านไม่ได้รับอีเมลยืนยัน",
  reviewNote: "All submitted abstracts will be reviewed by the PRIS scientific committee according to the review process.",
  reviewNoteTh: "บทคัดย่อทั้งหมดที่ส่งมาจะได้รับการพิจารณาโดยคณะกรรรมการวิชาการ PRIS ตามกระบวนการ",
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
    "Font size: 11–12 pt",
    "Line spacing: Single",
    "Use standard abbreviations (define at first use)",
    "No tables, figures, or references allowed",
  ],
  formattingTh: [
    "แบบอักษร: Times New Roman หรือ Arial",
    "ขนาดเส้นผ่าน: 11–12 pt",
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
      "On receiving the acceptance notification, the abstract submitter must confirm attendance of the presenting author and instruct the presenting author to register no later than 30th June 2026 and pay the registration fee in full by 30th June 2026.",
      "Accepted abstracts whose presenting author does not register and pay in full by then will be automatically withdrawn.",
    ],
    acceptanceTh: [
      "การแจ้งผลการพิจารณาจะถูกส่งให้ผู้ส่งรายการเท่านั้น",
      "เมื่อได้รับแจ้งสถานะการรับผลงาน ผู้ส่งรายการต้องยืนยันการเข้าร่วมของผู้เสนอผลงานและแจ้งให้ผู้นำเสนอลงทะเบียนภายในวันที่ 30 มิถุนายน 2569 และชำระค่าลงทะเบียนเต็มจำนวนภายในวันที่ 30 มิถุนายน 2569",
      "บทคัดย่อที่ได้รับสถานะการรับจะถูกยกเลิกโดยอัตโนมัติหากผู้นำเสนอไม่ได้ลงทะเบียนและชำระค่าลงทะเบียนตามวันกำหนด",
    ],
    withdrawal: "Authors who want to withdraw an abstract should send a written request to the secretariat at pris2026@pharmacy.org by 30th June 2026.",
    withdrawalTh: "ผู้ประพันธ์ที่ต้องการยกเลิกบทคัดย่อควรส่งข้อความการขอร้องเขียนให้สำนักงานกลางที่ pris2026@pharmacy.org ก่อนวันที่ 30 มิถุนายน 2569",
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
