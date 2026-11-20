// Campos de formulario accesibles, compartidos por QuoteForm y ContactForm.
import type { ReactNode } from 'react';

const base =
  'mt-1.5 block w-full rounded-md border bg-white px-3.5 py-2.5 text-[0.9375rem] text-grafito-950 placeholder:text-grafito-400 focus:border-azul-600 focus:outline-2 focus:outline-azul-100';

interface CampoProps {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
  opcional?: boolean;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
    className: string;
  }) => ReactNode;
}

export function Campo({ id, label, error, ayuda, opcional, children }: CampoProps) {
  const desc =
    [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-grafito-900">
        {label}
        {opcional && <span className="font-normal text-grafito-500"> (opcional)</span>}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': desc,
        className: `${base} ${error ? 'border-error' : 'border-grafito-300'}`,
      })}
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-xs text-grafito-500">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Campo trampa para bots: oculto para personas y lectores de pantalla. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        No completar
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function emitirEvento(nombre: string, params: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('piscobot:evento', { detail: { nombre, params } }));
}
