const fs = require('fs');

const data = fs.readFileSync('c:/Pris2026/src/data/scheduleData.ts', 'utf8');

const day2Events = `    events: [
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
            name: "Pharm. Chomkanang Phumsaydon",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanatham",
            nameTh: "ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang Phumsaydon",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanatham",
            nameTh: "ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang Phumsaydon",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanatham",
            nameTh: "ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang Phumsaydon",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanatham",
            nameTh: "ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang Phumsaydon",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร",
            role: "MC",
            roleTh: "พิธีกร"
          },
          {
            name: "Pharm. Krit Wattanatham",
            nameTh: "ภก. กฤษฎ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      }
    ]`;

const day2StartTag = '  {\r\n    day: "Day 2",\r\n    dayTh: "วันที่ 2",\r\n    date: "October 30, 2026",\r\n    dateTh: "30 ตุลาคม 2569",\r\n    events: [\r\n      {\r\n        id: 12,\r\n        time: "08:00 – 09:00",';

const idx = data.indexOf('  {\r\n    day: "Day 2",');
if (idx !== -1) {
    const head = data.substring(0, idx);
    const day2Header = '  {\r\n    day: "Day 2",\r\n    dayTh: "วันที่ 2",\r\n    date: "October 30, 2026",\r\n    dateTh: "30 ตุลาคม 2569",\r\n';
    const newData = head + day2Header + day2Events + '\r\n  }\r\n];\r\n';
    fs.writeFileSync('c:/Pris2026/src/data/scheduleData.ts', newData, 'utf8');
    console.log("SUCCESS");
} else {
    // Try \n
    const idx2 = data.indexOf('  {\n    day: "Day 2",');
    if (idx2 !== -1) {
        const head = data.substring(0, idx2);
        const day2Header = '  {\n    day: "Day 2",\n    dayTh: "วันที่ 2",\n    date: "October 30, 2026",\n    dateTh: "30 ตุลาคม 2569",\n';
        const newData = head + day2Header + day2Events + '\n  }\n];\n';
        fs.writeFileSync('c:/Pris2026/src/data/scheduleData.ts', newData, 'utf8');
        console.log("SUCCESS");
    } else {
        console.log("FAILED");
    }
}
