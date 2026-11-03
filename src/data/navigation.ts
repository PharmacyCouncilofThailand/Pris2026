export interface NavItem {
  labelKey: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
  disabled?: boolean;
  /** Hide from nav until user is logged in */
  authRequired?: boolean;
}

export const navigationData: NavItem[] = [
  {
    labelKey: "home",
    href: "/",
  },
  {
    labelKey: "eventGallery",
    authRequired: true,
    children: [
      {
        labelKey: "eventGalleryDay1",
        href: "https://photos.app.goo.gl/8LyX4zJF2j6KzLjv9",
        external: true,
      },
      {
        labelKey: "eventGalleryDay2",
        href: "https://photos.app.goo.gl/iJ89uSGoX8kUxWei7",
        external: true,
      },
    ],
  },
  {
    labelKey: "about",
    children: [
      { labelKey: "aboutPris", href: "/about" },
      { labelKey: "welcomeMessages", href: "/welcome-messages" },
    ],
  },
  {
    labelKey: "agenda",
    href: "/agenda",
  },
  {
    labelKey: "abstracts",
    children: [
      { labelKey: "callForAbstracts", href: "/call-for-abstracts" },
      {
        labelKey: "acceptedAbstractsAnnouncement",
        href: "/approved-abstracts",
      },
      { labelKey: "presentationTemplates", href: "/presentation-templates" },
    ],
  },
  {
    labelKey: "posterGallery",
    href: "/poster-gallery",
  },
  {
    labelKey: "registration",
    href: "/registration",
  },
  {
    labelKey: "merchandise",
    href: "/souvenirs",
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
    labelKey: "more",
    authRequired: true,
    children: [
      { labelKey: "hotelBookingForm", href: "/hotel-booking-form" },
      { labelKey: "inviteLetter", href: "/invite-letter" },
      {
        labelKey: "oralPosterPresentationCriteria",
        href: "/oral-poster-presentation-criteria",
      },
    ],
  },
  {
    labelKey: "contact",
    href: "/contact",
  },
];
