import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "./types";

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  description: `The rules and conditions for using the ${PLATFORM_NAME} online learning platform.`,
  lastUpdated: "June 14, 2026",
  sections: [
    {
      id: "agreement",
      title: "Agreement to terms",
      paragraphs: [
        `These Terms of Service ("Terms") govern your access to and use of the ${PLATFORM_NAME} website, applications, and related services (collectively, the "Platform").`,
        `By accessing or using ${PLATFORM_NAME}, creating an account, enrolling in a course, or submitting content, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the Platform.`,
      ],
    },
    {
      id: "about-platform",
      title: "About the platform",
      paragraphs: [
        `${PLATFORM_NAME} is an online learning platform that connects students with instructors through structured courses, lessons, exams, and support tools. Features may include course browsing, manual payment verification, enrollment management, messaging, notifications, and role-based dashboards for students, teachers, and administrators.`,
        "We may modify, suspend, or discontinue any part of the Platform at any time, with or without notice, to improve service quality, security, or compliance.",
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility and accounts",
      paragraphs: [
        "You must provide accurate, current, and complete information when creating an account and keep your account details up to date.",
        "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.",
        "We reserve the right to refuse registration, suspend accounts, or terminate access where we reasonably believe these Terms have been violated or where necessary to protect the Platform or its users.",
      ],
    },
    {
      id: "roles",
      title: "User roles",
      paragraphs: [
        "The Platform supports different user roles with different permissions:",
      ],
      bullets: [
        "Students may browse courses, submit payments, access enrolled content, take exams, and communicate with instructors or support staff.",
        "Teachers may create and manage courses, upload learning materials, and interact with enrolled students according to platform rules.",
        "Administrators and platform owners may review payments, approve enrollments, manage users, review courses, and perform operational tasks necessary to run the Platform.",
      ],
    },
    {
      id: "courses-enrollment",
      title: "Courses and enrollment",
      paragraphs: [
        "Course listings, descriptions, pricing, and availability are provided by instructors and the Platform and may change at any time.",
        "Enrollment in a paid course is not complete until your payment has been submitted and approved according to our verification process. Access to course content is granted only after successful verification unless a course is explicitly offered for free.",
        "We do not guarantee that any course will meet your expectations, lead to employment, certification, or a particular outcome. Course quality and applicability may vary.",
      ],
    },
    {
      id: "payments",
      title: "Payments and verification",
      paragraphs: [
        `${PLATFORM_NAME} may use manual payment methods such as bank transfer, mobile money, or cash transfer. You agree to pay the stated course price using an approved method and to submit accurate payment proof when requested.`,
        "Payment verification is performed by authorized administrators. We may approve, reject, or request additional information before granting access. Submitting false, altered, or misleading payment proof is prohibited and may result in account suspension.",
        "Unless otherwise stated on the course page or required by applicable law, all fees are final once access has been granted. Refund requests may be considered on a case-by-case basis by contacting support.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        `The Platform, including its design, branding, software, and underlying technology, is owned by or licensed to ${PLATFORM_NAME} and protected by applicable intellectual property laws.`,
        "Course content, including videos, documents, text, images, exams, and other materials, is owned by the respective instructors or licensors. Enrolling in a course grants you a limited, personal, non-transferable license to access that content for your own learning. You may not copy, redistribute, resell, publicly share, or commercially exploit course materials without permission.",
        "By submitting content to the Platform as a teacher or user, you represent that you have the rights to do so and grant SomEducation a license to host, display, and distribute that content as needed to operate the Platform.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "You agree not to misuse the Platform. Prohibited conduct includes, without limitation:",
      ],
      bullets: [
        "Sharing account credentials or selling access to courses.",
        "Uploading malware, spam, or harmful code.",
        "Harassing, threatening, or discriminating against other users.",
        "Attempting to bypass payment, enrollment, or access controls.",
        "Scraping, reverse engineering, or interfering with Platform systems.",
        "Posting unlawful, infringing, misleading, or abusive content.",
        "Impersonating another person or misrepresenting your qualifications.",
      ],
    },
    {
      id: "teacher-responsibilities",
      title: "Teacher responsibilities",
      paragraphs: [
        "Teachers are responsible for the accuracy, quality, and legality of the courses and materials they publish.",
        "Teachers must not include content that infringes third-party rights, violates applicable law, or misleads students regarding outcomes, pricing, or credentials.",
        "SomEducation may review, reject, unpublish, or remove courses that violate these Terms or platform standards.",
      ],
    },
    {
      id: "communications",
      title: "Communications and notifications",
      paragraphs: [
        "We may send you service-related messages regarding your account, payments, enrollments, security alerts, and platform updates. You agree that electronic communications satisfy any legal notice requirements where permitted.",
        "Messaging features are provided for legitimate educational and support purposes. Abuse of messaging systems may result in restricted access.",
      ],
    },
    {
      id: "termination",
      title: "Suspension and termination",
      paragraphs: [
        "We may suspend or terminate your access to the Platform at any time if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or created risk for other users or the Platform.",
        "Upon termination, your right to access the Platform and enrolled content may end, subject to any legal obligations or refund considerations that apply.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        `THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.`,
        "We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components, or that any course content will be accurate or complete.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${PLATFORM_NAME.toUpperCase()} AND ITS OPERATORS, EMPLOYEES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE PLATFORM.`,
        "Our total liability for any claim relating to the Platform shall not exceed the amount you paid to SomEducation for the specific course or service giving rise to the claim during the twelve (12) months preceding the event, or one hundred U.S. dollars (USD $100) if no such payment was made.",
      ],
    },
    {
      id: "indemnity",
      title: "Indemnification",
      paragraphs: [
        "You agree to indemnify and hold harmless SomEducation and its operators from claims, damages, losses, and expenses arising out of your use of the Platform, your content, your violation of these Terms, or your violation of any rights of another person or entity.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      paragraphs: [
        "These Terms are governed by applicable laws without regard to conflict-of-law principles. Any dispute arising from these Terms or your use of the Platform should first be addressed by contacting us at the email below.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      paragraphs: [
        "We may update these Terms from time to time. The revised version will be posted on this page with an updated \"Last updated\" date. Continued use of the Platform after changes become effective constitutes acceptance of the revised Terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        `Questions about these Terms may be sent to ${PLATFORM_SUPPORT_EMAIL}.`,
      ],
    },
  ],
};
