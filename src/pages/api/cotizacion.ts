import type { APIRoute } from 'astro';
import { procesarCotizacion } from '../../server/handlers';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return Response.json({ ok: false, mensaje: 'Formulario inválido.' }, { status: 400 });
  }
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'desconocida';
  const { status, body } = await procesarCotizacion(fd, ip);
  return Response.json(body, { status });
};
