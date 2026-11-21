// Verifica que cada URL vieja del WordPress termine (con 301, máx. 2 saltos) en la nueva.
// Uso: node scripts/check-redirects.mjs [baseUrl]   (por defecto http://localhost:4321)
import { REDIRECCIONES } from '../src/lib/redirects.mjs';

const CASOS_PREFIJO = {
  '/industria': '/empresas',
  '/industria/servicio-tecnico': '/empresas/servicio-tecnico',
  '/industria/capacitaciones': '/empresas/capacitaciones',
  '/industria/impresion-y-desarrollo': '/empresas/impresion-y-desarrollo',
};

const base = process.argv[2] ?? 'http://localhost:4321';

async function seguir(url) {
  const saltos = [];
  let actual = url;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(new URL(actual, base), { redirect: 'manual' });
    if (res.status !== 301 && res.status !== 308)
      return { saltos, final: actual, status: res.status };
    actual = res.headers.get('location') ?? '';
    saltos.push(`${res.status}→${actual}`);
  }
  return { saltos, final: actual, status: 0 };
}

let fallas = 0;
for (const [viejo, nuevo] of Object.entries({ ...REDIRECCIONES, ...CASOS_PREFIJO })) {
  for (const variante of [viejo, `${viejo}/`]) {
    const { saltos, final } = await seguir(variante);
    const ok =
      saltos.length > 0 &&
      saltos.length <= 2 &&
      new URL(final, base).pathname + new URL(final, base).hash === nuevo;
    if (!ok) fallas++;
    console.log(`${ok ? 'OK   ' : 'FALLA'} ${variante}  ${saltos.join('  ')}`);
  }
}
console.log(fallas ? `\n${fallas} redirecciones con problemas` : '\nTodas las redirecciones OK');
process.exit(fallas ? 1 : 0);
