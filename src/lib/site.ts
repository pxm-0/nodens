const fallbackOrigin = 'https://nodens.dev';

export const siteOrigin = new URL(import.meta.env.PUBLIC_SITE_URL ?? fallbackOrigin);
export const siteName = 'Nodens';
export const defaultDescription = 'A curated self-portrait in systems, texts, rituals, objects, and ongoing work.';

export function canonicalUrl(pathname: string) {
  return new URL(pathname, siteOrigin).href;
}

export const socialImageUrl = canonicalUrl('/social-card.png');
