import { useRef, useState, type FormEvent } from 'react';
import {
  TIPOS_CONSULTA,
  contactoSchema,
  erroresPorCampo,
  type TipoConsulta,
} from '../../server/schemas';
import { Campo, Honeypot, emitirEvento } from './campos';
import Turnstile from './Turnstile';

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'ok' | 'error'>('editando');
  const [mensaje, setMensaje] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    const r = contactoSchema.safeParse(Object.fromEntries(fd));
    if (!r.success) return setErrores(erroresPorCampo(r.error));
    setErrores({});
    setEstado('enviando');
    try {
      const res = await fetch(`/api/contacto${import.meta.env.PUBLIC_API_EXT ?? ''}`, {
        method: 'POST',
        body: fd,
      });
      const body = (await res.json()) as {
        ok: boolean;
        mensaje: string;
        errores?: Record<string, string>;
      };
      setMensaje(body.mensaje);
      if (body.ok) {
        setEstado('ok');
        emitirEvento('contacto_enviado', { asunto: String(fd.get('asunto')) });
      } else {
        setEstado('error');
        setErrores(body.errores ?? {});
      }
    } catch {
      setEstado('error');
      setMensaje('No pudimos conectar con el servidor. Escribinos por WhatsApp.');
    }
  };

  if (estado === 'ok') {
    return (
      <div
        className="rounded-xl border border-exito/30 bg-white p-8 text-center shadow-tarjeta"
        role="status"
      >
        <h2 className="text-2xl">¡Mensaje enviado!</h2>
        <p className="mt-3 text-grafito-600">{mensaje}</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={enviar}
      noValidate
      className="relative grid gap-5 rounded-xl border border-grafito-200 bg-white p-6 shadow-tarjeta sm:grid-cols-2 md:p-8"
    >
      <h2 className="text-2xl sm:col-span-2">Escribinos</h2>
      <Campo id="c-nombre" label="Nombre" error={errores.nombre}>
        {(p) => <input {...p} name="nombre" autoComplete="name" />}
      </Campo>
      <Campo id="c-email" label="Email" error={errores.email}>
        {(p) => <input {...p} name="email" type="email" autoComplete="email" />}
      </Campo>
      <Campo id="c-telefono" label="WhatsApp / teléfono" opcional error={errores.telefono}>
        {(p) => <input {...p} name="telefono" type="tel" autoComplete="tel" />}
      </Campo>
      <Campo id="c-asunto" label="Asunto" error={errores.asunto}>
        {(p) => (
          <select {...p} name="asunto" defaultValue="otro">
            {(Object.keys(TIPOS_CONSULTA) as TipoConsulta[]).map((t) => (
              <option key={t} value={t}>
                {TIPOS_CONSULTA[t].label}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <div className="sm:col-span-2">
        <Campo id="c-mensaje" label="Mensaje" error={errores.mensaje}>
          {(p) => <textarea {...p} name="mensaje" rows={5} />}
        </Campo>
      </div>
      <div className="sm:col-span-2">
        <Turnstile />
      </div>
      <Honeypot />
      {estado === 'error' && mensaje && (
        <p className="rounded-md bg-error/10 p-3 text-sm text-error sm:col-span-2" role="alert">
          {mensaje}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="inline-flex h-11 items-center rounded-md bg-azul-600 px-6 font-semibold text-white hover:bg-azul-700 disabled:opacity-60"
        >
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  );
}
