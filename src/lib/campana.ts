import campana from '../content/campana.json';

export { campana };

/** La campaña sigue vigente en el momento del build (en el navegador se vuelve a chequear). */
export const campanaVigente = (ahora = new Date()) => ahora < new Date(campana.fechaCierre);

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "19/12" */
export const diaMes = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

/** "19 de diciembre" */
export const fechaLarga = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
};
