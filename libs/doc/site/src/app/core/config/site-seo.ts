export const SITE_URL = 'https://nest.koalarx.com';
export const SITE_NAME = 'Koala Nest';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.svg`;

export function absoluteSiteUrl(path: string) {
  if (!path || path === '/') {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
