// Auditoría del build estático (dist/): links y botones, SEO básico por página.
// - Links internos: el destino debe existir (página, archivo o redirección 301 conocida) y,
//   si tiene #ancla, el id debe existir en la página destino. Ningún href="#" ni vacío.
// - Externos: wa.me / tel: / mailto: con formato válido; el resto se lista como externo.
// - SEO: un solo <h1>, title y meta description únicos y con largo razonable.
// Genera docs/BOTONES.md y docs/AUDITORIA-SEO.md. Sale con código 1 si hay errores.
// Uso: npm run build && node scripts/auditar-sitio.mjs
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REDIRECCIONES, destinoRedireccion } from '../src/lib/redirects.mjs';

const DIST = existsSync('dist/client') ? 'dist/client' : 'dist';

function* html(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* html(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const rutaDe = (archivo) => {
  let r = '/' + path.relative(DIST, archivo).split(path.sep).join('/');
  r = r.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return r.length > 1 ? r.replace(/\/$/, '') : '/';
};

const paginas = new Map();
for (const archivo of html(DIST)) {
  const ruta = rutaDe(archivo);
  if (ruta === '/404') continue;
  paginas.set(ruta, readFileSync(archivo, 'utf8'));
}

const archivoDe = (ruta) => {
  const limpia = ruta.replace(/\/$/, '') || '/';
  if (paginas.has(limpia)) return limpia;
  const f = path.join(DIST, limpia);
  if (existsSync(f) && statSync(f).isFile()) return limpia;
  return null;
};

const texto = (s) =>
  s
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const attr = (tag, nombre) => tag.match(new RegExp(`\\s${nombre}="([^"]*)"`))?.[1];
const ids = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

function estadoHref(href, origen) {
  if (href === undefined || href === '' || href === '#') return ['ERROR', 'href vacío o "#"'];
  if (/^https:\/\/wa\.me\/\d{10,15}(\?text=.*)?$/.test(href)) return ['OK', 'WhatsApp'];
  if (/^tel:\+?\d{8,15}$/.test(href)) return ['OK', 'Teléfono'];
  if (/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href)) return ['OK', 'Mail'];
  if (/^https?:\/\//.test(href)) return ['OK', 'Externo'];
  if (href.startsWith('#')) {
    const id = decodeURIComponent(href.slice(1));
    return ids(paginas.get(origen) ?? '').has(id)
      ? ['OK', 'Ancla']
      : ['ERROR', `no existe #${id} en la página`];
  }
  if (!href.startsWith('/')) return ['ERROR', 'URL relativa'];
  const [sinHash, hash] = href.split('#');
  const ruta = sinHash.split('?')[0] || '/';
  let destino = archivoDe(ruta);
  if (!destino) {
    const red = destinoRedireccion(ruta.replace(/\/$/, '')) ?? REDIRECCIONES[ruta];
    if (red) return ['OK', `301 → ${red}`];
    return ['ERROR', 'destino inexistente'];
  }
  if (hash && paginas.has(destino)) {
    // Fichas de casos: /casos#slug abre el modal data-ficha="slug".
    const h = paginas.get(destino);
    const id = decodeURIComponent(hash);
    if (!ids(h).has(id) && !h.includes(`data-ficha="${id}"`)) return ['ERROR', `no existe #${id}`];
  }
  return ['OK', 'Interno'];
}

const filas = [];
const globales = new Map();
let errores = 0;
for (const [ruta, h] of paginas) {
  const main = h.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
  const fuera = h.replace(main, '');
  const recolectar = (fragmento, destinoFilas) => {
    for (const m of fragmento.matchAll(/<a\s[^>]*>[\s\S]*?<\/a>/g)) {
      const tag = m[0].match(/<a\s[^>]*>/)[0];
      const href = attr(tag, 'href');
      const t = texto(m[0]) || attr(tag, 'aria-label') || '(sin texto)';
      const [estado, detalle] = estadoHref(href, ruta);
      destinoFilas(t, href ?? '', estado, detalle);
    }
    for (const m of fragmento.matchAll(/<button\s[^>]*>[\s\S]*?<\/button>/g)) {
      const tag = m[0].match(/<button\s[^>]*>/)[0];
      const t = texto(m[0]) || attr(tag, 'aria-label') || '(sin texto)';
      const accion = tag.includes('type="submit"')
        ? 'Envía formulario'
        : 'Acción en la página (JS)';
      destinoFilas(t, '—', 'OK', accion);
    }
    for (const m of fragmento.matchAll(/<summary[\s\S]*?<\/summary>/g)) {
      destinoFilas(texto(m[0]).slice(0, 70), '—', 'OK', 'Acordeón (details)');
    }
  };
  recolectar(main, (t, href, estado, detalle) => {
    if (estado === 'ERROR') errores++;
    filas.push({ ruta, t, href, estado, detalle });
  });
  if (ruta === '/') {
    recolectar(fuera, (t, href, estado, detalle) => {
      if (estado === 'ERROR') errores++;
      const k = `${t}|${href}`;
      if (!globales.has(k)) globales.set(k, { t, href, estado, detalle });
    });
  } else {
    // Errores en header/footer de otras páginas (p. ej. anclas) también cuentan.
    recolectar(fuera, (t, href, estado) => {
      if (estado === 'ERROR') {
        errores++;
        filas.push({ ruta, t, href, estado, detalle: 'global (header/footer)' });
      }
    });
  }
}

const esc = (s) => String(s).replace(/\|/g, '\\|').slice(0, 90);
const tabla = (rows, conPagina) =>
  [
    conPagina ? '| Página | Texto | Destino | Estado |' : '| Texto | Destino | Estado |',
    conPagina ? '| --- | --- | --- | --- |' : '| --- | --- | --- |',
    ...rows.map((r) =>
      conPagina
        ? `| ${r.ruta} | ${esc(r.t)} | ${esc(r.href)} | ${r.estado === 'OK' ? 'OK' : '**A corregir**'} · ${esc(r.detalle)} |`
        : `| ${esc(r.t)} | ${esc(r.href)} | ${r.estado === 'OK' ? 'OK' : '**A corregir**'} · ${esc(r.detalle)} |`,
    ),
  ].join('\n');

writeFileSync(
  'docs/BOTONES.md',
  `# Tabla de botones y links

> Generada automáticamente por \`scripts/auditar-sitio.mjs\` sobre el build (${new Date().toISOString().slice(0, 10)}).
> **${errores === 0 ? 'Sin errores: todos los destinos existen.' : `${errores} a corregir.`}**
> WhatsApp/teléfono/mail se validan por formato; los externos no se visitan.

## Globales (header, menú, footer, barra mobile, chat de WhatsApp)

${tabla([...globales.values()], false)}

## Por página (contenido principal)

${tabla(filas, true)}
`,
);

// SEO
const seo = [];
const titulos = new Map();
const descs = new Map();
let erroresSeo = 0;
for (const [ruta, h] of paginas) {
  const title = texto(h.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const h1 = (h.match(/<h1[\s>]/g) ?? []).length;
  const canonical = h.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
  const robots = h.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  titulos.set(title, [...(titulos.get(title) ?? []), ruta]);
  descs.set(desc, [...(descs.get(desc) ?? []), ruta]);
  const avisos = [];
  if (h1 !== 1) avisos.push(`${h1} H1`);
  if (!desc) avisos.push('sin description');
  else if (desc.length > 170) avisos.push(`description larga (${desc.length})`);
  if (title.length > 75) avisos.push(`title largo (${title.length})`);
  if (!canonical) avisos.push('sin canonical');
  if (avisos.some((a) => a.includes('H1') || a.startsWith('sin'))) erroresSeo++;
  seo.push({ ruta, title, desc: desc.length, h1, robots, avisos });
}
for (const [t, rutas] of titulos)
  if (rutas.length > 1) {
    erroresSeo++;
    seo.find((s) => s.ruta === rutas[1]).avisos.push(`title duplicado con ${rutas[0]} ("${t}")`);
  }
for (const [d, rutas] of descs)
  if (d && rutas.length > 1) {
    erroresSeo++;
    seo.find((s) => s.ruta === rutas[1]).avisos.push(`description duplicada con ${rutas[0]}`);
  }

writeFileSync(
  'docs/AUDITORIA-SEO.md',
  `# Auditoría SEO por página

> Generada por \`scripts/auditar-sitio.mjs\` (${new Date().toISOString().slice(0, 10)}). ${erroresSeo === 0 ? '**Sin errores.**' : `**${erroresSeo} a revisar.**`}

| Página | Title | Desc. | H1 | Avisos |
| --- | --- | --- | --- | --- |
${seo.map((s) => `| ${s.ruta} | ${esc(s.title)} (${s.title.length}) | ${s.desc} | ${s.h1} | ${s.avisos.join(' · ') || 'OK'} |`).join('\n')}
`,
);

console.log(
  `Páginas: ${paginas.size} · links/botones revisados: ${filas.length + globales.size} · errores de links: ${errores} · avisos SEO: ${erroresSeo}`,
);
process.exit(errores + erroresSeo > 0 ? 1 : 0);
