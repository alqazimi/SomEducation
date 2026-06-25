import { PLATFORM_NAME } from "@/lib/brand";

/** Hardcoded marketing copy — not loaded from Convex. Same on all themes and screen sizes. */
export const MARKETING_HERO = {
  eyebrow: "Transform Your Future",
  headlineBefore: "Learn a skill or ",
  headlineHighlight: "teach!",
  subheadline:
    "Make learning and teaching more effective with active participation and student collaboration.",
} as const;

/** Kept for imports; identical copy so day/night always show the same hero text. */
export const MARKETING_HERO_DAY = MARKETING_HERO;

/** Hero trust strip — matches sheerxirfad.com hero (avatars + rating + active students). */
export const MARKETING_HERO_TRUST = {
  ratings: "5.0",
  subscribers: "10,000+ active students",
  avatars: [
    { id: "1", image: "https://i.pravatar.cc/96?img=11" },
    { id: "2", image: "https://i.pravatar.cc/96?img=12" },
    { id: "3", image: "https://i.pravatar.cc/96?img=15" },
    { id: "4", image: "https://i.pravatar.cc/96?img=20" },
    { id: "5", image: "https://i.pravatar.cc/96?img=32" },
    { id: "6", image: "https://i.pravatar.cc/96?img=47" },
  ],
} as const;

/** Udemy-style “trusted by” strip on the homepage. */
export const MARKETING_TRUSTED_BY = {
  headline: `${PLATFORM_NAME} is trusted by over 17,000 companies and millions of learners around the world`,
  companies: [
    { id: "volkswagen", name: "Volkswagen", logo: "/logos/trusted/volkswagen.svg" },
    { id: "samsung", name: "Samsung", logo: "/logos/trusted/samsung.svg" },
    { id: "cisco", name: "Cisco", logo: "/logos/trusted/cisco.svg" },
    { id: "vimeo", name: "Vimeo", logo: "/logos/trusted/vimeo.svg" },
    {
      id: "pg",
      name: "Procter & Gamble",
      logo: "/logos/trusted/procter-gamble.svg",
    },
    {
      id: "hpe",
      name: "Hewlett Packard Enterprise",
      logo: "/logos/trusted/hpe.svg",
    },
    { id: "citi", name: "Citi", logo: "/logos/trusted/citi.svg" },
    { id: "ericsson", name: "Ericsson", logo: "/logos/trusted/ericsson.svg" },
  ],
} as const;

export type MarketingTestimonial = {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  review: string;
  courseTitle: string;
  createdAt: string;
};

export const MARKETING_TESTIMONIALS_SECTION = {
  title: "What Our Students Say",
  description: "Real reviews from real students",
} as const;

/** Static social proof — marketing display only (sheerxirfad-style review cards). */
export const MARKETING_TESTIMONIALS: MarketingTestimonial[] = [
  {
    id: "osman",
    name: "Osman Kaynaan",
    rating: 5,
    review: "Thanks teacher",
    courseTitle: "Web Development Fundamentals",
    createdAt: "4 hours ago",
  },
  {
    id: "abdisalan",
    name: "ABDISALAN ABDI AYANLE",
    avatarUrl: "https://i.pravatar.cc/96?img=13",
    rating: 5,
    review: "Excellent",
    courseTitle: "Computer Basics for Beginners",
    createdAt: "15 hours ago",
  },
  {
    id: "guuleed",
    name: "Guuleed Axmad Ismaaciil",
    rating: 5,
    review: "Mahadsanid ustaad",
    courseTitle: "WordPress & Blogging",
    createdAt: "1 day ago",
  },
  {
    id: "zainab",
    name: "Dr Zainab Mohamud Abdi",
    avatarUrl: "https://i.pravatar.cc/96?img=9",
    rating: 4,
    review: "Waan bogaadinayaa",
    courseTitle: "Fundamentals of Digital Security",
    createdAt: "1 day ago",
  },
  {
    id: "bashir",
    name: "Mohamed Bashir Mohamed",
    rating: 5,
    review:
      "Aad baan ugu riyaaqay sharaxaada casharkaaga. Mahadsanid ustaad.",
    courseTitle: "Cybersecurity Essentials",
    createdAt: "4 days ago",
  },
  {
    id: "abdiaziz",
    name: "Abdiaziz Abdulahi",
    avatarUrl: "https://i.pravatar.cc/96?img=33",
    rating: 5,
    review: "The best I've learned this year. Thank you ustaad.",
    courseTitle: "Content Creation Training",
    createdAt: "5 days ago",
  },
];
