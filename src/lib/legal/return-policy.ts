import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "./types";

export const returnPolicy: LegalDocument = {
  title: "Return & Refund Policy",
  description: `Our 24-hour return policy for paid ${PLATFORM_NAME} course purchases.`,
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "overview",
      title: "24-hour return window",
      paragraphs: [
        `At ${PLATFORM_NAME}, we want you to feel confident when you enroll in a paid course. If you are not satisfied with your purchase, you may request a return within 24 hours of when your payment is approved and course access is granted.`,
        "This policy applies to paid courses only. Free courses are not eligible for returns or refunds.",
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility",
      paragraphs: [
        "To qualify for a return under this policy, all of the following must be true:",
      ],
      bullets: [
        "Your return request is submitted within 24 hours of payment approval (when enrollment access was granted).",
        "The course was purchased through SomEducation using an approved payment method.",
        "You have not completed more than 25% of the course lessons or assessments.",
        "You have not downloaded, copied, or redistributed substantial course materials outside the Platform.",
        "Your account is in good standing and was not suspended for policy violations.",
      ],
    },
    {
      id: "how-to-request",
      title: "How to request a return",
      paragraphs: [
        `Email ${PLATFORM_SUPPORT_EMAIL} from the email address linked to your SomEducation account. Include your full name, the course name, and your payment reference or transaction details if available.`,
        "You may also contact us through the Help Center or contact page. We will confirm receipt of your request and review it against this policy.",
      ],
    },
    {
      id: "processing",
      title: "Refund processing",
      paragraphs: [
        "Approved returns are refunded to the original payment method when possible. For manual payments such as mobile money or bank transfer, refunds are sent to the same account or number used for the original payment, unless we agree otherwise in writing.",
        "Refunds are typically processed within 5–10 business days after approval. Your bank or mobile wallet provider may take additional time to post the funds.",
        "Once a return is approved, your access to the course will be removed.",
      ],
    },
    {
      id: "non-eligible",
      title: "Non-eligible purchases",
      paragraphs: [
        "The following are not eligible for returns under this 24-hour policy:",
      ],
      bullets: [
        "Requests submitted more than 24 hours after payment approval.",
        "Courses where you have completed more than 25% of lessons or assessments.",
        "Free courses or promotional enrollments with no payment.",
        "Purchases made outside SomEducation or through unauthorized third parties.",
        "Accounts terminated for fraud, abuse, or violation of our Terms of Service.",
      ],
    },
    {
      id: "exceptions",
      title: "Exceptions and chargebacks",
      paragraphs: [
        "We may make exceptions in cases of technical errors, duplicate charges, or other issues caused by the Platform. Contact support with details and we will review your situation.",
        "If you dispute a charge with your bank or payment provider before contacting us, we may pause or deny the return while the dispute is investigated.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this Return & Refund Policy from time to time. The “Last updated” date at the top of this page shows when it was last revised. Continued use of the Platform after changes constitutes acceptance of the updated policy for new purchases.",
      ],
    },
  ],
};
