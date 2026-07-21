import { ScheduleDay } from "@/types";

export const scheduleData: ScheduleDay[] = [
  {
    day: "Day 1",
    dayTh: "วันที่ 1",
    date: "October 29, 2026",
    dateTh: "29 ตุลาคม 2569",
    events: [
      {
        id: 1,
        time: "08:00 – 09:00",
        title: "Registration",
        titleTh: "ลงทะเบียนผู้เข้าร่วมประชุม (Registration)",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 2,
        time: "09:00 – 09:10",
        title: "Report and PRIS 2026 Opening Video",
        titleTh: "กล่าวรายงาน พร้อมรับชม PRIS 2026 Opening Video",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Prof. Dr. Pharm. Chonlaphat Sukkasem",
            nameTh: "ศ.ดร.ภก. ชลภัทร สุขเกษม"
          }
        ]
      },
      {
        id: 3,
        time: "09:10 – 09:30",
        title: "Opening Ceremony",
        titleTh: "พิธีเปิดการประชุม (Opening Ceremony)",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Mr. Pattana Prompat (Minister of Public Health)",
            nameTh: "นายพัฒนา พร้อมพัฒน์\n(รัฐมนตรีว่าการกระทรวงสาธารณสุข)"
          }
        ]
      },
      {
        id: 4,
        time: "09:30 – 10:00",
        title: "Keynote: The New Era of Pharmacy under the Ministry of Public Health",
        titleTh: "ปาฐกถาพิเศษ The New Era of Pharmacy under the Ministry of Public Health",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Lecture",
        typeTh: "บรรยายพิเศษ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Mr. Pattana Prompat",
            nameTh: "นายพัฒนา พร้อมพัฒน์\n(รัฐมนตรีว่าการกระทรวงสาธารณสุข)"
          },
          {
            name: "Pharmacy Council Committee",
            nameTh: "นายกสภาเภสัชกรรม/เลขาธิการสภาเภสัชกรรม/กรรมการสภาเภสัชกรรม",
          }
        ]
      },
      {
        id: 5,
        time: "10:00 – 10:30",
        title: "Exhibition Viewing",
        titleTh: "เดินชมผลงานและความก้าวหน้าของงานเภสัชกรรมจากหน่วยงานภาครัฐและภาคเอกชน",
        location: "Exhibition Area",
        locationTh: "ลานนิทรรศการ",
        type: "Break",
        typeTh: "เยี่ยมชม",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 6,
        time: "10:30 – 11:00",
        title: "Coffee Break",
        titleTh: "Coffee Break",
        location: "Exhibition Area",
        locationTh: "ลานนิทรรศการ",
        type: "Break",
        typeTh: "พัก",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 7,
        time: "11:00 – 12:00",
        title: "From Policy to Professional Advancement and Specialization",
        titleTh: "จากนโยบายสู่ความก้าวหน้าในวิชาชีพเภสัชกรรมและชำนาญการพิเศษเลื่อนไหล",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Pharm. Jantima Yotapitak",
            nameTh: "ภญ.จันทิมา โยธาพิทักษ์ (เภสัชกรเชี่ยวชาญ) หัวหน้ากลุ่มงานเภสัชกรรม รพ.สุราษฎร์ธานี"
          },
          {
            name: "Pharm. Suttinee Ruangsuphan",
            nameTh: "ภญ.สุทธินี เรืองสุพันธุ์ (เภสัชกรเชี่ยวชาญ) รองนายแพทย์สาธารณสุขจังหวัดนครราชสีมา"
          },
          {
            name: "Pharm. Teerawit Bamrungsri",
            nameTh: "ภก.ธีรวิทย์ บำรุงศรี (เภสัชกรเชี่ยวชาญ) (ประธานอนุกรรมการความก้าวหน้า)"
          }
        ]
      },
      {
        id: 1101,
        time: "10:30 – 13:00",
        title: "Policy Workshop by Faculty of Social Sciences and Humanities, Mahidol University",
        titleTh: "Policy Workshop โดย คณะสังคมศาสตร์และมนุษยศาสตร์ มหาวิทยาลัยมหิดล",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Workshop",
        typeTh: "เวิร์กชอป",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: [
          {
            name: "Asst. Prof. Dr. Jitsuda Limkriengkrai and team",
            nameTh: "ผศ.ดร.จิตรสุดา ลิมเกรียงไกร และทีมงาน"
          }
        ]
      },
      {
        id: 1102,
        time: "13:00 – 14:00",
        title: "Roadmap for Thai Community Pharmacy: Policies, Directions, and Shared Future by Community Pharmacy College, Community Pharmacy Association, Thai United Pharmacies Association, Pharmacy Association, Pharmacy Council",
        titleTh: "Roadmap เภสัชกรรมชุมชนไทย: นโยบาย ทิศทาง และอนาคตร่วมของวิชาชีพ โดย วิทยาลัยเภสัชกรรมชุมชน สมาคมเภสัชกรรมชุมชน, สมาคมร้านยารวมใจไทย, สมาคมร้านยา, สภาเภสัชกรรม",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: [
          {
            name: "Pharm. Chanakit Imbumrung",
            nameTh: "ภญ.ชนากิตต์ อิ่มบำรุง"
          },
          {
            name: "Pharm. Peerasarun Paitoon",
            nameTh: "ภก.พีรศรัณย์ ไพฑูรย์",
            role: "Moderator",
            roleTh: "Moderator"
          }
        ]
      },
      {
        id: 1103,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Consumer Protection in Drugs and Health",
        titleTh: "Oral Presentation การคุ้มครองผู้บริโภคด้านยาและสุขภาพ",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 1104,
        time: "15:30 – 16:30",
        title: "Pharmacy Student Oral Presentation (PharmCare)",
        titleTh: "Pharmacy Student Oral Presentation (PharmCare)",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 1201,
        time: "08:00 – 11:00",
        title: "PSAT Health Hack 2026 by Pharmacy Student Association of Thailand (PSAT)",
        titleTh: "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Activity",
        typeTh: "กิจกรรม",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 1202,
        time: "11:00 – 12:00",
        title: "The Future of Pharmacy Profession from the Perspective of the New Generation by Pharmacy Student Association of Thailand (PSAT)",
        titleTh: "อนาคตวิชาชีพเภสัชกรรมในมุมมองคนรุ่นใหม่ โดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: [
          {
            name: "Pharm. Phian Plearnbannakit",
            nameTh: "ภก.เพียร เพลินบรรณกิจ (รองเลขาธิการสภาเภสัชกรรม)",
            role: "Moderator",
            roleTh: "Moderator"
          }
        ]
      },
      {
        id: 1203,
        time: "13:00 – 14:00",
        title: "Aesthetic Pharmacy Next Gen: From Research to Products and Practices",
        titleTh: "Aesthetic Pharmacy Next Gen: From Research to Products and Practices",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: [
          {
            name: "Pharm. Warawut Sermsinsiri",
            nameTh: "โดย ภก.วราวุธ เสริมสินสิริ"
          }
        ]
      },
      {
        id: 1204,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Community Pharmacy",
        titleTh: "Oral Presentation เภสัชกรรมชุมชน",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 1205,
        time: "15:30 – 16:30",
        title: "Pharmacy Student Oral Presentation (PharmaSci)",
        titleTh: "Pharmacy Student Oral Presentation (PharmaSci)",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 1301,
        time: "08:00 – 11:00",
        title: "PSAT Health Hack 2026 by Pharmacy Student Association of Thailand (PSAT)",
        titleTh: "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Activity",
        typeTh: "กิจกรรม",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: []
      },
      {
        id: 1302,
        time: "11:00 – 12:00",
        title: "The New Role of Pharmacists: Driving Thai Herbs to the Future Health System by College of Herbal Pharmacy, Department of Thai Traditional and Alternative Medicine, Chaophraya Abhaibhubejhr",
        titleTh: "บทบาทใหม่ของเภสัชกร: ขับเคลื่อนสมุนไพรไทยสู่ระบบสุขภาพแห่งอนาคต โดย วิทยาลัยเภสัชกรรมสมุนไพร, กรมการแพทย์แผนไทย, เจ้าพระยาอภัยภูเบศร",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: [
          {
            name: "Dr. Pharm. Pakakrong Kwankhao",
            nameTh: "ดร.ภญ.ผกากรอง ขวัญข้าว",
            role: "Moderator",
            roleTh: "Moderator"
          }
        ]
      },
      {
        id: 1303,
        time: "13:00 – 14:00",
        title: "Advanced Therapy Medicinal Products (ATMP) and Radiopharmaceutical Product",
        titleTh: "Advanced Therapy Medicinal Products (ATMP) and Radiopharmaceutical Product",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: [
          {
            name: "Asst. Prof. Dr. Rotjaporn Watcharotayankun",
            nameTh: "ผศ.ดร.รจพร วัชโรทยางกูร"
          },
          {
            name: "Assoc. Prof. Dr. Pharm. Worasit Vongsuttilerd",
            nameTh: "รศ.ดร.ภก.วรสิทธิ์ วงศ์สุทธิเลิศ"
          },
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "Moderator",
            roleTh: "Moderator"
          }
        ]
      },
      {
        id: 1304,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Pharmacy, Pharmaceutical Technology, and Industrial Pharmacy",
        titleTh: "Oral Presentation เภสัชศาสตร์และเทคโนโลยีเภสัชกรรมและเภสัชกรรมอุตสาหการ",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: []
      },
      {
        id: 8,
        time: "12:00 – 12:30",
        title: "Lunch Symposium 1",
        titleTh: "Lunch Symposium 1",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 9,
        time: "12:30 – 13:00",
        title: "Lunch Symposium 2",
        titleTh: "Lunch Symposium 2",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 10,
        time: "13:00 – 14:00",
        title: "The Next Decade of Pharmacy - Across the Board for Sustainable Healthcare by Pharmacy Council and College of Pharmacotherapy of Thailand",
        titleTh: "The Next Decade of Pharmacy - Across the Board for Sustainable Healthcare โดย สภาเภสัชกรรมและราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Assoc. Prof. Pharm. Sunee Lertsinudom",
            nameTh: "รศ.ภญ.สุณี เลิศสินอุดม",
            role: "Moderator",
            roleTh: "Moderator"
          }
        ]
      },
      {
        id: 11,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Digital Pharmacy and Health Informatics",
        titleTh: "Oral Presentation เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 12,
        time: "15:30 – 15:45",
        title: "Coffee Break",
        titleTh: "Coffee Break",
        location: "Foyer",
        locationTh: "โถงโฟเยร์",
        type: "Break",
        typeTh: "พัก",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 13,
        time: "15:45 – 16:15",
        title: "Policy Highlights and Professional Roadmap by Policy Workshop Team",
        titleTh: "Policy Highlights นำเสนอข้อเสนอเชิงนโยบายและ Roadmap วิชาชีพเภสัชกรรม โดย ทีมงาน Policy Workshop",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "นำเสนอ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 14,
        time: "16:15 – 17:00",
        title: "Corporate Symposium: Pharmacy Leadership and Innovation",
        titleTh: "Corporate Symposium Pharmacy Leadership and Innovation",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Dr. Pharm. Artirat Charukitpipat",
            nameTh: "ดร.ภญ.อาทิรัตน์ จารุกิจพิพัฒน์ (CEO โรงพยาบาลบำรุงราษฎร์)"
          }
        ]
      },
      {
        id: 15,
        time: "17:00 – 18:30",
        title: "Award & Recognition Ceremony by College of Pharmacotherapy of Thailand",
        titleTh: "พิธีมอบประกาศนียบัตรและรางวัล (Award & Recognition Ceremony) โดย ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 1401,
        time: "11:00 – 12:00",
        title: "Pharmacy Student Poster Presentation (PharmCare)",
        titleTh: "Pharmacy Student Poster Presentation (PharmCare)",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 1",
        speakers: []
      },
      {
        id: 1402,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Clinical Pharmacy and Pharmaceutical Care",
        titleTh: "Poster Presentation เภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 1",
        speakers: []
      },
      {
        id: 1403,
        time: "11:00 – 12:00",
        title: "Pharmacy Student Poster Presentation (PharmSci)",
        titleTh: "Pharmacy Student Poster Presentation (PharmSci)",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 2",
        speakers: []
      },
      {
        id: 1404,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Community Pharmacy",
        titleTh: "Poster Presentation เภสัชกรรมชุมชน",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 2",
        speakers: []
      },
      {
        id: 1405,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Herbal Pharmacy",
        titleTh: "Poster Presentation เภสัชกรรมสมุนไพร",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 3",
        speakers: []
      },
      {
        id: 1406,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Pharmacy Administration",
        titleTh: "Poster Presentation การบริหารเภสัชกิจ",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 4",
        speakers: []
      }
    ]
  },
  {
    day: "Day 2",
    dayTh: "วันที่ 2",
    date: "October 30, 2026",
    dateTh: "30 ตุลาคม 2569",
    events: [
      {
        id: 201,
        time: "08:00 – 09:00",
        title: "Registration",
        titleTh: "ลงทะเบียนผู้เข้าร่วมประชุม (Registration)",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 202,
        time: "09:00 – 09:10",
        title: "Opening Report and PRIS 2026 Opening Video",
        titleTh: "กล่าวรายงาน พร้อมรับชม PRIS 2026 Opening Video",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Prof. Dr. Pharm. Chonlaphat Sukasem",
            nameTh: "ศ.ดร.ภก. ชลภัทร สุขเกษม"
          }
        ]
      },
      {
        id: 203,
        time: "09:10 – 10:00",
        title: "Keynote: Advancing Thailand Healthcare through pharmacy research and innovation",
        titleTh: "ปาฐกถาพิเศษ Advancing Thailand Healthcare through pharmacy research and innovation",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Keynote",
        typeTh: "ปาฐกถาพิเศษ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Prof. Dr. Yotchanan Wongsawat (Deputy Prime Minister and Minister of Higher Education, Science, Research and Innovation)",
            nameTh: "ศ.ดร.ยศชนัน วงศ์สวัสดิ์ (รองนายกรัฐมนตรีและรัฐมนตรีว่าการกระทรวงอุดมศึกษา วิจัยและนวัตกรรม)"
          },
          {
            name: "Secretary-General of the Pharmacy Council / Board Member",
            nameTh: "เลขาธิการสภาเภสัชกรรม/กรรมการสภาเภสัชกรรม"
          }
        ]
      },
      {
        id: 204,
        time: "10:00 – 10:30",
        title: "From Data to Discovery: Empowering Pharmacist Researchers for National Impact",
        titleTh: "From Data to Discovery: Empowering Pharmacist Researchers for National Impact",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Prof. Dr. Sompong Klaynongsruang",
            nameTh: "ศ.ดร.สมปอง คล้ายหนองสรวง"
          }
        ]
      },
      {
        id: 205,
        time: "10:30 – 11:00",
        title: "Coffee Break",
        titleTh: "Coffee Break",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Break",
        typeTh: "พัก",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 16,
        time: "10:30 – 11:00",
        title: "Break / Posters & Booths Viewing",
        titleTh: "พัก / เยี่ยมชม Posters & Booths",
        location: "Exhibition Hall",
        locationTh: "โถงนิทรรศการ",
        type: "Break",
        typeTh: "พัก",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 206,
        time: "11:00 – 12:00",
        title: "Pharmacy in 2036",
        titleTh: "Pharmacy in 2036",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Assoc. Prof. (Special) Pharm. Kitti Pitaknitinan",
            nameTh: "รศ.(พิเศษ) ภก.กิตติ พิทักษ์นิตินันท์"
          },
          {
            name: "Prof. Dr. Pharm. Pornsak Sriamornsak",
            nameTh: "ศ.ดร.ภก.พรศักดิ์ ศรีอมรศักดิ์"
          },
          {
            name: "Assoc. Prof. Dr. Pharm. Preecha Montakantikul",
            nameTh: "รศ.ดร.ภก.ปรีชา มนทกานติกุล"
          },
          {
            name: "Prof. Dr. Pharm. Chonlaphat Sukasem",
            nameTh: "ศ.ดร.ภก.ชลภัทร สุขเกษม"
          }
        ]
      },
      {
        id: 221,
        time: "09:00 – 10:00",
        title: "From Idea to Impact: Turning Health Innovations into Fundable Startups by TED FUND",
        titleTh: "From Idea to Impact: Turning Health Innovations into Fundable Startups โดย TED FUND",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 222,
        time: "10:00 – 11:00",
        title: "Clinical Pharmacy 2030: New Roles, New Technologies, New Outcomes by College of Pharmacotherapy",
        titleTh: "Clinical Pharmacy 2030: New Roles, New Technologies, New Outcomes โดย วิทยาลัยเภสัชกรรมบำบัด",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 223,
        time: "11:00 – 12:00",
        title: "Leading the Future of Pharmacy: Innovation, Leadership and Health System Transformation by College of Pharmacy Management",
        titleTh: "Leading the Future of Pharmacy: Innovation, Leadership and Health System Transformation โดย วิทยาลัยบริหารเภสัชกิจ",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 224,
        time: "13:00 – 14:00",
        title: "Beyond Precision Medicine: The Future of Personalized Pharmacy by College of Pharmacogenomics and Precision Medicine",
        titleTh: "Beyond Precision Medicine: The Future of Personalized Pharmacy โดย วิทยาลัยเภสัชพันธุศาสตร์และการแพทย์แม่นยำ",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 225,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Pharmacogenomics and Precision Medicine",
        titleTh: "Oral Presentation เภสัชพันธุศาสตร์และการแพทย์แม่นยำ",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 226,
        time: "15:30 – 16:30",
        title: "Pharmacy Student Oral Presentation (PharmCare)",
        titleTh: "Pharmacy Student Oral Presentation (PharmCare)",
        location: "JUPITER 11",
        locationTh: "ห้อง JUPITER 11",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 11",
        trackTh: "ห้อง JUPITER 11",
        speakers: []
      },
      {
        id: 231,
        time: "08:00 – 12:30",
        title: "PSAT Health Hack 2026 by Pharmacy Student Association of Thailand",
        titleTh: "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Activity",
        typeTh: "กิจกรรม",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 232,
        time: "13:00 – 14:00",
        title: "From Research to Manufacturing: Accelerating Pharmaceutical Innovation by College of Industrial Pharmacy",
        titleTh: "From Research to Manufacturing: Accelerating Pharmaceutical Innovation โดย วิทยาลัยเภสัชกรรมอุตสาหการ",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 233,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Pharmacy Management",
        titleTh: "Oral Presentation การบริหารเภสัชกิจ",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 234,
        time: "15:30 – 16:30",
        title: "Pharmacy Student Oral Presentation (PharmaSci)",
        titleTh: "Pharmacy Student Oral Presentation (PharmaSci)",
        location: "JUPITER 12",
        locationTh: "ห้อง JUPITER 12",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 12",
        trackTh: "ห้อง JUPITER 12",
        speakers: []
      },
      {
        id: 241,
        time: "08:00 – 12:30",
        title: "PSAT Health Hack 2026 by Pharmacy Student Association of Thailand",
        titleTh: "PSAT Health Hack 2026 จัดโดย สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Activity",
        typeTh: "กิจกรรม",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: []
      },
      {
        id: 242,
        time: "13:00 – 14:00",
        title: "The Future of Consumer Protection Pharmacy: From Regulation to Innovation by College of Consumer Protection",
        titleTh: "The Future of Consumer Protection Pharmacy: From Regulation to Innovation โดย วิทยาลัยคุ้มครองผู้บริโภค",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: []
      },
      {
        id: 243,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Pharmacy and Pharmaceutical Technology and Industrial Pharmacy (12 Presentation)",
        titleTh: "Oral Presentation เภสัชศาสตร์และเทคโนโลยีเภสัชกรรมและเภสัชกรรมอุตสาหการ (12 Presentation)",
        location: "JUPITER 13",
        locationTh: "ห้อง JUPITER 13",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 13",
        trackTh: "ห้อง JUPITER 13",
        speakers: []
      },
      {
        id: 207,
        time: "12:00 – 12:30",
        title: "Lunch Symposium 1",
        titleTh: "Lauch Symposium 1",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 208,
        time: "12:30 – 13:00",
        title: "Lunch Symposium 2",
        titleTh: "Lauch Symposium 2",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 209,
        time: "13:00 – 13:40",
        title: "Digital Solutions: Key to Upgrading Pharmacy and Hospital Services by Health System Development Team",
        titleTh: "Digital Solutions: กุญแจสู่การยกระดับบริการร้านยาและโรงพยาบาล โดย ทีมพัฒนาระบบสุขภาพ",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "เสวนา",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: [
          {
            name: "Pharm. Apinan Watcharaphichart\n(Assistant Secretary-General of the Pharmacy Council)",
            nameTh: "ภก.อภินันท์ วัชราภิชาต\n(ผู้ช่วยเลขาธิการสภาเภสัชกรรม)",
            role: "MODERATOR",
            roleTh: "MODERATOR"
          },
          {
            name: "Dr. Pharm. Samart Jumrus\n(Faculty of Pharmacy, Silpakorn University)",
            nameTh: "ดร.ภก.สามารถ จำรัส\n(คณะเภสัชศาสตร์ มหาวิทยาลัยศิลปากร)"
          }
        ]
      },
      {
        id: 210,
        time: "14:00 – 15:30",
        title: "Oral Presentation: Digital Pharmacy and Health Informatics",
        titleTh: "Oral Presentation เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 211,
        time: "15:30 – 16:00",
        title: "Coffee Break",
        titleTh: "Coffee Break",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Break",
        typeTh: "พัก",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 19,
        time: "13:00 – 14:00",
        title: "Poster Presentation",
        titleTh: "การนำเสนอโปสเตอร์",
        location: "Foyer & Exhibition Hall",
        locationTh: "โถงโฟเยร์และนิทรรศการ",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: [
          {
            name: "Review Committee",
            nameTh: "กรรมการพิจารณาผลงาน"
          }
        ]
      },
      {
        id: 20,
        time: "13:30 – 15:00",
        title: "Oral Presentation",
        titleTh: "การนำเสนอด้วยวาจา",
        location: "Main Stage / Breakout Rooms",
        locationTh: "เวทีหลัก / ห้องย่อย",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: [
          {
            name: "Review Committee",
            nameTh: "กรรมการพิจารณาผลงาน"
          }
        ]
      },
      {
        id: 21,
        time: "15:00 – 15:30",
        title: "Coffee Break / Student Presentation II",
        titleTh: "พัก / การนำเสนอนักศึกษา II",
        location: "Breakout Rooms",
        locationTh: "ห้องย่อย",
        type: "Session",
        typeTh: "นำเสนอผลงาน",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: [
          {
            name: "Review Committee",
            nameTh: "กรรมการพิจารณาผลงาน"
          }
        ]
      },
      {
        id: 212,
        time: "16:00 – 16:30",
        title: "Corporate Symposium",
        titleTh: "Corporate Symposium",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Session",
        typeTh: "บรรยาย",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 213,
        time: "16:30 – 18:00",
        title: "Award & Recognition Ceremony",
        titleTh: "พิธีมอบประกาศนียบัตรและรางวัล (Award & Recognition Ceremony)",
        location: "JUPITER 4-7",
        locationTh: "ห้อง JUPITER 4-7",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "JUPITER 4-7",
        trackTh: "ห้อง JUPITER 4-7",
        speakers: []
      },
      {
        id: 251,
        time: "11:00 – 12:00",
        title: "Pharmacy Student Poster Presentation (PharmCare)",
        titleTh: "Pharmacy Student Poster Presentation (PharmCare)",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 1",
        speakers: []
      },
      {
        id: 252,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Digital Pharmacy and Health Informatics (24 Poster)",
        titleTh: "Poster Presentation เภสัชกรรมดิจิทัลและสารสนเทศศาสตร์สุขภาพ (24 Poster)",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 1",
        speakers: []
      },
      {
        id: 253,
        time: "11:00 – 12:00",
        title: "Pharmacy Student Poster Presentation (PharmSci)",
        titleTh: "Pharmacy Student Poster Presentation (PharmSci)",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 2",
        speakers: []
      },
      {
        id: 254,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Drug and Health Consumer Protection",
        titleTh: "Poster Presentation คุ้มครองผู้บริโภคด้านยาและสุขภาพ",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 2",
        speakers: []
      },
      {
        id: 255,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Herbal Pharmacy",
        titleTh: "Poster Presentation เภสัชกรรมสมุนไพร",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 3",
        speakers: []
      },
      {
        id: 256,
        time: "13:00 – 14:00",
        title: "Poster Presentation: Pharmacogenomics and Precision Medicine",
        titleTh: "Poster Presentation เภสัชพันธุศาสตร์และการแพทย์แม่นยำ",
        location: "INNOVATION ZONE",
        locationTh: "INNOVATION ZONE",
        type: "Poster Presentation",
        typeTh: "นำเสนอผลงาน",
        track: "INNOVATION ZONE",
        trackTh: "INNOVATION ZONE",
        group: "GROUP 4",
        speakers: []
      }
    ]
  }
];
