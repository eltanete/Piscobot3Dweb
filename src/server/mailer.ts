import nodemailer from 'nodemailer';

export interface Adjunto {
  filename: string;
  content: Buffer;
}

export interface Mensaje {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: Adjunto[];
}

export type Enviar = (m: Mensaje) => Promise<{ simulado: boolean }>;

const env = (k: string) => process.env[k] ?? import.meta.env[k];

/**
 * Envía emails por SMTP (Hostinger u otro). Si SMTP_HOST no está configurado
 * (desarrollo local), no envía nada y registra el mensaje en consola.
 */
export const enviarEmail: Enviar = async (m) => {
  const host = env('SMTP_HOST');
  if (!host) {
    console.info('[mailer] SMTP no configurado; email simulado:', {
      to: m.to,
      subject: m.subject,
      adjuntos: m.attachments?.map((a) => a.filename),
    });
    return { simulado: true };
  }
  const transporte = nodemailer.createTransport({
    host,
    port: Number(env('SMTP_PORT') ?? 465),
    secure: String(env('SMTP_SECURE') ?? 'true') === 'true',
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
  });
  await transporte.sendMail({ from: env('MAIL_FROM') ?? env('SMTP_USER'), ...m });
  return { simulado: false };
};

export const destinoLeads = () => env('MAIL_TO_LEADS') ?? env('SMTP_USER') ?? '';

export const escapar = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
