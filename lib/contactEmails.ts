export const CONTACT_EMAILS = Object.freeze({
  support: "support@burmesebridge.com",
  copyright: "copyright@burmesebridge.com",
  privacy: "privacy@burmesebridge.com",
});

export type ContactEmailRole = keyof typeof CONTACT_EMAILS;

export function contactMailto(role: ContactEmailRole, subject?: string) {
  const address = CONTACT_EMAILS[role];
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
