# Contenido pendiente

Todo lo que hoy está provisorio o falta producir. Al completarlo, borrar la línea.

## Datos a confirmar

- [ ] **Email de contacto**: hoy `piscobot@gmail.com` (del sitio actual). ¿Se usa un email del dominio? → `src/content/sitio.json`.
- [ ] **Email que recibe las cotizaciones** → variable `MAIL_TO_LEADS`.
- [ ] **Redes sociales** (Instagram, LinkedIn, etc.) → `sitio.json` → `redes`. El backup no las tenía.
- [ ] **Nombres de los clientes** de los 10 logos (`src/content/clientes.json`, hoy "Cliente 1…10") para usarlos como texto alternativo. El blog menciona Mercedes Benz, Conuar, UBA y Globant.
- [ ] Confirmar que los **contadores** siguen vigentes: +800 máquinas, +600 clientes, +20.000 horas, +30k piezas, +16.000 merch.
- [ ] Confirmar **precios de referencia** de capacitaciones y garantía extendida (USD 50/100/80) y **descuentos**.

## Contenido a producir

- [ ] **Catálogo de merchandising**: definir los 6–12 objetos base reales, con foto, mínimo y si tienen precio por volumen. Hoy hay 6 objetos propuestos sin foto (`src/content/merch/`).
- [ ] **Proyectos especiales**: 3–4 casos (hoy sólo el mostrador de rodillera).
- [ ] **Fotos propias** del taller y del equipo (Nosotros, Home).
- [ ] **Modelos 3D (.glb)** para el visor en los casos: copiar a `public/models/` y cargar la ruta en el caso (`modelo3d: /models/archivo.glb`).
- [ ] **Logo en SVG** (hoy se usa el isotipo PNG + wordmark en texto).
- [ ] **Testimonios de la vertical Marcas** (hoy los 3 testimonios son de Industria).
- [ ] Revisar y ajustar los **textos nuevos** escritos para Marcas y Agencias, landings de vertical y Home.

## Ideas para después del lanzamiento

- Imágenes OG por página (hoy todas usan `public/og/default.jpg`).
- Página `/styleguide` para documentar los componentes.
- Plan B PHP para formularios (sólo si el hosting no tiene Node).
