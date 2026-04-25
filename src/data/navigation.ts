export interface NavItem {
    labelKey: string;
    href?: string;
    children?: NavItem[];
}

export const navigationData: NavItem[] = [
    {
        labelKey: "home",
        href: "/",
    },
    {
        labelKey: "about",
        children: [
            { labelKey: "aboutPris", href: "/about" },
            { labelKey: "welcomeMessages", href: "/welcome-messages" },
        ],
    },
    {
        labelKey: "callForAbstracts",
        href: "/call-for-abstracts",
        // children temporarily hidden
        // children: [
        //     { labelKey: "abstractGuideline", href: "/abstract-guidelines" },
        //     { labelKey: "callForAbstracts", href: "/call-for-abstracts" },
        // ],
    },
    {
        labelKey: "registration",
        href: "/registration",
        // children temporarily hidden
        // children: [
        //     { labelKey: "registrationInfo", href: "/registration" },
        //     { labelKey: "policies", href: "/registration-policies" },
        // ],
    },
    {
        labelKey: "sponsorship",
        href: "/sponsorship",
    },
    {
        labelKey: "gallery",
        href: "/gallery",
    },
    {
        labelKey: "contact",
        href: "/contact",
    },
];
