export const scheduleData = [
  {
    day: "Day 1",
    date: "July 9, 2026",
    events: [
      { 
        id: 1, 
        time: "08:00 - 09:00", 
        title: "Registration & Welcome Coffee", 
        location: "Grand Foyer", 
        type: "Registration" 
      },
      { 
        id: 2, 
        time: "09:00 - 10:30", 
        title: "Opening Ceremony & Keynote Address", 
        description: "Hear from our distinguished guests as we kick off the ACCP 2026 conference.", 
        location: "World Ballroom", 
        type: "Keynote",
        speakers: [
          {
            name: "Prof. Dr. Kenji Yamamoto",
            role: "ACCP President",
            image: "/assets/Img/all-images/memory/memory1.jpg"
          }
        ]
      },
      { 
        id: 3, 
        time: "10:30 - 11:00", 
        title: "Networking Break & Exhibition Viewing", 
        location: "Exhibition Hall", 
        type: "Break" 
      },
      { 
        id: 4, 
        time: "11:00 - 12:30", 
        title: "Plenary Session 1: Future of Clinical Pharmacy", 
        description: "Exploring the latest trends and innovations shaping the future of clinical pharmacy practice.", 
        location: "World Ballroom", 
        type: "Session",
        speakers: [
          {
            name: "Dr. Sarah Jenkins",
            role: "Plenary Speaker",
            image: "/assets/Img/Welcome message/Mr. Preecha Bhandtivej.jpg"
          },
          {
            name: "Dr. Emily Chen",
            role: "Panelist",
            image: "/assets/Img/all-images/bangkok/img2.jpg"
          },
          {
            name: "Dr. James Carter",
            role: "Panelist",
            image: "/assets/Img/all-images/memory/memory1.jpg"
          },
          {
            name: "Prof. Maria Lopez",
            role: "Panelist",
            image: "/assets/Img/Welcome message/Mr. Preecha Bhandtivej.jpg"
          }
        ]
      },
      { 
        id: 5, 
        time: "12:30 - 14:00", 
        title: "Lunch Symposia", 
        location: "Lotus Room", 
        type: "Lunch" 
      },
    ],
  },
  {
    day: "Day 2",
    date: "July 10, 2026",
    events: [
      { 
        id: 6, 
        time: "08:30 - 10:00", 
        title: "Parallel Sessions A", 
        description: "Choose from 4 different tracks covering specialized clinical areas.", 
        location: "Meeting Rooms 1-4", 
        type: "Session" 
      },
      { 
        id: 7, 
        time: "10:00 - 10:30", 
        title: "Morning Break & Poster Viewing", 
        location: "Exhibition Hall", 
        type: "Break" 
      },
      { 
        id: 8, 
        time: "10:30 - 12:00", 
        title: "Plenary Session 2: Precision Medicine", 
        description: "How genomics is transforming therapeutic approaches.", 
        location: "World Ballroom", 
        type: "Session",
        speakers: [
          {
            name: "Dr. Albert Wong",
            role: "Research Lead",
            image: "/assets/Img/all-images/bangkok/img2.jpg"
          }
        ]
      },
      { 
        id: 9, 
        time: "12:00 - 13:30", 
        title: "Networking Lunch", 
        location: "Lotus Room", 
        type: "Lunch" 
      },
      { 
        id: 10, 
        time: "13:30 - 15:30", 
        title: "Interactive Workshops", 
        description: "Hands-on training sessions with industry experts.", 
        location: "Meeting Rooms 1-4", 
        type: "Workshop",
        speakers: [
          {
            name: "Dr. Robert Garcia",
            role: "Workshop Lead",
            image: "/assets/Img/all-images/memory/memory1.jpg"
          }
        ]
      },
    ],
  },
  {
    day: "Day 3",
    date: "July 11, 2026",
    events: [
      { 
        id: 11, 
        time: "09:00 - 10:30", 
        title: "Plenary Session 3: Global Health Challenges", 
        description: "Addressing global health disparities and the role of pharmacists.", 
        location: "World Ballroom", 
        type: "Session",
        speakers: [
          {
            name: "Assoc. Prof. Dr. Nattiya",
            role: "PRIS 2026 Chair",
            image: "/assets/Img/all-images/bangkok/img2.jpg"
          }
        ]
      },
      { 
        id: 12, 
        time: "10:30 - 11:00", 
        title: "Coffee Break", 
        location: "Exhibition Hall", 
        type: "Break" 
      },
      { 
        id: 13, 
        time: "11:00 - 12:30", 
        title: "Award Ceremony & Closing Remarks", 
        description: "Celebrating outstanding contributions to the field of clinical pharmacy.", 
        location: "World Ballroom", 
        type: "Ceremony" 
      },
      { 
        id: 14, 
        time: "12:30 - 14:00", 
        title: "Farewell Lunch", 
        location: "Lotus Room", 
        type: "Lunch" 
      },
    ],
  },
];
