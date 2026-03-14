export interface Speaker {
    id: number;
    name: string;
    position: string;
    image: string;
    socials: {
        facebook?: string;
        linkedin?: string;
        instagram?: string;
        pinterest?: string;
    };
}

export const speakersData: Speaker[] = [
    {
        id: 1,
        name: "Alex Robertson",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img12.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 2,
        name: "Alexy Sammony",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img13.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 3,
        name: "Kireon Pollardy",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img14.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 4,
        name: "Adresy Ineasta",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img15.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 5,
        name: "Alex Robertson",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img16.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 6,
        name: "Alexy Sammony",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img17.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 7,
        name: "Adresy Ineasta",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img18.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    },
    {
        id: 8,
        name: "Alex Robertson",
        position: "UI/UX Designer",
        image: "/assets/img/all-images/team/team-img19.png",
        socials: { facebook: "#", linkedin: "#", instagram: "#", pinterest: "#" }
    }
];
