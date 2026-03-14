// Committee Data Types
export interface CommitteeMember {
    name: string;
    affiliation: string;
    title?: string; // For roles like Chairman, Vice Chairman, etc.
}

export interface CommitteeCategory {
    category: string;
    members: CommitteeMember[];
}

// Conference Committee Data
export const committeeData: CommitteeCategory[] = [
    {
        category: "ADVISORS",
        members: [
            { name: "Mr. Preecha Bhandtivej", affiliation: "President of the Pharmacy Council of Thailand", title: "" }
        ]
    },
    {
        category: "ORGANIZING COMMITTEE",
        members: [
            { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Chotirat Nakaranurack", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "Vice Chairman" },
            { name: "Dr. Noppadon Atjimathira", affiliation: "Second Vice President of the Pharmacy Council of Thailand", title: "" },
            { name: "Assoc. Prof. Sunee Lertsinudom", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University", title: "" },
            { name: "Miss Chanakit Imbumrung", affiliation: "Treasurer of the Pharmacy Council of Thailand", title: "" },
            { name: "Miss Chomchanok Pumsaydon", affiliation: "Faculty of Pharmaceutical Sciences, Naresuan University", title: "" },
            { name: "Mr. Aphinan Watcharaphichart", affiliation: "Assistant secretary-general of the Pharmacy Council of Thailand", title: "" },
            { name: "Assoc. Prof. Dr. Preecha Montakantikul", affiliation: "Faculty of Pharmacy, Mahidol University", title: "" },
            { name: "Assoc. Prof. Dr. Weerachai Chaijamorn", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Dr. Suvit Teerakulchon", affiliation: "President of the Pharmaceutical Association of Thailand under the Royal Patronage", title: "" },
            { name: "Mr. Komsan Sotangkur", affiliation: "President of the Association of Hospital Pharmacist of Thailand", title: "" },
            { name: "Ms. Penthipha Kaewketthong", affiliation: "President of the Community Pharmacy Association of Thailand", title: "" },
            { name: "Prof. Dr. Pornsak Sriamornsak", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Assoc. Prof. Dr. Wanna Sriwiriyanupap", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Assoc. Prof. Dr. Narisa Kamkaen", affiliation: "Faculty of Pharmacy, Pathumthani University", title: "" },
            { name: "Assoc. Prof. Dr. Satit Puttipipatkhachorn", affiliation: "Faculty of Pharmacy, Mahidol University", title: "" },
            { name: "Asst. Prof. Dr. Surasit Lochid-amnuay", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Assoc. Prof. Dr. Korn Sornlertlamvanich", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University", title: "" },
            { name: "Prof. Dr. Chonlaphat Sukasem", affiliation: "Faculty of Medicine Ramathibodi Hospital, Mahidol University", title: "" },
            { name: "Asst. Prof. Dr. Thanompong Sathienluckana", affiliation: "Faculty of Pharmacy, Siam University", title: "" },
            { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "Secretary" },
            { name: "Mr. Jesada Chantharaprasert", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" },
            { name: "Acting Sub Lt. Piyawat Jarusit", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" },
            { name: "Miss Pinchaya Toprayoon", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" },
            { name: "Mr. Chanayus Jittamornchai", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" },
            { name: "Mr. Thanaphat Kitcharoen", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" },
            { name: "Miss Sirarat Rattanachai", affiliation: "Pharmacy Council of Thailand", title: "Assistant Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON ACADEMIC CONFERENCE ORGANIZING",
        members: [
            { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "Advisors" },
            { name: "Asst. Prof. Dr. Thanompong Sathienluckana", affiliation: "Faculty of Pharmacy, Siam University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Chotirat Nakaranurack", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Assoc. Prof. Dr. Weerachai Chaijamorn", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Assoc. Prof. Dr. Preecha Montakantikul", affiliation: "Faculty of Pharmacy, Mahidol University", title: "" },
            { name: "Asst. Prof. Dr. Orawan Sae-Lim", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University", title: "" },
            { name: "Asst. Prof. Dr. Yotsaya Kunlamas", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Dr. Thitinun Raknoo", affiliation: "Department of Pharmacy, Suratthani Hospital", title: "" },
            { name: "Dr. Nint Polruang", affiliation: "Department of Pharmacy, Khon Kaen Hospital", title: "" },
            { name: "Dr. Thanawat Chattaweelarp", affiliation: "Faculty of Pharmacy, Payap University", title: "" },
            { name: "Dr. Neeracha Phon-in", affiliation: "Department of Pharmacy, Songklanagarind Hospital", title: "" },
            { name: "Asst. Prof. Dr. Tuanthon Boonlue", affiliation: "Faculty of Pharmaceutical Sciences, Ubon Ratchathani University", title: "" },
            { name: "Miss Pinchaya Toprayoon", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON ACADEMIC WRITING",
        members: [
            { name: "Assoc. Prof. Dr. Wichai Santimaleeworagun", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Suthinee Taesottikul", affiliation: "Faculty of Pharmacy, Chiang Mai University", title: "" },
            { name: "Asst. Prof. Dr. Sirima Sitaruno", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University", title: "" },
            { name: "Asst. Prof. Dr. Daraporn Rungprai", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON FINANCE, FUNDRAISING, AND SPONSORSHIP",
        members: [
            { name: "Asst. Prof. Dr. Warunsuda Sripakdee", affiliation: "Faculty of Pharmaceutical Sciences, Prince of Songkla University", title: "Chairman" },
            { name: "Miss Chanakit Imbumrung", affiliation: "Treasurer of the Pharmacy Council of Thailand", title: "" },
            { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Mr. Chanayus Jittaamornchai", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON REGISTRATION AND PUBLIC RELATIONS",
        members: [
            { name: "Assoc. Prof. Sunee Lertsinudom", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University", title: "Advisors" },
            { name: "Mr. Aphinan Watcharaphichart", affiliation: "Assistant secretary-general of the Pharmacy Council of Thailand", title: "Chairman" },
            { name: "Miss Chomchanok Pumsaydon", affiliation: "Faculty of Pharmaceutical Sciences, Naresuan University", title: "" },
            { name: "Dr. Supanun Pungcharoenkijkul", affiliation: "Department of Pharmacy, Nopparat Rajathanee Hospital", title: "" },
            { name: "Dr. Pannee Leelawattanachai", affiliation: "College of Pharmacy, Rangsit University", title: "" },
            { name: "Asst. Prof. Dr. Tuanthon Boonlue", affiliation: "Faculty of Pharmaceutical Sciences, Ubon Ratchathani University", title: "" },
            { name: "Mr. Thanaphat Kitcharoen", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON VENUE, ACCOMMODATION, AND LOGISTICS",
        members: [
            { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Suthan Chanthawong", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University", title: "" },
            { name: "Miss Sirarat Rattana", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON CEREMONY AND AUDIO-VISUAL TEAM",
        members: [
            { name: "Asst. Prof. Dr. Chotirat Nakaranurack", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Juthathip Suphanklang", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Assoc. Prof. Dr. Pornwalai Boonmuang", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Asst. Prof. Dr. Jatapat Hemapanpairoa", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Asst. Prof. Dr. Weerayuth Saelim", affiliation: "Faculty of Pharmacy, Silpakorn University", title: "" },
            { name: "Acting Sub Lt. Piyawat Jarusit", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    },
    {
        category: "SUBCOMMITTEE ON RECEPTION",
        members: [
            { name: "Asst. Prof. Dr. Manit Sae-teaw", affiliation: "Faculty of Pharmaceutical Sciences, Khon Kaen University", title: "Chairman" },
            { name: "Asst. Prof. Dr. Sirichai Chusiri", affiliation: "Faculty of Pharmaceutical Sciences, Chulalongkorn University", title: "" },
            { name: "Asst. Prof. Dr. Pitchaya Dilokpattanamongkol", affiliation: "Faculty of Pharmacy, Mahidol University", title: "" },
            { name: "Mr. Jesada Jantharaprasert", affiliation: "Pharmacy Council of Thailand", title: "Secretary" }
        ]
    }
]
