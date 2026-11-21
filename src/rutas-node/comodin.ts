import type { APIRoute } from 'astro';
import { destinoRedireccion } from '../lib/redirects.mjs';

// Ruta comodín del servidor (menor prioridad que cualquier página real):
// responde 301 a las URLs del sitio WordPress y 404 a todo lo demás.
export const prerender = false;

const PAGINA_404 = '/404.html';

export const ALL: APIRoute = async (context) => {
  const path = context.url.pathname.replace(/\/+$/, '') || '/';
  const destino = destinoRedireccion(path);
  if (destino) return context.redirect(destino, 301);

  // Devuelve la página 404 pre-renderizada con el código correcto.
  if (path !== PAGINA_404) {
    try {
      const res = await fetch(new URL(PAGINA_404, context.url));
      if (res.ok) {
        return new Response(await res.text(), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    } catch {
      /* cae al 404 simple */
    }
  }
  return new Response('Página no encontrada', { status: 404 });
};
