// Lógica de los formularios, independiente de Astro para poder testearla con dependencias simuladas.
import {
  ALIAS_TIPOS,
  ARCHIVOS,
  ATRIBUCION,
  CLARIDAD,
  MENSAJE_CONFIRMACION,
  PRESUPUESTOS,
  ROLES,
  TIPOS_CONSULTA,
  contactoSchema,
  cotizacionSchema,
  erroresPorCampo,
  tipoReal,
  validarArchivo,
} from './schemas';
import { destinoLeads, enviarEmail, escapar, type Adjunto, type Enviar } from './mailer';
import { esBot, limitador, verificarTurnstile, type VerificarTurnstile } from './seguridad';

export interface Deps {
  enviar: Enviar;
  verificar: VerificarTurnstile;
  permitir: (clave: string) => boolean;
  destino: () => string;
}

export const depsPorDefecto: Deps = {
  enviar: enviarEmail,
  verificar: verificarTurnstile,
  permitir: limitador,
  destino: destinoLeads,
};

export interface Resultado {
  status: number;
  body: { ok: boolean; mensaje: string; errores?: Record<string, string> };
}

const json = (status: number, body: Resultado['body']): Resultado => ({ status, body });

function camposTexto(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string') out[k] = v;
  return out;
}

async function controlesComunes(fd: FormData, ip: string, deps: Deps): Promise<Resultado | null> {
  // Bots: respondemos OK para no darles pistas, pero no enviamos nada.
  if (esBot(fd.get('website'))) return json(200, { ok: true, mensaje: 'Recibido' });
  if (!deps.permitir(ip)) {
    return json(429, {
      ok: false,
      mensaje:
        'Recibimos varios envíos seguidos. Probá de nuevo en unos minutos o escribinos por WhatsApp.',
    });
  }
  const token = String(fd.get('cf-turnstile-response') ?? '');
  if (!(await deps.verificar(token, ip))) {
    return json(400, {
      ok: false,
      mensaje: 'No pudimos verificar que no seas un robot. Recargá la página e intentá de nuevo.',
    });
  }
  return null;
}

function tabla(filas: [string, string | undefined][]): { text: string; html: string } {
  const validas = filas.filter(([, v]) => v && v.trim() !== '') as [string, string][];
  return {
    text: validas.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${validas
      .map(
        ([k, v]) =>
          `<tr><td style="color:#555a64;vertical-align:top"><b>${escapar(k)}</b></td><td style="white-space:pre-wrap">${escapar(v)}</td></tr>`,
      )
      .join('')}</table>`,
  };
}

export async function procesarCotizacion(
  fd: FormData,
  ip: string,
  deps = depsPorDefecto,
): Promise<Resultado> {
  const bloqueo = await controlesComunes(fd, ip, deps);
  if (bloqueo) return bloqueo;

  const campos = camposTexto(fd);
  if (campos.tipo && ALIAS_TIPOS[campos.tipo]) campos.tipo = ALIAS_TIPOS[campos.tipo];
  const parsed = cotizacionSchema.safeParse(campos);
  if (!parsed.success) {
    return json(422, {
      ok: false,
      mensaje: 'Revisá los campos marcados.',
      errores: erroresPorCampo(parsed.error),
    });
  }
  const d = parsed.data;

  // Adjuntos: lista blanca de extensiones + tipo real por contenido, máximo 50 MB en total.
  const archivos = fd.getAll('archivos').filter((f): f is File => f instanceof File && f.size > 0);
  const errorArchivos = (msg: string) =>
    json(422, { ok: false, mensaje: 'Revisá los archivos.', errores: { archivos: msg } });
  if (archivos.length > ARCHIVOS.maxCantidad)
    return errorArchivos(`Máximo ${ARCHIVOS.maxCantidad} archivos`);
  let total = 0;
  const adjuntos: Adjunto[] = [];
  for (const [i, f] of archivos.entries()) {
    const err = validarArchivo(f.name, f.size);
    if (err) return errorArchivos(err);
    total += f.size;
    if (total > ARCHIVOS.maxTotal)
      return errorArchivos('Los archivos superan 50 MB en total. Usá un link de descarga.');
    const bytes = new Uint8Array(await f.arrayBuffer());
    const ext = tipoReal(f.name, bytes);
    if (!ext) return errorArchivos(`"${f.name}" no parece ser un archivo válido de ese tipo.`);
    // Renombrado: nunca se usa el nombre que manda el cliente para guardar o adjuntar.
    adjuntos.push({ filename: `adjunto-${i + 1}.${ext}`, content: Buffer.from(bytes) });
  }

  const tipo = TIPOS_CONSULTA[d.tipo];
  const vertical = tipo.vertical;
  const linea = d.linea || tipo.linea;
  const esAgencia = d.rol === 'agencia';
  const detalle = tabla([
    ['Qué necesita', tipo.label],
    ['¿Sabe qué quiere?', CLARIDAD[d.claridad]],
    ['Vertical', vertical],
    ['Línea', linea],
    ['Destinatarios', d.destinatarios],
    ['Cantidad', d.cantidad],
    ['Fecha de entrega', d.fechaEntrega],
    [
      'Presupuesto de referencia',
      d.presupuesto ? PRESUPUESTOS[d.presupuesto as keyof typeof PRESUPUESTOS] : '',
    ],
    ['Kit armado', d.kit],
    ['Detalles', d.descripcion],
    ['Link de archivos', d.linkArchivos],
    ['Nombre', d.nombre],
    ['Empresa', d.empresa],
    ['Rol', ROLES[d.rol] + (esAgencia ? ' — PRECIO DE REVENTA' : '')],
    ['Email', d.email],
    ['WhatsApp', d.telefono],
    ['Página de origen', d.origen],
    ...ATRIBUCION.map((k) => [k, d[k]] as [string, string | undefined]),
    [
      'Adjuntos',
      adjuntos.map((a, i) => `${a.filename} (original: ${archivos[i].name})`).join(', '),
    ],
  ]);

  try {
    await deps.enviar({
      to: deps.destino(),
      replyTo: d.email,
      subject: `[Cotización${esAgencia ? ' · AGENCIA' : ''} · ${tipo.label}] ${d.nombre}${d.empresa ? ` — ${d.empresa}` : ''}`,
      text: detalle.text,
      html: `<h2 style="font-family:Arial,sans-serif">Nueva solicitud de cotización</h2>${detalle.html}`,
      attachments: adjuntos,
    });
    await deps.enviar({
      to: d.email,
      subject: 'Recibimos tu consulta — PISCOBOT 3D',
      text: `Hola ${d.nombre}. ${MENSAJE_CONFIRMACION}\n\n${detalle.text}\n\nPISCOBOT 3D`,
      html: `<p style="font-family:Arial,sans-serif">Hola ${escapar(d.nombre)}. ${escapar(MENSAJE_CONFIRMACION)}</p>${detalle.html}<p style="font-family:Arial,sans-serif">PISCOBOT 3D</p>`,
    });
  } catch (e) {
    console.error('[cotizacion] error al enviar email', e);
    return json(502, {
      ok: false,
      mensaje: 'No pudimos enviar tu consulta. Escribinos por WhatsApp y te respondemos enseguida.',
    });
  }
  return json(200, { ok: true, mensaje: MENSAJE_CONFIRMACION });
}

export async function procesarContacto(
  fd: FormData,
  ip: string,
  deps = depsPorDefecto,
): Promise<Resultado> {
  const bloqueo = await controlesComunes(fd, ip, deps);
  if (bloqueo) return bloqueo;

  const parsed = contactoSchema.safeParse(camposTexto(fd));
  if (!parsed.success) {
    return json(422, {
      ok: false,
      mensaje: 'Revisá los campos marcados.',
      errores: erroresPorCampo(parsed.error),
    });
  }
  const d = parsed.data;
  const detalle = tabla([
    ['Asunto', TIPOS_CONSULTA[d.asunto].label],
    ['Mensaje', d.mensaje],
    ['Nombre', d.nombre],
    ['Empresa', d.empresa],
    ['Email', d.email],
    ['Teléfono', d.telefono],
  ]);
  try {
    await deps.enviar({
      to: deps.destino(),
      replyTo: d.email,
      subject: `[Contacto · ${TIPOS_CONSULTA[d.asunto].label}] ${d.nombre}`,
      text: detalle.text,
      html: `<h2 style="font-family:Arial,sans-serif">Nuevo mensaje de contacto</h2>${detalle.html}`,
    });
  } catch (e) {
    console.error('[contacto] error al enviar email', e);
    return json(502, {
      ok: false,
      mensaje: 'No pudimos enviar tu mensaje. Escribinos por WhatsApp.',
    });
  }
  return json(200, {
    ok: true,
    mensaje: '¡Gracias! Recibimos tu mensaje y te respondemos a la brevedad.',
  });
}
