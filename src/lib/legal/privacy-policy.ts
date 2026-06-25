import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "./types";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  description: `How ${PLATFORM_NAME} collects, uses, and protects your personal information.`,
  lastUpdated: "June 14, 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      paragraphs: [
        `${PLATFORM_NAME} ("we," "us," or "our") operates an online learning platform at someducation.com. This Privacy Policy explains what information we collect when you use our website and services, how we use it, and the choices you have.`,
        `By creating an account, enrolling in a course, or otherwise using ${PLATFORM_NAME}, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use our services.`,
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "We collect information you provide directly, information generated through your use of the platform, and limited technical data needed to operate the service securely.",
      ],
      bullets: [
        "Account information such as your name, email address, profile image, and authentication credentials when you register or sign in.",
        "Profile and role data, including whether you are a student, teacher, or administrator, and any information you submit when applying to become a teacher.",
        "Enrollment and learning activity, including courses you view, purchase, or access; lesson progress; exam submissions; and completion status.",
        "Payment-related information, including payment method selected, transaction references, and proof-of-payment files you upload for manual verification.",
        "Communications you send through the platform, including messages to teachers or administrators and support inquiries.",
        "Content you submit, such as course materials uploaded by instructors or files attached to payment submissions.",
        "Technical and usage data, including device type, browser, IP address, pages visited, and error logs used to maintain platform security and performance.",
      ],
    },
    {
      id: "how-we-use",
      title: "How we use your information",
      paragraphs: [
        "We use the information we collect to operate, secure, and improve the platform. Specifically, we use it to:",
      ],
      bullets: [
        "Create and manage your account and authenticate your identity.",
        "Process course enrollments and verify manual payments submitted by students.",
        "Provide access to purchased courses, lessons, exams, and learning materials.",
        "Enable communication between students, teachers, and administrators.",
        "Send service-related notifications, including payment status updates and account alerts.",
        "Review teacher applications, moderate course submissions, and maintain platform quality.",
        "Detect, prevent, and respond to fraud, abuse, or security incidents.",
        "Comply with legal obligations and enforce our Terms of Service.",
      ],
    },
    {
      id: "authentication",
      title: "Authentication and third-party services",
      paragraphs: [
        `${PLATFORM_NAME} uses trusted third-party providers to deliver core platform functionality. These providers process data on our behalf according to their own privacy policies and applicable agreements.`,
        "Authentication is handled through our secure sign-in system, which processes your email address, name, and sign-in activity. Passwords are stored using industry-standard hashing and are never stored in plain text.",
        "Our application infrastructure, database, and file storage are provided by Convex and related hosting partners. Course data, payment records, uploaded files, and account-linked activity are stored securely within these systems.",
        "Our website is hosted on Vercel, which may process standard web server logs and performance data.",
      ],
    },
    {
      id: "payment-data",
      title: "Payment information",
      paragraphs: [
        `${PLATFORM_NAME} currently uses a manual payment verification process. When you enroll in a paid course, you may submit payment proof such as a bank transfer receipt, mobile money confirmation, or similar documentation.`,
        "We do not store full bank account numbers or payment card details on our servers. We retain the payment method you selected, reference numbers you provide, uploaded proof files, verification status, and administrative review notes needed to confirm enrollment.",
        "Payment records are accessible to authorized administrators for verification purposes and may be retained for accounting, dispute resolution, and legal compliance.",
      ],
    },
    {
      id: "sharing",
      title: "How we share information",
      paragraphs: [
        "We do not sell your personal information. We may share information only in the following circumstances:",
      ],
      bullets: [
        "With service providers that help us operate the platform, such as authentication, hosting, storage, and infrastructure providers.",
        "With teachers and administrators when necessary to deliver courses, verify payments, respond to support requests, or review platform activity.",
        "When required by law, regulation, legal process, or governmental request.",
        "To protect the rights, property, or safety of SomEducation, our users, or others.",
        "In connection with a merger, acquisition, or sale of assets, subject to appropriate confidentiality protections.",
      ],
    },
    {
      id: "retention",
      title: "Data retention",
      paragraphs: [
        "We retain personal information for as long as your account is active or as needed to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.",
        "Payment records, enrollment history, and administrative audit logs may be retained for a longer period where required for financial, legal, or operational reasons.",
        "You may request deletion of your account by contacting us. Some information may remain in backup systems or where retention is required by law.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We implement reasonable administrative, technical, and organizational measures designed to protect personal information against unauthorized access, loss, misuse, or alteration.",
        "No method of transmission over the internet or electronic storage is completely secure. While we work to safeguard your data, we cannot guarantee absolute security.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights and choices",
      paragraphs: [
        "Depending on your location, you may have rights regarding your personal information, including the right to access, correct, delete, or restrict certain processing.",
        "You can update much of your account information through your profile settings. For other requests, contact us using the details below.",
        "You may opt out of non-essential communications where applicable, but we may still send important service notices related to your account, payments, or enrollments.",
      ],
    },
    {
      id: "children",
      title: "Children's privacy",
      paragraphs: [
        `${PLATFORM_NAME} is intended for users who can enter into a binding agreement under applicable law. We do not knowingly collect personal information from children under 13 without appropriate parental consent.`,
        "If you believe a child has provided us with personal information without authorization, please contact us and we will take appropriate steps to remove it.",
      ],
    },
    {
      id: "international",
      title: "International users",
      paragraphs: [
        "SomEducation may process and store information in countries other than your own. By using our services, you understand that your information may be transferred to and processed in locations where data protection laws may differ from those in your jurisdiction.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. When we do, we will revise the \"Last updated\" date at the top of this page. Material changes may also be communicated through the platform or by email where appropriate.",
        "Your continued use of SomEducation after an update becomes effective constitutes acceptance of the revised policy.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        `If you have questions about this Privacy Policy or how we handle your information, contact us at ${PLATFORM_SUPPORT_EMAIL}.`,
      ],
    },
  ],
};
