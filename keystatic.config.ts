// Panel de edición de contenido: /keystatic
// - Desarrollo: modo local (edita los archivos del repo directamente).
// - Producción: modo GitHub (cada cambio es un commit → Hostinger redeploya). Requiere la GitHub App
//   y las variables KEYSTATIC_* (ver docs/guia-editor.md).
import { collection, config, fields, singleton } from '@keystatic/core';

const enProduccion = import.meta.env.PROD && import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

const vertical = fields.select({
  label: 'Vertical',
  options: [
    { label: 'Empresas e Industrias', value: 'industria' },
    { label: 'Marcas y Agencias', value: 'marcas' },
  ],
  defaultValue: 'industria',
});

const seo = fields.object(
  {
    titulo: fields.text({ label: 'Título SEO (opcional)' }),
    descripcion: fields.text({ label: 'Meta descripción (opcional)', multiline: true }),
  },
  { label: 'SEO' },
);

export default config({
  storage: enProduccion
    ? { kind: 'github', repo: { owner: 'eltanete', name: 'Piscobot3Dweb' } }
    : { kind: 'local' },
  ui: {
    brand: { name: 'PISCOBOT 3D' },
    navigation: {
      Contenido: ['casos', 'recursos', 'merch'],
      Páginas: ['paginas', 'sitio'],
    },
  },
  singletons: {
    sitio: singleton({
      label: 'Datos de contacto',
      path: 'src/content/sitio',
      format: { data: 'json' },
      schema: {
        nombre: fields.text({ label: 'Nombre' }),
        eslogan: fields.text({ label: 'Eslogan' }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        telefono: fields.text({ label: 'Teléfono (visible)' }),
        whatsapp: fields.text({ label: 'WhatsApp (sólo números, con 549)' }),
        email: fields.text({ label: 'Email' }),
        direccion: fields.text({ label: 'Dirección' }),
        ciudad: fields.text({ label: 'Ciudad' }),
        region: fields.text({ label: 'Región' }),
        pais: fields.text({ label: 'País (código)' }),
        horario: fields.text({ label: 'Horario' }),
        notaVisitas: fields.text({ label: 'Nota sobre visitas' }),
        mapaUrl: fields.url({ label: 'Link a Google Maps' }),
        redes: fields.object(
          {
            instagram: fields.text({ label: 'Instagram (URL)' }),
            linkedin: fields.text({ label: 'LinkedIn (URL)' }),
            youtube: fields.text({ label: 'YouTube (URL)' }),
            facebook: fields.text({ label: 'Facebook (URL)' }),
          },
          { label: 'Redes sociales' },
        ),
      },
    }),
  },
  collections: {
    casos: collection({
      label: 'Casos de éxito',
      path: 'src/content/casos/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'vertical'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        vertical,
        servicio: fields.select({
          label: 'Servicio',
          options: [
            { label: 'Servicio técnico', value: 'servicio-tecnico' },
            { label: 'Capacitaciones', value: 'capacitaciones' },
            { label: 'Impresión y desarrollo', value: 'impresion-y-desarrollo' },
            { label: 'Merchandising', value: 'merchandising' },
            { label: 'Piezas de autor', value: 'piezas-de-autor' },
          ],
          defaultValue: 'impresion-y-desarrollo',
        }),
        cliente: fields.text({ label: 'Cliente (opcional)' }),
        material: fields.text({ label: 'Material' }),
        aplicacion: fields.text({ label: 'Aplicación' }),
        resumen: fields.text({ label: 'Resumen', multiline: true }),
        imagen: fields.image({
          label: 'Imagen',
          directory: 'src/assets/images/casos',
          publicPath: '../../assets/images/casos/',
        }),
        imagenAlt: fields.text({ label: 'Texto alternativo de la imagen' }),
        galeria: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'src/assets/images/casos',
            publicPath: '../../assets/images/casos/',
          }),
          { label: 'Galería (fotos adicionales)' },
        ),
        modelo3d: fields.text({ label: 'Modelo 3D (ruta .glb en /models, opcional)' }),
        destacado: fields.checkbox({ label: 'Destacar en la Home' }),
        orden: fields.integer({ label: 'Orden', defaultValue: 10 }),
        contenido: fields.markdoc({ label: 'Descripción del caso', extension: 'md' }),
      },
    }),
    recursos: collection({
      label: 'Guías técnicas',
      path: 'src/content/recursos/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'categoria'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        descripcion: fields.text({ label: 'Descripción (meta)', multiline: true }),
        categoria: fields.text({ label: 'Categoría' }),
        icono: fields.select({
          label: 'Ícono',
          options: [
            'book',
            'layers',
            'settings',
            'target',
            'alert',
            'cpu',
            'thermometer',
            'wrench',
          ].map((v) => ({ label: v, value: v })),
          defaultValue: 'book',
        }),
        imagen: fields.image({
          label: 'Imagen de la guía',
          directory: 'src/assets/images/recursos',
          publicPath: '../../assets/images/recursos/',
        }),
        fecha: fields.date({ label: 'Fecha de publicación', validation: { isRequired: true } }),
        actualizado: fields.date({ label: 'Última actualización' }),
        wpSlug: fields.text({ label: 'Slug en el WordPress viejo (no tocar)' }),
        contenido: fields.markdoc({ label: 'Contenido', extension: 'md' }),
      },
    }),
    merch: collection({
      label: 'Catálogo de merchandising',
      path: 'src/content/merch/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      columns: ['nombre', 'categoria'],
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre del objeto' } }),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Escritorio', value: 'escritorio' },
            { label: 'Tecnología', value: 'tecnologia' },
            { label: 'Hogar', value: 'hogar' },
            { label: 'Eventos', value: 'eventos' },
            { label: 'Premios', value: 'premios' },
          ],
          defaultValue: 'escritorio',
        }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        materiales: fields.array(fields.text({ label: 'Material' }), {
          label: 'Materiales',
          itemLabel: (p) => p.value,
        }),
        personalizacion: fields.array(fields.text({ label: 'Opción' }), {
          label: 'Opciones de personalización',
          itemLabel: (p) => p.value,
        }),
        minimo: fields.integer({ label: 'Cantidad mínima sugerida' }),
        imagen: fields.image({
          label: 'Foto',
          directory: 'src/assets/images/merch',
          publicPath: '../../assets/images/merch/',
        }),
        orden: fields.integer({ label: 'Orden', defaultValue: 10 }),
      },
    }),
    paginas: collection({
      label: 'Páginas de texto',
      path: 'src/content/paginas/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        eyebrow: fields.text({ label: 'Antetítulo' }),
        bajada: fields.text({ label: 'Bajada', multiline: true }),
        seo,
        contenido: fields.markdoc({ label: 'Contenido', extension: 'md' }),
      },
    }),
  },
});
