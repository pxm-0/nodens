const fallbackOrigin = 'https://nodens.dev';

export const siteOrigin = new URL(import.meta.env.PUBLIC_SITE_URL ?? fallbackOrigin);
export const siteName = 'Nodens';
export const defaultDescription = 'A curated self-portrait in systems, texts, rituals, objects, and ongoing work.';

export function canonicalUrl(pathname: string) {
  return new URL(pathname, siteOrigin).href;
}

export const socialImageUrl = canonicalUrl('/social-card.png');

export const contactEmail: string = import.meta.env.PUBLIC_CONTACT_EMAIL ?? 'dustin@nodens.dev';

function bookingUrl(value: string | undefined) {
  if (!value) return undefined;
  const url = URL.canParse(value) ? new URL(value) : undefined;
  if (url?.protocol !== 'https:') {
    throw new Error(`PUBLIC_BOOKING_URL must be an https URL, got "${value}"`);
  }
  return url.href;
}

// Setting PUBLIC_BOOKING_URL at build time replaces the email action with a booking link.
export const bookingHref = bookingUrl(import.meta.env.PUBLIC_BOOKING_URL);
export const conversationHref = bookingHref ?? `mailto:${contactEmail}`;
