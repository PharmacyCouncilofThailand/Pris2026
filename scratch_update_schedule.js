const fs = require('fs');

const data = fs.readFileSync('c:/Pris2026/src/data/scheduleData.ts', 'utf8');

const newEventsStr = `    events: [
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "President / Secretary-General",
            nameTh: "นายก / เลขาธิการ"
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
            name: "Pharm. Teerawit / Pharmacy Council / College",
            nameTh: "ภก.ธีรวิทย์ บำรุงศรี / สนภท. / วิทยาลัย",
            role: "Moderator / Panelists",
            roleTh: "ผู้ดำเนินรายการ / ผู้ร่วมเสวนา"
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
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
            name: "Pharm. Chomkanang / Pharm. Krit",
            nameTh: "ภญ.โฉมคนางค์ ภูมิสายดร / ภก. กฤษฎ์ วัฒนธรรม",
            role: "MC",
            roleTh: "พิธีกร"
          }
        ]
      }
    ]`;

const parts = data.split('    events: [\r\n      {\r\n        id: 12,\r\n        time: "08:00 – 09:00",');
if (parts.length === 2) {
  const head = data.substring(0, data.indexOf('    events: ['));
  const tail = '    events: [\r\n      {\r\n        id: 12,\r\n        time: "08:00 – 09:00",' + parts[1];
  const newData = head + newEventsStr + ',\r\n  },\r\n  {\r\n    day: "Day 2",\r\n    dayTh: "วันที่ 2",\r\n    date: "October 30, 2026",\r\n    dateTh: "30 ตุลาคม 2569",\r\n' + tail;
  fs.writeFileSync('c:/Pris2026/src/data/scheduleData.ts', newData, 'utf8');
  console.log("SUCCESS");
} else {
  // Let's try splitting by Day 2 events array
  const day2Start = '  {\r\n    day: "Day 2",';
  const dataParts = data.split(day2Start);
  if (dataParts.length === 2) {
    const head = dataParts[0].substring(0, dataParts[0].indexOf('    events: ['));
    const newData = head + newEventsStr + ',\r\n  },\r\n' + day2Start + dataParts[1];
    fs.writeFileSync('c:/Pris2026/src/data/scheduleData.ts', newData, 'utf8');
    console.log("SUCCESS");
  } else {
    // try with \n only
    const day2StartN = '  {\n    day: "Day 2",';
    const dataPartsN = data.split(day2StartN);
    if (dataPartsN.length === 2) {
      const head = dataPartsN[0].substring(0, dataPartsN[0].indexOf('    events: ['));
      const newData = head + newEventsStr + ',\n  },\n' + day2StartN + dataPartsN[1];
      fs.writeFileSync('c:/Pris2026/src/data/scheduleData.ts', newData, 'utf8');
      console.log("SUCCESS");
    } else {
      console.log("FAILED TO SPLIT");
    }
  }
}
