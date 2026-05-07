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
        time: "08:00 – 16:00",
        title: "Registration",
        titleTh: "ลงทะเบียน",
        location: "Registration Counter",
        locationTh: "Registration Counter",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 2,
        time: "09:00 – 09:30",
        title: "Opening Ceremony",
        titleTh: "พิธีเปิดการประชุม",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Ceremony",
        typeTh: "พิธีการบนเวที",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฏิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 3,
        time: "09:30 – 10:30",
        title: "Plenary Lecture",
        titleTh: "Plenary Lecture",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lecture",
        typeTh: "บรรยายและซักถาม",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "President of Pharmacy Council",
            nameTh: "นายกสภาเภสัชกรรม"
          },
          {
            name: "Secretary-General of Pharmacy Council",
            nameTh: "เลขาธิการสภาเภสัชกรรม"
          }
        ]
      },
      {
        id: 4,
        time: "10:30 – 11:00",
        title: "Break / Exhibition Viewing",
        titleTh: "พัก / เยี่ยมชมนิทรรศการ",
        location: "Exhibition Area",
        locationTh: "Exhibition Area",
        type: "Break",
        typeTh: "Break",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 501,
        time: "11:00 – 11:50",
        title: "Panel Discussion: Unlocking Pharmacy Profession Pain Points",
        titleTh: "เสวนา “ปลดล็อค Painpoint วิชาชีพเภสัชกรรม”",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "เสวนา",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Teerawit Bamrungsri",
            nameTh: "ภก.ธีรวิทย์ บำรุงศรี",
            role: "Moderator",
            roleTh: "ผู้ดำเนินรายการ"
          },
          {
            name: "Representative from Pharmacy Council",
            nameTh: "ตัวแทนจากสภาเภสัชกรรม",
            role: "Panelist",
            roleTh: "ผู้ร่วมเสวนา"
          },
          {
            name: "Representative from College",
            nameTh: "ตัวแทนจากวิทยาลัย",
            role: "Panelist",
            roleTh: "ผู้ร่วมเสวนา"
          }
        ]
      },
      {
        id: 502,
        time: "11:00 – 11:50",
        title: "Young Pharmacist – The Future is Now",
        titleTh: "Young Pharmacist – The Future is Now",
        location: "Breakout Room 1",
        locationTh: "ห้องย่อย 1",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 1",
        trackTh: "ห้อง 1",
        speakers: []
      },
      {
        id: 503,
        time: "11:00 – 11:50",
        title: "Advanced Pharmaceutical Services in Community Pharmacies for Sustainability",
        titleTh: "Advanced Pharmaceutical Services in Community Pharmacies for Sustainability",
        location: "Breakout Room 2",
        locationTh: "ห้องย่อย 2",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 2",
        trackTh: "ห้อง 2",
        speakers: []
      },
      {
        id: 504,
        time: "11:00 – 11:50",
        title: "The Role of Pharmacists in Developing the Pharmaceutical Industry from Thai Herbs",
        titleTh: "บทบาทเภสัชกรกับการพัฒนาอุตสาหกรรมยาจากสมุนไพรไทย",
        location: "Breakout Room 3",
        locationTh: "ห้องย่อย 3",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 3",
        trackTh: "ห้อง 3",
        speakers: []
      },
      {
        id: 601,
        time: "12:00 – 12:30",
        title: "Lunch Symposium 1",
        titleTh: "Lunch Symposium 1",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lunch",
        typeTh: "บรรยายและซักถาม",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 602,
        time: "12:30 – 13:00",
        title: "Lunch Symposium 2",
        titleTh: "Lunch Symposium 2",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lunch",
        typeTh: "บรรยายและซักถาม",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฏิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 7,
        time: "13:00 – 14:00",
        title: "Poster Presentation I–IV",
        titleTh: "Poster Presentation I–IV",
        location: "Foyer & Exhibition Hall",
        locationTh: "Foyer & Exhibition Hall",
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
        id: 8,
        time: "13:30 – 15:00",
        title: "Oral Presentation I–IV",
        titleTh: "Oral Presentation I–IV",
        location: "Main Stage / Breakout Rooms",
        locationTh: "Main Stage / Breakout Rooms",
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
        id: 9,
        time: "15:00 – 15:30",
        title: "Coffee Break / Student Presentation I",
        titleTh: "Coffee Break / Student Presentation I",
        location: "Breakout Rooms",
        locationTh: "Breakout Rooms",
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
        id: 10,
        time: "15:30 – 16:00",
        title: "Corporate Symposium",
        titleTh: "Corporate Symposium",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "บรรยายและซักถาม",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 11,
        time: "16:00 – 17:00",
        title: "Putting our strategy into action",
        titleTh: "Putting our strategy into action",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "เสวนา",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 12,
        time: "17:00 – 18:30",
        title: "Welcome Reception / Networking / Certificate Ceremony",
        titleTh: "Welcome Reception / Networking / พิธีมอบประกาศนียบัตร",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Networking",
        typeTh: "พิธีการบนเวที",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      }
    ],
  },
  {
    day: "Day 2",
    dayTh: "วันที่ 2",
    date: "October 30, 2026",
    dateTh: "30 ตุลาคม 2569",
    events: [
      {
        id: 13,
        time: "08:00 – 16:00",
        title: "Registration",
        titleTh: "ลงทะเบียน",
        location: "Registration Area",
        locationTh: "Registration Area",
        type: "Registration",
        typeTh: "ลงทะเบียน",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 14,
        time: "09:00 – 09:45",
        title: "Future of Pharmacy in Sustainable Healthcare",
        titleTh: "Future of Pharmacy in Sustainable Healthcare",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lecture",
        typeTh: "บรรยาย",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 15,
        time: "09:45 – 10:30",
        title: "Will AI Replace Pharmacist",
        titleTh: "Will AI Replace Pharmacist",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "เสวนา",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Apinan Watcharaphichart",
            nameTh: "ภก.อภินันท์ วัชราภิชาต",
            role: "Moderator",
            roleTh: "ผู้ดำเนินรายการ"
          }
        ]
      },
      {
        id: 16,
        time: "10:30 – 11:00",
        title: "Break / Posters & Booths Viewing",
        titleTh: "พัก / เยี่ยมชม Posters & Booths",
        location: "Exhibition Hall",
        locationTh: "Exhibition Hall",
        type: "Break",
        typeTh: "Break",
        track: "Common",
        trackTh: "ทั่วไป",
        speakers: []
      },
      {
        id: 1701,
        time: "11:00 – 11:50",
        title: "Sustainable Development in Pharmacy: The Next Chapter",
        titleTh: "Sustainable Development in Pharmacy: The Next Chapter",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "เสวนา",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Preecha Montakantikul",
            nameTh: "ภก. ปรีชา มนทกานติกุล",
            role: "Moderator",
            roleTh: "ผู้ดำเนินรายการ"
          }
        ]
      },
      {
        id: 1702,
        time: "11:00 – 11:50",
        title: "Advancing Hospital Pharmacy Practice Through New Competences",
        titleTh: "Advancing Hospital Pharmacy Practice Through New Competences",
        location: "Breakout Room 1",
        locationTh: "ห้องย่อย 1",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 1",
        trackTh: "ห้อง 1",
        speakers: []
      },
      {
        id: 1703,
        time: "11:00 – 11:50",
        title: "Essential Guide to Manuscript Writing for Pharmacist",
        titleTh: "Essential Guide to Manuscript Writing for Pharmacist",
        location: "Breakout Room 2",
        locationTh: "ห้องย่อย 2",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 2",
        trackTh: "ห้อง 2",
        speakers: []
      },
      {
        id: 1704,
        time: "11:00 – 11:50",
        title: "Strengthening Health Consumer Protection & Sustainable Growth",
        titleTh: "Strengthening Health Consumer Protection & Sustainable Growth",
        location: "Breakout Room 3",
        locationTh: "ห้องย่อย 3",
        type: "Session",
        typeTh: "เสวนา",
        track: "Room 3",
        trackTh: "ห้อง 3",
        speakers: []
      },
      {
        id: 1801,
        time: "12:00 – 12:30",
        title: "Lunch Symposium 3",
        titleTh: "Lunch Symposium 3",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 1802,
        time: "12:30 – 13:00",
        title: "Lunch Symposium 4",
        titleTh: "Lunch Symposium 4",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Lunch",
        typeTh: "บรรยาย",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 19,
        time: "13:00 – 14:00",
        title: "Poster Presentation",
        titleTh: "Poster Presentation",
        location: "Foyer & Exhibition Hall",
        locationTh: "Foyer & Exhibition Hall",
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
        titleTh: "Oral Presentation",
        location: "Main Stage / Breakout Rooms",
        locationTh: "Main Stage / Breakout Rooms",
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
        titleTh: "Coffee Break / Student Presentation II",
        location: "Breakout Rooms",
        locationTh: "Breakout Rooms",
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
        id: 22,
        time: "15:30 – 16:00",
        title: "Corporate Symposium",
        titleTh: "Corporate Symposium",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Session",
        typeTh: "บรรยายและซักถาม",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      },
      {
        id: 23,
        time: "16:00 – 17:00",
        title: "Award Ceremony and Closing",
        titleTh: "พิธีมอบรางวัล และปิดการประชุม",
        location: "Main Stage",
        locationTh: "Main Stage",
        type: "Ceremony",
        typeTh: "พิธีการ",
        track: "Main Stage",
        trackTh: "เวทีหลัก",
        speakers: [
          {
            name: "Pharm. Chomkanang Phumsaidorn",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanathum",
            nameTh: "ภก. กฤษฎิ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      }
    ]
  }
];
