import { BRAND_BLUE } from "@/lib/brand";

/** Shared Clerk UI — hides dev banner and matches SomEducation brand. */
export const clerkAppearance = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorPrimary: BRAND_BLUE,
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1c1917",
    colorText: "#1c1917",
    colorTextSecondary: "#57534e",
    borderRadius: "0.375rem",
    fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
  },
  elements: {
    rootBox: "text-stone-900",
    card: "bg-white text-stone-900 shadow-lg border border-stone-200",
    cardBox: "bg-white",
    headerTitle: "text-stone-900 font-medium",
    headerSubtitle: "text-stone-600",
    socialButtonsBlockButton: "text-stone-900 border-stone-200",
    socialButtonsBlockButtonText: "text-stone-900",
    dividerLine: "bg-stone-200",
    dividerText: "text-stone-500",
    formFieldLabel: "text-stone-700",
    formFieldInput: "text-stone-900 bg-white",
    formButtonPrimary:
      "bg-[#0056D2] hover:bg-[#004BB8] text-white text-sm font-medium normal-case",
    footerActionText: "text-stone-600",
    footerActionLink: "text-[#0056D2] hover:text-[#004BB8]",
    identityPreviewText: "text-stone-900",
    identityPreviewEditButton: "text-[#0056D2]",
    formResendCodeLink: "text-[#0056D2]",
    otpCodeFieldInput: "text-stone-900",
    alertText: "text-stone-700",
  },
} as const;
