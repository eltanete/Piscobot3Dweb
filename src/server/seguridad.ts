// Anti-spam: Cloudflare Turnstile + honeypot + límite de envíos por IP.

const env = (k: string) => process.env[k] ?? import.meta.env[k];

export type VerificarTurnstile = (token: string, ip?: string) => Promise<boolean>;

/** Si TURNSTILE_SECRET_KEY no está configurada (desarrollo), la verificación se omite. */
export const verificarTurnstile: VerificarTurnstile = async (token, ip) => {
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
};

/** El campo "website" está oculto: si viene completo, es un bot. */
export const esBot = (honeypot: unknown) => typeof honeypot === 'string' && honeypot.trim() !== '';

export function crearLimitador(max = 5, ventanaMs = 10 * 60 * 1000) {
  const registros = new Map<string, number[]>();
  return (clave: string, ahora = Date.now()): boolean => {
    const previos = (registros.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
    if (previos.length >= max) {
      registros.set(clave, previos);
      return false;
    }
    previos.push(ahora);
    registros.set(clave, previos);
    if (registros.size > 5000) registros.clear();
    return true;
  };
}

export const limitador = crearLimitador();
