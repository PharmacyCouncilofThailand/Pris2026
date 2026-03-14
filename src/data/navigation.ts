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
        children: [
            { labelKey: "abstractGuideline", href: "/abstract-submission-guideline" },
            { labelKey: "callForAbstracts", href: "/call-for-abstracts" },
        ],
    },
    {
        labelKey: "registration",
        children: [
            { labelKey: "registrationInfo", href: "/registration" },
            { labelKey: "policies", href: "/registration-policies" },
        ],
    },
    {
        labelKey: "sponsorship",
        children: [
            { labelKey: "confirmedSponsors", href: "/sponsorship/confirmed-sponsors" },
            { labelKey: "sponsorshipProspectusMenu", href: "/sponsorship/sponsorship-prospectus" },
            { labelKey: "exhibitionFloorPlan", href: "/sponsorship/exhibition-floor-plan" },
        ],
    },
    {
        labelKey: "more",
        children: [
            { labelKey: "gallery", href: "/gallery" },
            { labelKey: "contact", href: "/contact" },
        ],
    },
];
