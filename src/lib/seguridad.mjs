// Cabeceras HTTP de seguridad. Fuente única: las escribe el .htaccess generado en el build
// (astro.config.mjs) y se documentan en docs/SEGURIDAD.md.
// La CSP permite sólo lo que el sitio usa: GTM, GA4, Google Ads, Microsoft Clarity (vía GTM),
// Cloudflare Turnstile y blob: para el visor 3D. 'unsafe-inline' en scripts es necesario por los
// scripts mínimos en línea (consentimiento, atribución, banner) y por GTM.

const GOOGLE = [
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://www.googleadservices.com',
  'https://googleads.g.doubleclick.net',
  'https://*.g.doubleclick.net',
  'https://www.google.com',
  'https://www.google.com.ar',
];
const CLARITY = ['https://www.clarity.ms', 'https://*.clarity.ms'];
const TURNSTILE = ['https://challenges.cloudflare.com'];

const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", ...GOOGLE, ...CLARITY, ...TURNSTILE],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', ...GOOGLE, ...CLARITY],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'blob:', 'data:', ...GOOGLE, ...CLARITY, ...TURNSTILE],
  'frame-src': [
    ...TURNSTILE,
    'https://www.googletagmanager.com',
    'https://td.doubleclick.net',
    'https://bid.g.doubleclick.net',
  ],
  'worker-src': ["'self'", 'blob:'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'", 'https://wa.me', 'https://api.whatsapp.com'],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

export const CSP = Object.entries(csp)
  .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
  .join('; ');

/** @type {Record<string, string>} */
export const CABECERAS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
