import { ScheduleDay } from "@/types";

export const scheduleData: ScheduleDay[] = [
  {
    day: "Day 1",
    dayTh: "วันที่ 1",
    date: "October 15, 2026",
    dateTh: "15 ตุลาคม 2569",
    events: [
      { 
        id: 1, 
        time: "08:00 – 09:00", 
        title: "Registration", 
        titleTh: "ลงทะเบียน", 
        location: "IMPACT Challenger",
        locationTh: "อิมแพ็ค ชาเลนเจอร์",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        speakers: []
      },
      { 
        id: 2, 
        time: "09:00 – 09:30", 
        title: "Opening Ceremony", 
        titleTh: "Opening Ceremony", 
        description: "Mr. Pattana Promphat The Minister of Public Health", 
        descriptionTh: "นายพัฒนา พร้อมพัฒน์ รัฐมนตรีว่าการกระทรวงสาธารณสุข", 
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Ceremony",
        typeTh: "พิธีเปิด",
        speakers: [
          {
            name: "Mr. Pattana Promphat",
            nameTh: "นายพัฒนา พร้อมพัฒน์",
            role: "The Minister of Public Health",
            roleTh: "รัฐมนตรีว่าการกระทรวงสาธารณสุข",
            image: "/assets/Img/Welcome message/Mr. Preecha Bhandtivej.jpg"
          }
        ]
      },
      { 
        id: 3, 
        time: "09:30 – 10:30", 
        title: "Plenary Lecture", 
        titleTh: "Plenary Lecture", 
        description: '“Transforming Pharmacy Practice Under Ministry of Public Health Policies”',
        descriptionTh: "“พลิกโฉมงานเภสัชกรรมภายใต้นโยบายกระทรวงสาธารณสุข”",
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Lecture",
        typeTh: "บรรยายหลัก",
        speakers: []
      },
      { 
        id: 4, 
        time: "10:30 – 11:00", 
        title: "Coffee Break & Poster/Exhibition Viewing", 
        titleTh: "Coffee Break & Poster/Exhibition Viewing", 
        location: "Exhibition Hall",
        locationTh: "โถงนิทรรศการ",
        type: "Break",
        typeTh: "พักเบรค",
        speakers: []
      },
      { 
        id: 5, 
        time: "11:00 – 12:00", 
        title: "Parallel Sessions", 
        titleTh: "Parallel Sessions", 
        description: "Main Stage (Jupiter 4-7): Panel “Unlocking Pharmacy Profession Pain Points”\nRoom 1 (Jupiter 11): Young Pharmacist\nRoom 2 (Jupiter 12): Workshop: Professional Direction (Community)\nRoom 3 (Jupiter 13): Workshop: Professional Direction (Industrial)",
        descriptionTh: "Main Stage: (Jupiter 4-7) Topic 1: เสวนา “ปลดล็อค Pain Point วิชาชีพเภสัชกรรม”\nRoom 1: (Jupiter11) Young Pharmacist (สนภท.)\nRoom 2: (Jupiter12) Workshop: ทิศทางวิชาชีพ (สายชุมชน)\nRoom 3: (Jupiter13) Workshop: ทิศทางวิชาชีพ (สายอุตสาหกรรม)", 
        location: "Various Rooms", 
        locationTh: "ตามห้องต่าง ๆ", 
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 6, 
        time: "12:00 – 13:00", 
        title: "Lunch Symposium Sessions", 
        titleTh: "Lunch Symposium Sessions", 
        description: "Session 1 (12:00 – 12:30)\nSession 2 (12:30 – 13:00)",
        descriptionTh: "Session 1 (12:00 – 12:30)\nSession 2 (12:30 – 13:00)",
        location: "Various Rooms",
        locationTh: "ตามห้องต่าง ๆ",
        type: "Lunch",
        typeTh: "อาหารกลางวัน",
        speakers: []
      },
      { 
        id: 7, 
        time: "13:00 – 15:00", 
        title: "Scientific Sessions & Exhibition", 
        titleTh: "Scientific Sessions & Exhibition", 
        description: "Poster & Booth Exhibition\nOral Presentation I-IV (4 Parallel Rooms, 6 presentations/session, 15 min each)",
        descriptionTh: "Poster & Booth Exhibition\nOral Presentation I-IV (4 Parallel Rooms, 6 presentations/session, 15 min each)",
        location: "Exhibition Hall & Meeting Rooms",
        locationTh: "โถงนิทรรศการ และห้องประชุม",
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 8, 
        time: "15:00 – 15:30", 
        title: "Coffee Break", 
        titleTh: "Coffee Break", 
        location: "Exhibition Hall",
        locationTh: "โถงนิทรรศการ",
        type: "Break",
        typeTh: "พักเบรค",
        speakers: []
      },
      { 
        id: 9, 
        time: "15:30 – 16:00", 
        title: "Parallel Sessions", 
        titleTh: "Parallel Sessions", 
        description: "Main Stage: Corporate Symposium\nRooms 1-3: Student Presentation (Pharmaceutical Sciences)",
        descriptionTh: "Main Stage: Corporate Symposium\nRooms 1-3: Student Presentation (Pharmaceutical Sciences)",
        location: "Various Rooms",
        locationTh: "ตามห้องต่าง ๆ",
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 10, 
        time: "16:00 – 16:30", 
        title: "Organizational Report", 
        titleTh: "Organizational Report", 
        description: "(Pharmacy Council and Royal College of Pharmacy)",
        descriptionTh: "(สภาเภสัชกรรม และราชวิทยาลัย)",
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 11, 
        time: "16:30 – 18:00", 
        title: "Welcome Reception & Networking", 
        titleTh: "Welcome Reception & Networking", 
        description: "Includes Awarding of Certificates and Diplomas",
        descriptionTh: "พร้อมพิธีมอบประกาศนียบัตร และวุฒิบัตร",
        location: "Grand Foyer",
        locationTh: "แกรนด์ฟอยเยอร์",
        type: "Networking",
        typeTh: "พบปะสังสรรค์",
        speakers: []
      }
    ],
  },
  {
    day: "Day 2",
    dayTh: "วันที่ 2",
    date: "October 16, 2026",
    dateTh: "16 ตุลาคม 2569",
    events: [
      { 
        id: 12, 
        time: "08:00 – 09:00", 
        title: "Registration", 
        titleTh: "ลงทะเบียน", 
        location: "IMPACT Challenger",
        locationTh: "อิมแพ็ค ชาเลนเจอร์",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        speakers: []
      },
      { 
        id: 13, 
        time: "09:00 – 09:30", 
        title: "Keynote Lecture 1", 
        titleTh: "Keynote Lecture 1", 
        description: '“AI in Pharmacy Practice”',
        descriptionTh: "“AI กับงานเภสัชกรรม”",
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Keynote",
        typeTh: "ปาฐกถา",
        speakers: []
      },
      { 
        id: 14, 
        time: "09:30 – 10:00", 
        title: "Keynote Lecture 2", 
        titleTh: "Keynote Lecture 2", 
        description: '“Advance and Innovation Pharmacy I”',
        descriptionTh: "“Advance and Innovation Pharmacy I”",
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Keynote",
        typeTh: "ปาฐกถา",
        speakers: []
      },
      { 
        id: 15, 
        time: "10:00 – 10:30", 
        title: "Coffee Break & Poster Viewing", 
        titleTh: "พักรับประทานอาหารว่าง และเยี่ยมชมนิทรรศการโปสเตอร์", 
        location: "Exhibition Hall",
        locationTh: "โถงนิทรรศการ",
        type: "Break",
        typeTh: "พักเบรค",
        speakers: []
      },
      { 
        id: 16, 
        time: "10:30 – 12:00", 
        title: "Scientific & Networking Sessions", 
        titleTh: "Scientific & Networking Sessions", 
        description: "Main Stage:\nTopic 3: Advance and Innovation Pharmacy II\nTopic 4: Advance and Innovation Pharmacy III\nTopic 5: Advance and Innovation Pharmacy IV\nRoom 1: Networking (Education)\nRoom 2-3: Networking",
        descriptionTh: "Main Stage:\nTopic 3: Advance and Innovation Pharmacy II\nTopic 4: Advance and Innovation Pharmacy III\nTopic 5: Advance and Innovation Pharmacy IV\nRoom 1: Networking (ด้านการศึกษา)\nRoom 2-3: Networking",
        location: "Various Rooms",
        locationTh: "ตามห้องต่าง ๆ",
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 17, 
        time: "12:00 – 13:00", 
        title: "Lunch Symposium Sessions", 
        titleTh: "Lunch Symposium Sessions", 
        description: "Session 3 (12:00 – 12:30)\nSession 4 (12:30 – 13:00)",
        descriptionTh: "Session 3 (12:00 – 12:30)\nSession 4 (12:30 – 13:00)",
        location: "Various Rooms",
        locationTh: "ตามห้องต่าง ๆ",
        type: "Lunch",
        typeTh: "อาหารกลางวัน",
        speakers: []
      },
      { 
        id: 18, 
        time: "13:00 – 16:30", 
        title: "Scientific Sessions", 
        titleTh: "Scientific Sessions", 
        description: "Oral Presentation V-VIII (Parallel Sessions)\nStudent Presentation (Pharm Care / Pharm Science)",
        descriptionTh: "Oral Presentation V-VIII (Parallel Sessions)\nStudent Presentation (Pharm Care / Pharm Science)",
        location: "Meeting Rooms",
        locationTh: "ห้องประชุม",
        type: "Session",
        typeTh: "การประชุม",
        speakers: []
      },
      { 
        id: 19, 
        time: "17:00", 
        title: "Award Ceremony", 
        titleTh: "Award Ceremony", 
        location: "Main Stage",
        locationTh: "เวทีห้องประชุมใหญ่",
        type: "Ceremony",
        typeTh: "พิธีมอบรางวัล",
        speakers: []
      }
    ],
  },
];
