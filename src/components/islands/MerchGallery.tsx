import { useMemo, useState } from 'react';

export interface MerchItem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  materiales: string[];
  personalizacion: string[];
  minimo?: number;
  imagen?: string | null;
}

const CATEGORIAS: Record<string, string> = {
  todos: 'Todos',
  escritorio: 'Escritorio',
  tecnologia: 'Tecnología',
  hogar: 'Hogar',
  eventos: 'Eventos',
  premios: 'Premios',
};

interface Props {
  items: MerchItem[];
}

export default function MerchGallery({ items }: Props) {
  const [filtro, setFiltro] = useState('todos');

  const categorias = useMemo(
    () => ['todos', ...Array.from(new Set(items.map((i) => i.categoria)))],
    [items],
  );
  const visibles = filtro === 'todos' ? items : items.filter((i) => i.categoria === filtro);

  return (
    <div>
      <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFiltro(c)}
            aria-pressed={filtro === c}
            className={
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors ' +
              (filtro === c
                ? 'border-grafito-950 bg-grafito-950 text-white'
                : 'border-grafito-300 bg-white text-grafito-700 hover:border-grafito-900')
            }
          >
            {CATEGORIAS[c] ?? c}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visibles.length} objetos
      </p>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibles.map((item) => (
          <li
            key={item.id}
            className="flex flex-col overflow-hidden rounded-lg border border-grafito-200 bg-white shadow-tarjeta"
          >
            <div className="relative flex aspect-square items-center justify-center bg-naranja-50 fondo-grilla-clara">
              {item.imagen ? (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-mono text-xs text-grafito-500">Foto a producir</span>
              )}
              <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 font-mono text-[0.6875rem] font-semibold tracking-wide text-naranja-700 uppercase">
                {CATEGORIAS[item.categoria] ?? item.categoria}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg">{item.nombre}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-grafito-600">
                {item.descripcion}
              </p>
              <dl className="mt-5 space-y-2 border-t border-grafito-200 pt-4 text-sm">
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 font-mono text-xs tracking-wide text-grafito-500 uppercase">
                    Materiales
                  </dt>
                  <dd>{item.materiales.join(' · ')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 font-mono text-xs tracking-wide text-grafito-500 uppercase">
                    Personalizá
                  </dt>
                  <dd>{item.personalizacion.join(' · ')}</dd>
                </div>
                {item.minimo ? (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-mono text-xs tracking-wide text-grafito-500 uppercase">
                      Mínimo
                    </dt>
                    <dd>{item.minimo} unidades</dd>
                  </div>
                ) : null}
              </dl>
              <a
                href={`/cotizar?tipo=merchandising&objeto=${encodeURIComponent(item.nombre)}`}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-grafito-300 text-sm font-semibold hover:border-grafito-900 hover:bg-grafito-50"
                data-evento="merch_cotizar"
              >
                Cotizar este objeto
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
