// Genera favicons e imagen Open Graph por defecto a partir de las imágenes de marca.
// Uso: node scripts/generate-brand-assets.mjs
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const ISOTIPO = 'src/assets/images/marca/isotipo.png';
const FONDO_OG = 'src/assets/images/servicios/capacitacion-planta.webp';

await mkdir('public/og', { recursive: true });

// Favicons
await sharp(ISOTIPO).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(ISOTIPO).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(ISOTIPO).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(ISOTIPO).resize(48, 48).toFormat('png').toFile('public/favicon.ico');

// Open Graph 1200×630: foto oscurecida + isotipo + textos
const W = 1200;
const H = 630;
const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0f1013" stop-opacity="0.95"/>
      <stop offset="0.65" stop-color="#0f1013" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#0f1013" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="80" y="${H - 14}" width="${W - 160}" height="6" fill="#0033ff"/>
  <text x="80" y="300" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="#ffffff">PISCOBOT 3D</text>
  <text x="80" y="370" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#c3c7ce">Expertos en impresión 3D</text>
  <text x="80" y="440" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#9aa0aa">Servicio técnico · Capacitación · Impresión · Diseño · Merchandising</text>
</svg>`);

const iso = await sharp(ISOTIPO).resize(120, 120).png().toBuffer();
await sharp(FONDO_OG)
  .resize(W, H, { fit: 'cover' })
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: iso, top: 110, left: 80 },
  ])
  .jpeg({ quality: 85 })
  .toFile('public/og/default.jpg');

console.log('Favicons y OG generados en public/');
