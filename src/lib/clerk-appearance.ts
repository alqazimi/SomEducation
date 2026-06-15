import { BRAND_BLUE } from "@/lib/brand";

/** Shared Clerk UI — hides dev banner and matches SomEducation brand. */
export const clerkAppearance = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorPrimary: BRAND_BLUE,
    colorText: "#1c1917",
    colorTextSecondary: "#57534e",
    borderRadius: "0.375rem",
    fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  },
  elements: {
    card: "shadow-sm border border-stone-200",
    headerTitle: "text-stone-900 font-medium",
    headerSubtitle: "text-stone-600",
    formButtonPrimary:
      "bg-[#0056D2] hover:bg-[#004BB8] text-sm font-medium normal-case",
    footerActionLink: "text-[#0056D2] hover:text-[#004BB8]",
  },
} as const;
