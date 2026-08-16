import { ScheduleDay } from "@/types";

const day1Event = (
  id = 0,
  time = "",
  title = "",
  titleTh = "",
  location = "",
  locationTh = "",
  type = "Session",
  typeTh = "กิจกรรม",
  track = "",
  group = "",
) => ({
  id,
  time,
  title,
  titleTh,
  location,
  locationTh,
  type,
  typeTh,
  track,
  trackTh:
    track === "Common"
      ? "ทั่วไป"
      : track === "INNOVATION ZONE"
      ? "INNOVATION ZONE"
      : `ห้อง ${track}`,
  ...(group ? { group } : {}),
  speakers: [],
});

const day1Events = [
  day1Event(
    1001,
    "08:00 – 09:00",
    "Registration",
    "ลงทะเบียนผู้เข้าร่วมประชุม (Registration)",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Registration",
    "ลงทะเบียน",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      1002,
      "08:00 – 11:00",
      "PSAT Health Hack 2026",
      "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
      "JUPITER 12–13",
      "ห้อง JUPITER 12–13",
      "Activity",
      "กิจกรรม",
      "JUPITER 12"
    ),
    spanTracks: ["JUPITER 12", "JUPITER 13"],
  },
  {
    ...day1Event(
      1003,
      "09:00 – 09:10",
      "Opening Report and PRIS2026 Opening Video",
      "กล่าวรายงาน พร้อมรับชม PRIS2026 Opening Video",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Ceremony",
      "พิธีการ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Prof. Dr. Pharm. Chonlaphat Sukasem",
        nameTh: "ศ.ดร.ภก. ชลภัทร สุขเกษม",
      },
    ],
  },
  {
    ...day1Event(
      1004,
      "09:10 – 09:30",
      "Opening Ceremony: National Conference on Pharmacy Research and Innovation",
      "พิธีเปิด \"งานประชุมวิชาการ วิจัย และนวัตกรรมทางเภสัชกรรมระดับชาติ\"",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Ceremony",
      "พิธีการ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Mr. Pattana Prompat (Minister of Public Health)",
        nameTh: "นายพัฒนา พร้อมพัฒน์ (รัฐมนตรีว่าการกระทรวงสาธารณสุข)",
      },
    ],
  },
  {
    ...day1Event(
      1005,
      "09:30 – 10:00",
      "Keynote: Transforming Pharmacy under Ministry of Public Health Policy",
      "ปาฐกถาพิเศษ พลิกโฉมงานเภสัชกรรมภายใต้นโยบายกระทรวงสาธารณสุข",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Keynote",
      "ปาฐกถาพิเศษ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Mr. Pattana Prompat (Minister of Public Health)",
        nameTh: "นายพัฒนา พร้อมพัฒน์ (รัฐมนตรีว่าการกระทรวงสาธารณสุข)",
      },
      {
        name: "President, Secretary-General and Board Members of the Pharmacy Council",
        nameTh: "นายกสภาเภสัชกรรม/เลขาธิการสภาเภสัชกรรม/กรรมการสภาเภสัชกรรม",
        role: "Chair",
        roleTh: "Chair",
      },
    ],
  },
  {
    ...day1Event(
      1006,
      "10:00 – 10:30",
      "Pharmacy Exhibition and Innovation Showcase",
      "เยี่ยมชมนิทรรศการแสดงผลงานและนวัตกรรมด้านเภสัชกรรมจากหน่วยงานภาครัฐ ภาคเอกชน และสถาบันการศึกษา",
      "JUPITER 4-7–11",
      "ห้อง JUPITER 4-7–11",
      "Activity",
      "เยี่ยมชมนิทรรศการ",
      "JUPITER 4-7"
    ),
    spanTracks: ["JUPITER 4-7", "JUPITER 11"],
  },
  day1Event(
    1007,
    "10:30 – 11:00",
    "Coffee Break",
    "Coffee Break",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Break",
    "พัก",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      1008,
      "10:30 – 13:00",
      "Policy Workshop",
      "Policy Workshop",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Workshop",
      "เวิร์กชอป",
      "JUPITER 11"
    ),
    description:
      "Organized by the Pharmacy Council, conducted by Asst. Prof. Dr. Jitsuda Limkriengkrai and team, Faculty of Social Sciences and Humanities, Mahidol University",
    descriptionTh:
      "จัดโดย สภาเภสัชกรรม\nโดย ผศ.ดร.จิตรสุดา ลิมเกรียงไกร และทีมงาน\nคณะสังคมศาสตร์และมนุษยศาสตร์ มหาวิทยาลัยมหิดล",
    speakers: [
      {
        name: "Asst. Prof. Dr. Jitsuda Limkriengkrai and team (Faculty of Social Sciences and Humanities, Mahidol University)",
        nameTh:
          "ผศ.ดร.จิตรสุดา ลิมเกรียงไกร และทีมงาน (คณะสังคมศาสตร์และมนุษยศาสตร์ มหาวิทยาลัยมหิดล)",
      },
    ],
  },
  {
    ...day1Event(
      1009,
      "11:00 – 11:50",
      "Unlocking Professional Potential: Experiences from Pharmacist Role Models",
      "ปลดล็อคศักยภาพสู่ความก้าวหน้าทางวิชาชีพเภสัชกรรม: ประสบการณ์จากเภสัชกรต้นแบบ",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Session",
      "เสวนา",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Pharm. Suttinee Ruangsuphan",
        nameTh:
          "ภญ.สุทธินี เรืองสุพันธุ์ (เภสัชกรเชี่ยวชาญ/รองนายแพทย์สาธารณสุขจังหวัดนครราชสีมา)",
      },
      {
        name: "Pharm. Teerawit Bamrungsri",
        nameTh:
          "ภก.ธีรวิทย์ บำรุงศรี (เภสัชกรเชี่ยวชาญ/ประธานชมรมเภสัชกรโรงพยาบาล/กระทรวงสาธารณสุข)",
      },
      {
        name: "Pharm. Areewan Thongkhundam",
        nameTh:
          "ภญ.อารีวรรณ ทองขุนดำ (เภสัชกรชำนาญการ/กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค รพ.เขาชัยสน จ.พัทลุง)",
      },
      {
        name: "Assoc. Prof. Pharm. Sunee Lertsinudom",
        nameTh: "รศ.ภญ.สุณี เลิศสินอุดม (เลขาธิการสภาเภสัชกรรม)",
      },
      {
        name: "Pharm. Udomlak Rangsiyapornrat",
        nameTh:
          "ภญ.อุดมลักษณ์ รังสิยาภรณ์รัตน์ (เภสัชกรเชี่ยวชาญ/หัวหน้ากลุ่มงานเภสัชกรรม รพ.อุดรธานี)",
        role: "Moderator",
        roleTh: "ผู้ดำเนินรายการ",
      },
    ],
  },
  {
    ...day1Event(
      1010,
      "11:00 – 11:50",
      "Health Consumer Protection Indicators in the AI Era",
      "ตัวชี้วัดการคุ้มครองผู้บริโภคด้านสุขภาพในยุค AI",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Session",
      "เสวนา",
      "JUPITER 12"
    ),
    description:
      "Organized by the College of Consumer Protection, Royal College of Pharmacy of Thailand",
    descriptionTh:
      "จัดโดย วิทยาลัยคุ้มครองผู้บริโภค ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    speakers: [
      {
        name: "Pharm. Netnapis Suchonwanich",
        nameTh:
          "ภญ.เนตรนภิส สุชนวานิช (ที่ปรึกษาโครงการ AI ธรรมนูญสุขภาพแห่งชาติ)",
      },
      {
        name: "Assoc. Prof. Dr. Pharm. Wanna Sriviriyanupap",
        nameTh:
          "รศ.ภญ.ดร.วรรณา ศรีวิริยานุภาพ (ประธานวิทยาลัยการคุ้มครองผู้บริโภคด้านยาและสุขภาพ)",
      },
      {
        name: "Dr. Pharm. Tipicha Posayanonda",
        nameTh:
          "ภญ.ดร.ทิพิชา โปษยานนท์ (รองเลขาธิการ สำนักงานคณะกรรมการสุขภาพแห่งชาติ)",
      },
      {
        name: "Assoc. Prof. Dr. Pharm. Surasak Saokaew",
        nameTh:
          "รศ.ภก.ดร.สุรศักดิ์ เสาแก้ว (คณบดีคณะเภสัชศาสตร์ มหาวิทยาลัยพะเยา)",
        role: "Moderator",
        roleTh: "ผู้ดำเนินรายการ",
      },
    ],
  },
  {
    ...day1Event(
      1011,
      "11:00 – 11:50",
      "Driving Thai Herbs to the Future: Connecting Upstream, Creating Midstream Value, and Generating Downstream Worth",
      "ขับเคลื่อนสมุนไพรไทยสู่อนาคต: เชื่อมโยงต้นน้ำ สร้างคุณค่ากลางน้ำ สร้างมูลค่าปลายน้ำ",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Session",
      "เสวนา",
      "JUPITER 13"
    ),
    description:
      "Organized by the College of Herbal Pharmacy, Royal College of Pharmacy of Thailand",
    descriptionTh:
      "จัดโดย วิทยาลัยเภสัชกรรมสมุนไพร ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    speakers: [
      {
        name: "Dr. Pharm. Supaporn Pitiporn",
        nameTh:
          "ดร.ภญ.สุภาภรณ์ ปิติพร (ประธานกรรมการบริหารมูลนิธิโรงพยาบาลเจ้าพระยาอภัยภูเบศร)",
      },
      {
        name: "Prof. Dr. Pharm. Pol. Capt. Suchada Sukrong",
        nameTh:
          "ศ.ดร.ภญ.ร.ต.อ.หญิง สุชาดา สุขหร่อง (ผู้อำนวยการสถาบันนวัตกรรมบูรณาการแห่งจุฬาลงกรณ์มหาวิทยาลัย)",
      },
      {
        name: "Pharm. Supatra Boonserm",
        nameTh: "ภญ.สุภัทรา บุญเสริม (เลขาธิการคณะกรรมการอาหารและยา)",
      },
      {
        name: "Assoc. Prof. Dr. Pharm. Narisa Kamkaen",
        nameTh: "รศ.ดร.ภญ.นริศา คำแก่น (ประธานวิทยาลัยเภสัชกรรมสมุนไพร)",
        role: "Moderator",
        roleTh: "ผู้ดำเนินรายการ",
      },
    ],
  },
  {
    ...day1Event(
      1033,
      "11:00 – 12:00",
      "Poster Presentation: Pharmaceutical Care (PharmCare)",
      "Poster Presentation สาขาการบริบาลทางเภสัชกรรม (PharmCare)",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 1",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 1"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      1034,
      "11:00 – 12:00",
      "Poster Presentation: Pharmaceutical Science (PharmSci)",
      "Poster Presentation สาขาวิทยาศาสตร์เภสัชกรรม (PharmSci)",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 2",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 2"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      1035,
      "11:00 – 12:00",
      "Poster Presentation: Pharmacy Administration, Drug Consumer Protection, and Digital Pharmacy",
      "Poster Presentation สาขาบริหารเภสัชกิจ คุ้มครองผู้บริโภคด้านยา ดิจิทัลเภสัชกรรม",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 3",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 3"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  day1Event(
    1012,
    "12:00 – 12:30",
    "Lunch Symposium 1",
    "Lunch Symposium 1",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Lunch",
    "บรรยาย",
    "JUPITER 4-7"
  ),
  day1Event(
    1013,
    "12:30 – 13:00",
    "Lunch Symposium 2",
    "Lunch Symposium 2",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Lunch",
    "บรรยาย",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      1014,
      "13:00 – 14:00",
      "Pharmacy in 2036",
      "Pharmacy in 2036",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Session",
      "เสวนา",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Assoc. Prof. (Special) Pharm. Kitti Pitaknitinan",
        nameTh:
          "รศ.(พิเศษ) ภก.กิตติ พิทักษ์นิตินันท์ (ที่ปรึกษาสภาเภสัชกรรม และอดีตนายกสภาเภสัชกรรม)",
      },
      {
        name: "Prof. Dr. Pharm. Pornsak Sriamornsak",
        nameTh:
          "ศ.ดร.ภก.พรศักดิ์ ศรีอมรศักดิ์ (ราชบัณฑิต และประธานสภาคณบดีเภสัชศาสตร์แห่งประเทศไทย)",
      },
      {
        name: "Assoc. Prof. Pharm. Preecha Montakantikul",
        nameTh: "รศ.ภก.ปรีชา มนทกานติกุล (ผู้ช่วยเลขาธิการสภาเภสัชกรรม)",
      },
      {
        name: "Prof. Dr. Pharm. Chonlaphat Sukasem",
        nameTh: "ศ.ดร.ภก.ชลภัทร สุขเกษม (ผู้ช่วยเลขาธิการสภาเภสัชกรรม)",
      },
      {
        name: "Assoc. Prof. Pharm. Sunee Lertsinudom",
        nameTh: "รศ.ภญ.สุณี เลิศสินอุดม (เลขาธิการสภาเภสัชกรรม)",
        role: "Moderator",
        roleTh: "ผู้ดำเนินรายการ",
      },
    ],
  },
  {
    ...day1Event(
      1015,
      "13:00 – 14:00",
      "Roadmap for Thai Community Pharmacy: Policies, Directions, and Shared Future",
      "Roadmap เภสัชกรรมชุมชนไทย: นโยบาย ทิศทาง และอนาคตร่วมของวิชาชีพ",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Session",
      "เสวนา",
      "JUPITER 11"
    ),
    description:
      "Organized by the College of Community Pharmacy and Community Pharmacy Association",
    descriptionTh:
      "จัดโดย วิทยาลัยเภสัชกรรมชุมชน และ สมาคมเภสัชกรรมชุมชน",
  },
  {
    ...day1Event(
      1016,
      "13:00 – 14:00",
      "Future Pharmacy Practice: Advanced Therapy Medicinal Products (ATMP), Radiopharmacy and Wellness pharmacy",
      "Future Pharmacy Practice : Advanced Therapy Medicinal Products (ATMP), Radiopharmacy and Wellness pharmacy",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Session",
      "เสวนา",
      "JUPITER 12"
    ),
    speakers: [
      {
        name: "Asst. Prof. Dr. Pharm. Rotjaporn Watcharotayankun",
        nameTh:
          "ผศ.ดร.ภญ.รจพร วัชโรทยางกูร (ประธานอนุกรรมการ ATMP สภาเภสัชกรรม)",
      },
      {
        name: "Pharm. Moleepan Dangprasert",
        nameTh:
          "ภญ.โมฬีพัณณ์ แดงประเสริฐ (ผู้จัดการศูนย์ไอโซโทปรังสี ณ สถาบันเทคโนโลยีนิวเคลียร์แห่งชาติ (องค์การมหาชน) และอนุกรรมการเภสัชภัณฑ์รังสี สภาเภสัชกรรม)",
      },
      {
        name: "Pharm. Warawut Sermsinsiri",
        nameTh:
          "ภก.วราวุธ เสริมสินสิริ (ผู้อำนวยการกองยุทธศาสตร์และแผนงาน สำนักงานคณะกรรมการอาหารและยา)",
      },
    ],
  },
  {
    ...day1Event(
      1017,
      "13:00 – 14:00",
      "Panel Discussion: The Future of Thai Pharmacy through the Eyes of the New Generation",
      "เวทีเสวนา: มองอนาคตเภสัชกรรมไทยผ่านมุมมองของน้องๆ เภสัชกรรุ่นใหม่",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Session",
      "เสวนา",
      "JUPITER 13"
    ),
    description:
      "Organized by the Pharmacy Council and Thai Young Pharmacist Group (Thai YPG)",
    descriptionTh:
      "จัดโดย สภาเภสัชกรรม และชมรม Thai Young Pharmacist Group (Thai YPG)",
    speakers: [
      {
        name: "Pharm. Natchanon Sathapanaphithakkij",
        nameTh:
          "ภก.ณัฐชนน สถาปนพิทักษ์กิจ (งานผลิตยาปราศจากเชื้อ ฝ่ายเภสัชกรรม โรงพยาบาลศิริราช)",
      },
      {
        name: "Pharm. Siraphop Taiwan",
        nameTh: "ภก.สิรภพ ต่ายวัลย์ (ร้านสิรเภสัช)",
      },
      {
        name: "Pharm. Pattaranithiphong Damrongyot",
        nameTh:
          "ภก.พัธรณิธิพงศุ์ ดำรงค์ยศ (บริษัท อินเตอร์ ฟาร์มา จำกัด (มหาชน))",
      },
      {
        name: "Pharm. Pathompong Wimonphusit",
        nameTh:
          "ภก.ปฐมพงศ์ วิมลภูษิต (กลุ่มประเมินและอนุญาตสถานที่ กองยา สำนักงานคณะกรรมการอาหารและยา)",
      },
      {
        name: "Pharm. Malinee Kaewthong",
        nameTh: "ภญ.มาลินี แก้วทอง (S.M. Pharmaceutical Co., Ltd.)",
      },
      {
        name: "Mr. Haranchai Paecharoenchai",
        nameTh:
          "นายหรัณย์ชัย แพเจริญชัย (คณะเภสัชศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ)",
      },
      {
        name: "Ms. Chawanya Songthep",
        nameTh:
          "นางสาวชวัลญา ทรงเทพ (AstraZeneca (Thailand) co., Ltd.)",
        role: "Moderator",
        roleTh: "ผู้ดำเนินรายการ",
      },
    ],
  },
  {
    ...day1Event(
      1018,
      "13:00 – 14:00",
      "Poster Presentation: Digital Pharmacy and Health Informatics",
      "Poster Presentation สาขาเภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 1",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 1"
    ),
    description: "Committee: Digital Pharmacy and Health Informatics Group",
    descriptionTh: "Committee: กลุ่มเภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
  },
  {
    ...day1Event(
      1019,
      "13:00 – 14:00",
      "Poster Presentation: Drug and Health Consumer Protection",
      "Poster Presentation สาขาการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 2",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 2"
    ),
    description: "Committee: College of Drug Consumer Protection",
    descriptionTh: "Committee: วิทยาลัยคุ้มครองผู้บริโภคด้านยา",
  },
  {
    ...day1Event(
      1020,
      "13:00 – 14:00",
      "Poster Presentation: Herbal Pharmacy",
      "สาขาเภสัชกรรมสมุนไพร",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 3",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 3"
    ),
    description: "Committee: College of Herbal Pharmacy",
    descriptionTh: "Committee: วิทยาลัยเภสัชกรรมสมุนไพร",
  },
  {
    ...day1Event(
      1021,
      "13:00 – 14:00",
      "Poster Presentation: Pharmacogenomics and Precision Pharmacy",
      "Poster Presentation สาขาเภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 4",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 4"
    ),
    description: "Committee: College of Pharmacogenomics",
    descriptionTh: "Committee: วิทยาลัยเภสัชพันธุศาสตร์ฯ",
  },
  {
    ...day1Event(
      1022,
      "14:00 – 15:30",
      "Oral Presentation: Clinical Pharmacy and Pharmaceutical Care",
      "Oral Presentation สาขาเภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 4-7"
    ),
    description: "Committee: College of Pharmacotherapy",
    descriptionTh: "Committee: วิทยาลัยเภสัชกรรมบำบัด",
  },
  {
    ...day1Event(
      1023,
      "14:00 – 15:30",
      "Oral Presentation: Community Pharmacy and Professional Practice",
      "Oral Presentation สาขาเภสัชกรรมชุมชนและการปฏิบัติงานวิชาชีพ",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 11"
    ),
    description: "Committee: College of Community Pharmacy",
    descriptionTh: "Committee: วิทยาลัยเภสัชกรรมชุมชน",
  },
  {
    ...day1Event(
      1024,
      "14:00 – 15:30",
      "Oral Presentation: Pharmacy Administration",
      "Oral Presentation สาขาการบริหารเภสัชกิจ",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 12"
    ),
    description: "Committee: College of Pharmacy Administration",
    descriptionTh: "Committee: วิทยาลัยบริหารเภสัชกิจ",
  },
  {
    ...day1Event(
      1025,
      "14:00 – 15:30",
      "Oral Presentation: Pharmaceutical Science, Technology and Industrial Pharmacy",
      "Oral Presentation สาขาเภสัชศาสตร์และเทคโนโลยีเภสัชกรรม และเภสัชกรรมอุตสาหการ",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 13"
    ),
    description: "Committee: College of Industrial Pharmacy",
    descriptionTh: "Committee: วิทยาลัยเภสัชกรรมอุตสาหการ",
  },
  day1Event(
    1026,
    "15:30 – 15:45",
    "Coffee Break",
    "Coffee Break",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Break",
    "พัก",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      1027,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Pharmaceutical Care (PharmCare)",
      "Pharmacy Student Oral Presentation สาขาการบริบาลทางเภสัชกรรม (PharmCare)",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 11"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      1028,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Pharmaceutical Science (PharmSci)",
      "Pharmacy Student Oral Presentation สาขาวิทยาศาสตร์เภสัชกรรม (PharmSci)",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 12"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      1029,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Administration, Drug Consumer Protection and Digital Pharmacy",
      "Pharmacy Student Oral Presentation สาขาบริหารเภสัชกิจ คุ้มครองผู้บริโภคด้านยา ดิจิทัลเภสัชกรรม",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 13"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  day1Event(
    1030,
    "15:45 – 16:30",
    "Policy Highlights and Pharmacy Profession Roadmap",
    "Policy Highlights นำเสนอข้อเสนอเชิงนโยบายและ Roadmap วิชาชีพเภสัชกรรม โดย สภาเภสัชกรรม",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Session",
    "นำเสนอ",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      1031,
      "16:30 – 17:00",
      "Driving Healthcare Innovation by Pharmacy Leadership",
      "Driving Healthcare Innovation by Pharmacy Leadership",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Keynote",
      "บรรยายพิเศษ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Dr. Pharm. Artirat Charukitpipat (CEO, Bumrungrad International Hospital)",
        nameTh: "ดร.ภญ.อาทิรัตน์ จารุกิจพิพัฒน์ (CEO โรงพยาบาลบำรุงราษฎร์)",
      },
    ],
  },
  day1Event(
    1032,
    "17:00 – 18:30",
    "Welcome Reception, Networking and Certificate Ceremony",
    "Welcome Reception and Networking พร้อมพิธีมอบประกาศนียบัตร วุฒิบัตร และหนังสืออนุมัติ โดย ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Ceremony",
    "พิธีการ",
    "JUPITER 4-7"
  ),
];

const day2Events = [
  day1Event(
    201,
    "08:00 – 09:00",
    "Registration",
    "ลงทะเบียนผู้เข้าร่วมประชุม (Registration)",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Registration",
    "ลงทะเบียน",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      202,
      "09:00 – 09:10",
      "Opening Report and PRIS2026 Opening Video",
      "กล่าวรายงาน พร้อมรับชม PRIS2026 Opening Video",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Ceremony",
      "พิธีการ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Prof. Dr. Pharm. Chonlaphat Sukasem",
        nameTh: "ศ.ดร.ภก. ชลภัทร สุขเกษม",
      },
    ],
  },
  {
    ...day1Event(
      203,
      "09:10 – 09:50",
      "Keynote: Advancing Thailand Healthcare through Pharmacy Research and Innovation",
      "ปาฐกถาพิเศษ หัวข้อ Advancing Thailand Healthcare through pharmacy research and innovation",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Keynote",
      "ปาฐกถาพิเศษ",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Prof. Dr. Yotchanan Wongsawat (Deputy Prime Minister and Minister of Higher Education, Science, Research and Innovation)",
        nameTh:
          "ศ.ดร.ยศชนัน วงศ์สวัสดิ์ (รองนายกรัฐมนตรีและรัฐมนตรีว่าการกระทรวงอุดมศึกษา วิจัยและนวัตกรรม)",
      },
      {
        name: "President, Secretary-General and Board Members of the Pharmacy Council",
        nameTh: "นายกสภาเภสัชกรรม/เลขาธิการสภาเภสัชกรรม/กรรมการสภาเภสัชกรรม",
        role: "Chair",
        roleTh: "Chair",
      },
    ],
  },
  {
    ...day1Event(
      204,
      "09:50 – 10:30",
      "From Data to Discovery: Empowering Pharmacist Researchers for National Impact",
      "หัวข้อ From Data to Discovery: Empowering Pharmacist Researchers for National Impact",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Session",
      "บรรยาย",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Prof. Dr. Sompong Klaynongsruang",
        nameTh:
          "ศ.ดร.สมปอง คล้ายหนองสรวง (ผู้อำนวยการสำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.))",
      },
      {
        name: "Secretary-General of the Pharmacy Council",
        nameTh: "เลขาธิการสภาเภสัชกรรม",
        role: "Chair",
        roleTh: "Chair",
      },
    ],
  },
  day1Event(
    205,
    "10:30 – 11:00",
    "Coffee Break",
    "Coffee Break",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Break",
    "พัก",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      206,
      "11:00 – 11:50",
      "Clinical Pharmacy",
      "หัวข้อ Clinical Pharmacy",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Session",
      "เสวนา",
      "JUPITER 4-7"
    ),
    description: "By College of Pharmacotherapy of Thailand",
    descriptionTh: "โดย วิทยาลัยเภสัชกรรมบำบัด",
  },
  day1Event(
    207,
    "12:00 – 12:30",
    "Lunch Symposium 1",
    "Lunch Symposium 1",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Lunch",
    "บรรยาย",
    "JUPITER 4-7"
  ),
  day1Event(
    208,
    "12:30 – 13:00",
    "Lunch Symposium 2",
    "Lunch Symposium 2",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Lunch",
    "บรรยาย",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      209,
      "13:00 – 14:00",
      "Digital Solutions: Key to Upgrading Pharmacy and Hospital Services",
      "หัวข้อ Digital Solutions: กุญแจสู่การยกระดับบริการร้านยาและโรงพยาบาล",
      "JUPITER 4-7",
      "ห้อง JUPITER 4-7",
      "Session",
      "เสวนา",
      "JUPITER 4-7"
    ),
    speakers: [
      {
        name: "Pharm. Apinan Watcharaphichart",
        nameTh: "ภก.อภินันท์ วัชราภิชาต (ผู้ช่วยเลขาธิการสภาเภสัชกรรม)",
        role: "Moderator",
        roleTh: "Moderator",
      },
      {
        name: "Dr. Pharm. Samart Jumrus",
        nameTh: "ดร.ภก.สามารถ จำรัส (คณะเภสัชศาสตร์ มหาวิทยาลัยศิลปากร)",
      },
    ],
  },
  day1Event(
    210,
    "14:00 – 15:30",
    "Oral Presentation: Digital Pharmacy and Health Informatics",
    "Oral Presentation เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Oral Presentation",
    "นำเสนอผลงาน",
    "JUPITER 4-7"
  ),
  day1Event(
    211,
    "15:30 – 16:00",
    "Corporate Symposium",
    "Corporate Symposium",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Session",
    "บรรยาย",
    "JUPITER 4-7"
  ),
  day1Event(
    212,
    "16:00 – 16:30",
    "Award Presentation and Closing Ceremony",
    "พิธีมอบรางวัลการนำเสนอผลงาน และปิดประชุม",
    "JUPITER 4-7",
    "ห้อง JUPITER 4-7",
    "Ceremony",
    "พิธีการ",
    "JUPITER 4-7"
  ),
  {
    ...day1Event(
      221,
      "09:00 – 10:00",
      "From Idea to Impact: Turning Health Innovations into Fundable Startups",
      "หัวข้อ From Idea to Impact: Turning Health Innovations into Fundable Startups",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Session",
      "บรรยาย",
      "JUPITER 11"
    ),
    description: "By TED FUND",
    descriptionTh: "โดย TED FUND",
  },
  {
    ...day1Event(
      223,
      "11:00 – 11:50",
      "Leading the Future of Pharmacy: Innovation, Leadership and Health System Transformation",
      "หัวข้อ Leading the Future of Pharmacy: Innovation, Leadership and Health System Transformation",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Session",
      "บรรยาย",
      "JUPITER 11"
    ),
    description: "By the College of Pharmacy Management",
    descriptionTh: "โดย วิทยาลัยบริหารเภสัชกิจ",
  },
  {
    ...day1Event(
      224,
      "13:00 – 14:00",
      "Thai Clinical Pharmacogenomics Implementation Guideline for NAT2 genotyping and Isoniazid dose optimization",
      "หัวข้อ Thai Clinical Pharmacogenomics Implementation Guideline for NAT2 genotyping and Isoniazid dose optimization",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Session",
      "บรรยาย",
      "JUPITER 11"
    ),
    description: "By the College of Pharmacogenomics and Precision Pharmacy",
    descriptionTh: "โดย วิทยาลัยเภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ",
  },
  {
    ...day1Event(
      225,
      "14:00 – 15:30",
      "Oral Presentation: Drug and Health Consumer Protection",
      "Oral Presentation สาขาการคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 11"
    ),
    description: "Committee: College of Consumer Protection",
    descriptionTh: "Committee: วิทยาลัยคุ้มครองผู้บริโภค",
  },
  {
    ...day1Event(
      226,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Pharmaceutical Care (PharmCare)",
      "Pharmacy Student Oral Presentation สาขาการบริบาลทางเภสัชกรรม (PharmCare)",
      "JUPITER 11",
      "ห้อง JUPITER 11",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 11"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      231,
      "08:00 – 12:30",
      "PSAT Health Hack 2026",
      "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
      "JUPITER 12–13",
      "ห้อง JUPITER 12–13",
      "Activity",
      "กิจกรรม",
      "JUPITER 12"
    ),
    spanTracks: ["JUPITER 12", "JUPITER 13"],
  },
  {
    ...day1Event(
      232,
      "13:00 – 14:00",
      "From Research to Manufacturing: Accelerating Pharmaceutical Innovation",
      "หัวข้อ From Research to Manufacturing: Accelerating Pharmaceutical Innovation",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Session",
      "บรรยาย",
      "JUPITER 12"
    ),
    description: "By the College of Industrial Pharmacy",
    descriptionTh: "โดย วิทยาลัยเภสัชกรรมอุตสาหการ",
  },
  {
    ...day1Event(
      233,
      "14:00 – 15:30",
      "Oral Presentation: Herbal Pharmacy",
      "Oral Presentation สาขาเภสัชกรรมสมุนไพร",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 12"
    ),
    description: "Committee: College of Herbal Pharmacy",
    descriptionTh: "Committee: วิทยาลัยเภสัชกรรมสมุนไพร",
  },
  {
    ...day1Event(
      234,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Pharmaceutical Science (PharmSci)",
      "Pharmacy Student Oral Presentation สาขาวิทยาศาสตร์เภสัชกรรม (PharmSci)",
      "JUPITER 12",
      "ห้อง JUPITER 12",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 12"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      242,
      "13:00 – 14:00",
      "How to Write a Research Article to Impress the Editor",
      "หัวข้อ เขียนบทความวิจัยอย่างไรให้โดนใจบรรณาธิการ",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Session",
      "บรรยาย",
      "JUPITER 13"
    ),
    description: "By editors of the Hospital Pharmacy Association",
    descriptionTh: "โดย บรรณาธิการสมาคมเภสัชกรรมโรงพยาบาล",
  },
  {
    ...day1Event(
      243,
      "14:00 – 15:30",
      "Oral Presentation: Pharmacogenomics and Precision Pharmacy",
      "Oral Presentation เภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Oral Presentation",
      "นำเสนอผลงาน",
      "JUPITER 13"
    ),
    description:
      "Committee: College of Pharmacogenomics and Precision Pharmacy",
    descriptionTh: "Committee: วิทยาลัยเภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ",
  },
  {
    ...day1Event(
      244,
      "15:30 – 16:30",
      "Pharmacy Student Oral Presentation: Administration, Drug Consumer Protection and Digital Pharmacy",
      "Pharmacy Student Oral Presentation สาขาบริหารเภสัชกิจ คุ้มครองผู้บริโภคด้านยา ดิจิทัลเภสัชกรรม",
      "JUPITER 13",
      "ห้อง JUPITER 13",
      "Student Presentation",
      "นำเสนอผลงานนักศึกษา",
      "JUPITER 13"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      251,
      "11:00 – 12:00",
      "Pharmacy Student Poster Presentation (PharmCare)",
      "Poster Presentation สาขาการบริบาลทางเภสัชกรรม (PharmCare)",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 1",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 1"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      253,
      "11:00 – 12:00",
      "Pharmacy Student Poster Presentation (PharmSci)",
      "Poster Presentation สาขาวิทยาศาสตร์เภสัชกรรม (PharmSci)",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 2",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 2"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  {
    ...day1Event(
      257,
      "11:00 – 12:00",
      "Pharmacy Student Poster Presentation: Administration, Consumer Protection and Digital Pharmacy",
      "Poster Presentation สาขาบริหารเภสัชกิจ คุ้มครองผู้บริโภคด้านยา ดิจิทัลเภสัชกรรม",
      "INNOVATION ZONE",
      "INNOVATION ZONE สถานี 3",
      "Poster Presentation",
      "นำเสนอผลงาน",
      "INNOVATION ZONE",
      "GROUP 3"
    ),
    description: "6 presentations selected",
    descriptionTh: "คัดเลือก 6 ผลงาน",
  },
  day1Event(
    252,
    "13:00 – 14:00",
    "Poster Presentation: Clinical Pharmacy and Pharmaceutical Care",
    "Poster Presentation สาขาเภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม",
    "INNOVATION ZONE",
    "INNOVATION ZONE สถานี 1",
    "Poster Presentation",
    "นำเสนอผลงาน",
    "INNOVATION ZONE",
    "GROUP 1"
  ),
  day1Event(
    254,
    "13:00 – 14:00",
    "Poster Presentation: Community Pharmacy and Professional Practice",
    "Poster Presentation สาขาเภสัชกรรมชุมชนและการปฏิบัติงานวิชาชีพ",
    "INNOVATION ZONE",
    "INNOVATION ZONE สถานี 2",
    "Poster Presentation",
    "นำเสนอผลงาน",
    "INNOVATION ZONE",
    "GROUP 2"
  ),
  day1Event(
    255,
    "13:00 – 14:00",
    "Poster Presentation: Pharmacy Administration",
    "Poster Presentation สาขาการบริหารเภสัชกิจ",
    "INNOVATION ZONE",
    "INNOVATION ZONE สถานี 3",
    "Poster Presentation",
    "นำเสนอผลงาน",
    "INNOVATION ZONE",
    "GROUP 3"
  ),
  day1Event(
    256,
    "13:00 – 14:00",
    "Poster Presentation: Pharmaceutical Science, Technology and Industrial Pharmacy",
    "Poster Presentation สาขาเภสัชศาสตร์และเทคโนโลยีเภสัชกรรม และเภสัชกรรมอุตสาหการ",
    "INNOVATION ZONE",
    "INNOVATION ZONE สถานี 4",
    "Poster Presentation",
    "นำเสนอผลงาน",
    "INNOVATION ZONE",
    "GROUP 4"
  ),
];

export const scheduleData: ScheduleDay[] = [
  {
    day: "Day 1",
    dayTh: "วันที่ 1",
    date: "October 29, 2026",
    dateTh: "29 ตุลาคม 2569",
    events: day1Events,
  },
  {
    day: "Day 2",
    dayTh: "วันที่ 2",
    date: "October 30, 2026",
    dateTh: "30 ตุลาคม 2569",
    events: day2Events,
  },
];
