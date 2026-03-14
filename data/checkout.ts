export interface RegistrationPackage {
  id: string;
  priceUSD: number;
  priceTHB: number;
  originalPriceUSD?: number;
  originalPriceTHB?: number;
  features: string[];
}

export interface AddOn {
  id: string;
  priceUSD: number;
  priceTHB: number;
}

export const registrationPackages: RegistrationPackage[] = [
  {
    id: "student",
    priceUSD: 250,
    priceTHB: 4900,
    originalPriceUSD: 270,
    originalPriceTHB: 4900,
    features: [
      "Full conference access",
      "Conference materials",
      "Certificate of attendance",
      "Networking sessions",
    ],
  },
  {
    id: "professional",
    priceUSD: 385,
    priceTHB: 7900,
    originalPriceUSD: 400,
    originalPriceTHB: 8900,
    features: [
      "Full conference access",
      "Conference materials",
      "Certificate of attendance",
      "Networking sessions",
      "Workshop access",
      "Premium seating",
    ],
  },
];

export const addOns: AddOn[] = [
  {
    id: "workshop",
    priceUSD: 70,
    priceTHB: 2100,
  },
  {
    id: "gala",
    priceUSD: 75,
    priceTHB: 2200,
  },
];

export const workshopOptions = [
  {
    value: "workshop1",
    label: "Workshop I : Scientific writing",
    isFull: false,
    count: 32,
  },
  { value: "workshop2", label: "Workshop II : APOP", isFull: true, count: 50 },
  { value: "workshop3", label: "Workshop III : TBA", isFull: false, count: 12 },
  { value: "workshop4", label: "Workshop IV : TBA", isFull: false, count: 5 },
];
