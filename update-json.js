const fs = require('fs');

const en = JSON.parse(fs.readFileSync('messages/en.json'));
const th = JSON.parse(fs.readFileSync('messages/th.json'));

const newEn = {
  stage: 'Stage',
  previousPhase: 'Previous Phase',
  proceedToNextStage: 'Proceed to Next Stage',
  submitFinalAbstract: 'Submit Final Abstract',
  submissionComplete: 'Submission Complete',
  successDesc: 'Submission complete.\nPlease wait for approval via Email.',
  successDescEn: 'Please wait for approval via Email.',
  returnToHomepage: 'Return to Homepage',
  step1: {
    title1: 'Presenting',
    title2: 'Author',
    subtitle: 'The primary voice of your research.',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    affiliation: 'Affiliation / Institution',
    phone: 'Phone Number'
  },
  step2: {
    title1: 'Co-',
    title2: 'Authors',
    subtitle: 'Include all contributors who made this possible.',
    empty: 'No co-authors added yet. (Optional)',
    firstName: 'First Name',
    lastName: 'Last Name',
    affiliation: 'Institution / Affiliation',
    email: 'Email Address (Contact)'
  },
  step3: {
    title1: 'Abstract',
    title2: 'Details',
    subtitle: 'The identity and core focus of your work.',
    abstractTitle: 'Complete Abstract Title',
    abstractTitlePlaceholder: 'ALL CAPS STRONGLY RECOMMENDED',
    category: 'Submission Theme',
    selectCategory: 'Select Category',
    mode: 'Presentation Mode',
    oral: 'Oral',
    poster: 'Poster',
    keywords: 'Key Terminologies (Semicolon separated)',
    keywordsPlaceholder: 'e.g. Pharmacy; Clinical; Outcomes'
  },
  step4: {
    title1: 'Body &',
    title2: 'File',
    subtitle: 'Structure your abstract and provide the documentation.',
    background: 'Background',
    objectives: 'Objectives',
    methods: 'Methods',
    results: 'Results',
    conclusions: 'Conclusions',
    documentLabel: 'Full Abstract Document (PDF FORMAT ONLY)',
    addDoc: 'Add Documents',
    docLimit: 'PDF Document Only (Max 5MB)'
  },
  step5: {
    title1: 'Manuscript',
    title2: 'Verification',
    subtitle: 'Phaze 05 / Final Audit Protocol',
    category: 'Category',
    presentation: 'Presentation',
    mode: 'Mode',
    fullTitle: 'Full Research Title',
    pi: 'Principal Investigator',
    coauthors: 'Supporting Contributors',
    noCoauthors: 'No additional authors identified.',
    contentOverview: 'Abstract Content Overview',
    keywords: 'Keywords',
    none: 'None provided',
    attachedDocs: 'Attached Document(s)',
    pdfDoc: 'PDF Document',
    noDocs: 'No Documents',
    required: 'Required',
    untitled: 'Untitled Research Submission',
    generalPharmacy: 'General Pharmacy'
  }
};

const newTh = {
  stage: 'ขั้นตอนที่',
  previousPhase: 'ย้อนกลับ',
  proceedToNextStage: 'ดำเนินการต่อ',
  submitFinalAbstract: 'ส่งบทคัดย่อออนไลน์',
  submissionComplete: 'ส่งข้อมูลสำเร็จ',
  successDesc: 'ส่ง Abstract เสร็จสิ้นแล้ว\nรอรับการอนุมัติผ่านทาง Email',
  successDescEn: 'Please wait for approval via Email.',
  returnToHomepage: 'กลับสู่หน้าหลัก',
  step1: {
    title1: 'ข้อมูล',
    title2: 'ผู้นำเสนอผลงาน',
    subtitle: 'ข้อมูลเบื้องต้นในการใช้ติดต่อสำหรับการนำเสนอผลงาน',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    email: 'อีเมล',
    affiliation: 'หน่วยงาน / สถาบัน',
    phone: 'เบอร์โทรศัพท์'
  },
  step2: {
    title1: 'ผู้ร่วม',
    title2: 'วิจัย',
    subtitle: 'ข้อมูลของผู้ร่วมพัฒนาผลงานวิจัยนี้ทั้งหมด',
    empty: 'ยังไม่มีข้อมูลผู้ร่วมวิจัย (ไม่บังคับ)',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    affiliation: 'หน่วยงาน / สถาบัน',
    email: 'อีเมล'
  },
  step3: {
    title1: 'ราย',
    title2: 'ละเอียด',
    subtitle: 'หัวข้อและประเภทในการนำเสนอผลงาน',
    abstractTitle: 'ชื่อเรื่องบทคัดย่อ',
    abstractTitlePlaceholder: 'แนะนำให้ใช้ตัวพิมพ์ใหญ่ทั้งหมด (สำหรับภาษาอังกฤษ)',
    category: 'กลุ่มผลงานวิชาการ',
    selectCategory: 'เลือกกลุ่มผลงาน',
    mode: 'รูปแบบการนำเสนอ',
    oral: 'นำเสนอด้วยวาจา (Oral)',
    poster: 'นำเสนอแบบโปสเตอร์ (Poster)',
    keywords: 'คำสำคัญ (คั่นด้วยเครื่องหมายอัฒภาค ;)',
    keywordsPlaceholder: 'เช่น Pharmacy; Clinical; Outcomes'
  },
  step4: {
    title1: 'เนื้อหา &',
    title2: 'ไฟล์',
    subtitle: 'โครงสร้างขอองบทคัดย่อและเอกสารแนบ',
    background: 'ที่มาและความสำคัญ (Background)',
    objectives: 'วัตถุประสงค์ (Objectives)',
    methods: 'วิธีดำเนินการวิจัย (Methods)',
    results: 'ผลการวิจัย (Results)',
    conclusions: 'สรุปผลการวิจัย (Conclusions)',
    documentLabel: 'ไฟล์เอกสารบทคัดย่อฉบับเต็ม (เฉพาะไฟล์ PDF เท่านั้น)',
    addDoc: 'เพิ่มเอกสาร',
    docLimit: 'เฉพาะไฟล์ PDF เท่านั้น (ขนาดสูงสุด 5MB)'
  },
  step5: {
    title1: 'การยืนยัน',
    title2: 'ข้อมูล',
    subtitle: 'ขั้นตอนที่ 05 / ตรวจสอบข้อมูลก่อนส่ง',
    category: 'กลุ่มผลงาน',
    presentation: 'การนำเสนอ',
    mode: 'รูปแบบ',
    fullTitle: 'ชื่อบทคัดย่อแบบเต็ม',
    pi: 'ผู้วิจัยหลัก',
    coauthors: 'ผู้ร่วมวิจัย',
    noCoauthors: 'ไม่มีผู้ร่วมวิจัย',
    contentOverview: 'ภาพรวมเนื้อหาบทคัดย่อ',
    keywords: 'คำสำคัญ',
    none: 'ไม่ได้ระบุ',
    attachedDocs: 'เอกสารแนบ',
    pdfDoc: 'ไฟล์เอกสาร PDF',
    noDocs: 'ไม่มีไฟล์เอกสารแนบ',
    required: 'จำเป็นต้องแนบ',
    untitled: 'ไม่มีชื่อเรื่องบทคัดย่อ',
    generalPharmacy: 'เภสัชกรรมทั่วไป'
  }
};

en.abstractSubmission = Object.assign({}, en.abstractSubmission, newEn);
th.abstractSubmission = Object.assign({}, th.abstractSubmission, newTh);

fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('messages/th.json', JSON.stringify(th, null, 2));
console.log('done');

