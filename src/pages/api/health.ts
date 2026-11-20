import type { APIRoute } from 'astro';

// Endpoint de servidor: confirma que el back (Node) está vivo.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  });
