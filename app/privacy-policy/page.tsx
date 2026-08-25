import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | BurmeseBridge",
  description: "The complete English privacy policy for BurmeseBridge, effective August 25, 2026.",
  alternates: { canonical: "https://burmesebridge.eu.cc/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "Effective Date: August 25, 2026",
      'This privacy policy for Jonas Lee ("We", "Us" or "Our") tells you how we may collect, use and share your information when you visit our website www.burmesebridge.eu.cc.',
      "We appreciate your decision to use our website www.burmesebridge.eu.cc and to trust us with your valuable personal information. In this document, we seek to explain in the clearest terms possible our privacy practices. We strongly encourage you to read this document (and any other related documents) carefully before using the website. If there are any terms or conditions in this document that you do not agree with, please do not use the website, or in case you are already using it, please discontinue the use immediately. By using the website, you are accepting and consenting to the practices described in this Privacy Policy.",
    ],
  },
  {
    title: "What information do we collect about you?",
    paragraphs: [
      "When we collect information, we do so to ensure that you get to experience our service seamlessly. For that, we collect the following information. Some are your personal information and some are your sensitive personal information.",
      "The personal information that we collect about you are the following:",
    ],
    items: ["Name", "Email address", "Professional or employment related information", "Educational information that is not publicly available", "Government ID", "Teacher Certificate"],
  },
  {
    title: "How do we collect information?",
    paragraphs: ["We may use any of the following three ways to get information about you:"],
    items: [
      "1. The information that you give us: When you sign up for an account to use our service/product or apply for verification, we will ask you certain questions like your name, email address, or credentials.",
      "2. The information that we automatically collect from you: When you access our service from a device, we may automatically collect information from your device, such as through the use of cookies.",
      "3. Information that we collect from third parties: These third parties can be data aggregators, online directories, data marketplaces or exchanges, etc., from where we may collect information about you.",
    ],
  },
  {
    title: "Cookies and Do Not Track",
    paragraphs: [
      "Cookies are small packets of information that are placed on your device, so that we can retrieve the information about you, such as your login information, your choices on our websites and other information. For more information about cookies and similar technologies, please visit our Cookie Policy.",
      'We respond to "do not track" requests in the following manner:',
      "We respect user privacy and allow users to manage their tracking preferences through our cookie consent banner. However, because there is no uniform industry standard for recognizing 'Do Not Track' (DNT) signals, our website currently does not alter its data collection practices upon receiving DNT browser signals.",
    ],
  },
  {
    title: "How do we use your information?",
    paragraphs: ["We collect information about you for a variety of reasons. It helps us, among other things, to serve you better. The following are the ways in which we use the information that we collect about you:"],
    items: ["To provide and maintain service", "To manage your account", "To contact the user", "To perform a contract with us", "To evaluate and improve our products/services", "To examine the usage trends"],
  },
  {
    title: "How long do we retain your information?",
    paragraphs: [
      "We will only keep your personal information for as long as it is necessary, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice requires us to retain your personal information for longer than the period during which users have an account with us.",
      "Verification documents (such as Government IDs and Teacher Certificates) provided for KYC or qualification verification are processed solely for identity authenticity checks and are deleted immediately after verification is completed.",
    ],
  },
  { title: "Deletion and anonymisation", paragraphs: [
    "When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible",
    "(for example, because your personal information has been stored in backup archives),",
    "then we will securely store your personal information",
    "and isolate it from any further processing until deletion is possible.",
  ] },
  { title: "Sharing your information", paragraphs: [
    "We do not sell or share the information we collect from our users with third parties for commercial or marketing purposes.",
  ] },
  { title: "Children's privacy", paragraphs: [
    "We do not knowingly provide our services to children. If you are a parent or legal guardian and believe that your child has provided us with information without your consent, please contact us. Upon verification that we have collected such information without parental consent, we will remove the information from our database.",
  ] },
  { title: "Security of your personal information", paragraphs: [
    "We take reasonable measures to ensure that the information we collect from you is stored securely and protected to the best extent possible. However, no method of internet transmission or digital storage is completely secure, and we cannot guarantee absolute security. While we use commercially reasonable and appropriate security measures to protect your information, we cannot promise that it will be 100% secure.",
  ] },
  { title: "Links to other websites or apps", paragraphs: [
    "On our website, we may provide links to external websites, apps, or services. These are not operated by us and therefore are not governed by our Privacy Policy or practices. We strongly recommend that you review the privacy policies of such websites or services before engaging with them to ensure that you do not provide personal information that you do not wish to share.",
  ] },
  { title: "Changes to this privacy policy", paragraphs: [
    "We may update this Privacy Policy from time to time to reflect changes in the law or our privacy practices. We recommend that you review this privacy policy periodically to ensure it remains in line with your expectations.",
    "The privacy policy will be effective from the date it is posted on this page.",
  ] },
  { title: "Contact us", paragraphs: [
    "For any questions or concerns regarding your privacy, or to exercise any of your rights, you may contact us using the following details:",
  ], items: [
    "Address: 12 Soi. 2 Sai Ma, Mueang Nonthaburi District, Nonthaburi 11000 dcon prime",
    "Email address: admin@burmesebridge.eu.cc",
  ] },
];

export default function PrivacyPolicyPage() {
  return <LegalPage locale="en" title="Privacy Policy" summary="How BurmeseBridge collects, uses, retains, and protects personal information." updated="August 25, 2026" sections={sections} />;
}
