# Guía de imágenes — qué falta, cómo nombrarlas y dónde van

> **Actualización (branch `feature/imagenes-backup`):** se revisaron las 134 imágenes del backup del WordPress y se implementaron las útiles. Ya están resueltos:
>
> - Hero de Home, `/industria`, `/marcas`, Servicio técnico, Merchandising y Proyectos especiales (`paginas/`, `servicios/`).
> - Fotos en las tarjetas de bifurcación de la Home.
> - 13 logos de clientes **con nombre** (`clientes/<empresa>.png`).
> - Tarjetas de los 4 módulos de capacitación y fotos de Prototipos / Productos / Producción en serie (formato vertical).
> - Foto de cada una de las 6 fallas, en Servicio técnico y en las guías (`recursos/`).
> - Galería de fotos adicionales en 6 casos (`casos/*-02.webp`…), con el campo `galeria`.
> - Nosotros: foto del equipo y galería del taller (`paginas/taller-0X.webp`).
> - Ilustraciones de línea junto a los títulos de algunos bloques (`ilustraciones/`, campo `ilustracion`).
> - Logo oficial (wordmark) en header y footer (`marca/logo-oscuro.png`, `marca/logo-blanco.png`).
>
> **Sigue faltando (no estaba en el backup):** fotos del catálogo de merch (`merch/`), logo en SVG, modelos 3D (`.glb`), foto propia de una capacitación dictada y nuevos casos de proyectos especiales. Las tablas de abajo mantienen el detalle; los ítems ya resueltos se pueden ignorar.

> Relevado el 21/11/2026 sobre el código actual. Estado: ✅ ya tiene imagen propia · 🔁 usa una foto prestada de otra sección · ⬜ falta.
> Columna **Código**: "listo" = alcanza con copiar el archivo y escribir la ruta · "ajuste" = hay que habilitar el espacio en el código (pedírselo a Claude).

---

## 1. Reglas generales

### Cómo nombrar los archivos

- Todo en minúsculas, **sin acentos, sin ñ y sin espacios**, con guiones: `mantenimiento-preventivo.jpg`.
- Patrón: **`<tema>-<detalle>.<ext>`**, y para varias fotos del mismo tema, un número de dos dígitos: `taller-01.jpg`, `taller-02.jpg`.
- Usá **exactamente** el nombre de la tabla: así no hay que tocar nada más.

### Formato y medidas de la foto original

| Tipo                                        | Proporción                | Tamaño mínimo   | Formato     |
| ------------------------------------------- | ------------------------- | --------------- | ----------- |
| Hero de página (foto grande del encabezado) | 4:3 horizontal            | 1600 × 1200 px  | JPG         |
| Tarjeta de servicio o ítem                  | 4:3 horizontal            | 1200 × 900 px   | JPG         |
| Foto de caso de éxito                       | 16:10 horizontal          | 1600 × 1000 px  | JPG         |
| Producto del catálogo de merch              | 1:1 cuadrada, fondo liso  | 1200 × 1200 px  | JPG o PNG   |
| Logo de cliente                             | libre, fondo transparente | 400 px de ancho | PNG (o SVG) |
| Logo propio                                 | vectorial                 | —               | SVG         |
| Imagen para redes (Open Graph)              | 1200 × 630 exacto         | 1200 × 630 px   | JPG         |
| Modelo 3D para el visor                     | —                         | < 5 MB          | GLB         |

- **No hace falta achicarlas a mano.** Subí la foto original (aunque pese varios MB): el script la convierte.
- Encuadre: dejá aire alrededor del objeto principal, porque el sitio recorta al centro según la pantalla.
- Fotos de producto y piezas: fondo neutro (blanco, gris o la mesa de trabajo), buena luz, sin marcas de agua.

### Flujo para agregar una imagen

1. Copiá la foto en la carpeta que indica la tabla, con el nombre indicado (por ejemplo, `src/assets/images/merch/llavero-tecnico.jpg`).
2. Ejecutá la optimización (la convierte a **WebP de 1600 px como máximo** y borra la original pesada):
   ```bash
   npm run images:optimize
   ```
   Queda `llavero-tecnico.webp`. Los logos (`marca/` y `clientes/`) se mantienen en PNG.
3. Escribí la ruta **con extensión `.webp`** en el archivo de contenido que indica la tabla, o cargala desde el panel `/keystatic` (casos y merch).
4. Revisá en local (`npm run dev`), hacé commit y publicá.

Astro genera automáticamente las versiones AVIF/WebP en varios tamaños para cada pantalla: no hace falta subir versiones mobile.

---

## 2. Estructura de carpetas

```
src/assets/images/
├─ marca/                       Identidad
│  ├─ isotipo.png               ✅ hexágono con cubo (header, favicon)
│  ├─ logo-blanco.png           ✅ logo para fondo oscuro
│  └─ logo.svg                  ⬜ logo completo vectorial
├─ clientes/                    Logos de clientes (Home)
│  └─ cliente-01.png … cliente-10.png   ✅ (falta el nombre de cada empresa)
├─ servicios/                   Heroes y tarjetas de las páginas de servicio
│  ├─ tecnico-*.webp            ✅ 4 fotos de servicio técnico
│  ├─ capacitacion-planta.webp  ✅
│  ├─ impresion-serie.webp      ✅
│  ├─ diseno / ingenieria-inversa / escaneo .webp   ✅
│  ├─ merchandising-hero.jpg    ⬜
│  ├─ proyectos-hero.jpg        ⬜
│  └─ capacitacion-modulo-1…4.jpg  ⬜ (opcional)
├─ casos/                       Casos de éxito
│  └─ 6 fotos .webp             ✅ (+ los nuevos de proyectos especiales ⬜)
├─ merch/                       Catálogo de merchandising   ⬜ carpeta nueva
│  └─ <slug-del-objeto>.jpg
└─ paginas/                     Fotos institucionales        ⬜ carpeta nueva
   ├─ home-hero.jpg
   ├─ industria-hero.jpg
   ├─ marcas-hero.jpg
   ├─ nosotros-equipo.jpg
   └─ taller-01.jpg … taller-04.jpg

public/
├─ models/                      Modelos 3D (.glb) para el visor de casos   ⬜
└─ og/
   └─ default.jpg               ✅ imagen para compartir en redes (generada)
```

---

## 3. Imágenes por página (sitemap)

### `/` — Home

| Espacio                                              | Archivo              | Carpeta     | Medidas      | Estado | Código |
| ---------------------------------------------------- | -------------------- | ----------- | ------------ | ------ | ------ |
| Foto del hero (hoy es sólo texto sobre fondo oscuro) | `home-hero.jpg`      | `paginas/`  | 1600×1200    | ⬜     | ajuste |
| Logos "Empresas que confían"                         | `cliente-01.png` …   | `clientes/` | 400 px ancho | ✅     | listo  |
| Casos destacados                                     | (salen de los casos) | `casos/`    | —            | ✅     | listo  |

> Logos: lo ideal es renombrarlos con el nombre de la empresa (`mercedes-benz.png`, `conuar.png`, `uba.png`, `globant.png`…) y actualizar `src/content/clientes.json` (campos `nombre` y `logo`). El nombre se usa como texto alternativo, que suma para SEO y accesibilidad.

### `/industria` y `/marcas` — Landings de vertical

| Espacio                                          | Archivo              | Carpeta    | Medidas   | Estado | Código |
| ------------------------------------------------ | -------------------- | ---------- | --------- | ------ | ------ |
| Hero de Industria (taller, granja de impresoras) | `industria-hero.jpg` | `paginas/` | 1600×1200 | ⬜     | ajuste |
| Hero de Marcas (merch, exhibidor, evento)        | `marcas-hero.jpg`    | `paginas/` | 1600×1200 | ⬜     | ajuste |

### `/industria/servicio-tecnico`

| Espacio                          | Archivo                     | Carpeta      | Estado | Dónde se referencia                                    |
| -------------------------------- | --------------------------- | ------------ | ------ | ------------------------------------------------------ |
| Hero                             | `tecnico-reparaciones.webp` | `servicios/` | ✅     | `src/content/servicios/servicio-tecnico.md` → `imagen` |
| Tarjeta Reparaciones             | `tecnico-reparaciones.webp` | `servicios/` | ✅     | ídem → `bloques > servicios > items`                   |
| Tarjeta Mantenimiento preventivo | `tecnico-preventivo.webp`   | `servicios/` | ✅     | ídem                                                   |
| Tarjeta Suscripción anual        | `tecnico-suscripcion.webp`  | `servicios/` | ✅     | ídem                                                   |
| Tarjeta Upgrades                 | `tecnico-upgrades.webp`     | `servicios/` | ✅     | ídem                                                   |

> Sugerencia: un hero distinto de la tarjeta "Reparaciones" (por ejemplo, el banco de trabajo con varias impresoras abiertas): `tecnico-hero.jpg`.

### `/industria/capacitaciones`

| Espacio                                     | Archivo                     | Carpeta      | Medidas   | Estado                         | Código |
| ------------------------------------------- | --------------------------- | ------------ | --------- | ------------------------------ | ------ |
| Hero                                        | `capacitacion-planta.webp`  | `servicios/` | —         | ✅ (foto de banco de imágenes) | listo  |
| Hero propio (una capacitación real dictada) | `capacitacion-hero.jpg`     | `servicios/` | 1600×1200 | ⬜ recomendado                 | listo  |
| Módulo 1 · Hardware                         | `capacitacion-modulo-1.jpg` | `servicios/` | 1200×900  | ⬜ opcional                    | listo  |
| Módulo 2 · Software (pantalla del slicer)   | `capacitacion-modulo-2.jpg` | `servicios/` | 1200×900  | ⬜ opcional                    | listo  |
| Módulo 3 · Reparación                       | `capacitacion-modulo-3.jpg` | `servicios/` | 1200×900  | ⬜ opcional                    | listo  |
| Módulo 4 · Materiales técnicos              | `capacitacion-modulo-4.jpg` | `servicios/` | 1200×900  | ⬜ opcional                    | listo  |

> Para los módulos: en `src/content/servicios/capacitaciones.md`, agregá `imagen: ../../assets/images/servicios/capacitacion-modulo-1.webp` debajo de cada módulo (en `bloques > modulos > items`).

### `/industria/impresion-y-desarrollo`

| Espacio                                                 | Archivo                                                                           | Carpeta      | Estado                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ | --------------------------- |
| Hero                                                    | `impresion-serie.webp`                                                            | `servicios/` | ✅                          |
| Diseño / Ingeniería inversa / Escaneo                   | `diseno.webp`, `ingenieria-inversa.webp`, `escaneo.webp`                          | `servicios/` | ✅                          |
| Prototipos / Productos / Producción en serie (opcional) | `impresion-prototipos.jpg`, `impresion-productos.jpg`, `impresion-produccion.jpg` | `servicios/` | ⬜ opcional (código: listo) |

### `/marcas/merchandising`

| Espacio                               | Archivo                      | Carpeta      | Medidas   | Estado                              | Código |
| ------------------------------------- | ---------------------------- | ------------ | --------- | ----------------------------------- | ------ |
| Hero (varios objetos de merch juntos) | `merchandising-hero.jpg`     | `servicios/` | 1600×1200 | 🔁 usa la foto del caso del llavero | listo  |
| Catálogo: Organizador de escritorio   | `organizador-escritorio.jpg` | `merch/`     | 1200×1200 | ⬜                                  | listo  |
| Catálogo: Soporte para celular        | `soporte-celular.jpg`        | `merch/`     | 1200×1200 | ⬜                                  | listo  |
| Catálogo: Llavero técnico             | `llavero-tecnico.jpg`        | `merch/`     | 1200×1200 | ⬜                                  | listo  |
| Catálogo: Maceta de escritorio        | `maceta-escritorio.jpg`      | `merch/`     | 1200×1200 | ⬜                                  | listo  |
| Catálogo: Trofeo modular              | `trofeo-modular.jpg`         | `merch/`     | 1200×1200 | ⬜                                  | listo  |
| Catálogo: Organizador de cables       | `organizador-cables.jpg`     | `merch/`     | 1200×1200 | ⬜                                  | listo  |

> El nombre de cada foto del catálogo es el nombre del archivo del objeto en `src/content/merch/` (sin `.yaml`). Ruta a escribir en cada `.yaml`: `imagen: ../../assets/images/merch/llavero-tecnico.webp`. También se puede subir desde `/keystatic` → Catálogo de merchandising. Si el catálogo final cambia (está pendiente definirlo), el nombre de la foto sigue el nuevo slug.

### `/marcas/proyectos-especiales`

| Espacio                             | Archivo               | Carpeta      | Medidas   | Estado                       | Código                                |
| ----------------------------------- | --------------------- | ------------ | --------- | ---------------------------- | ------------------------------------- |
| Hero (exhibidor, prop o activación) | `proyectos-hero.jpg`  | `servicios/` | 1600×1200 | 🔁 usa la foto del mostrador | listo                                 |
| Nuevos casos (3–4)                  | `<slug-del-caso>.jpg` | `casos/`     | 1600×1000 | ⬜                           | listo (crear el caso en `/keystatic`) |

### `/casos` y `/casos/<caso>`

| Caso                      | Archivo                          | Estado | Modelo 3D (opcional)                       |
| ------------------------- | -------------------------------- | ------ | ------------------------------------------ |
| Tapas para luminaria LED  | `casos/tapas-luminaria-led.webp` | ✅     | `public/models/tapas-luminaria-led.glb` ⬜ |
| Gabinetes ignífugos       | `casos/gabinetes-ignifugos.webp` | ✅     | `public/models/gabinetes-ignifugos.glb` ⬜ |
| Suplementos TPU           | `casos/suplementos-tpu.webp`     | ✅     | `public/models/suplementos-tpu.glb` ⬜     |
| Gabinete control calderas | `casos/gabinete-caldera.webp`    | ✅     | `public/models/gabinete-caldera.glb` ⬜    |
| Mostrador rodillera       | `casos/mostrador-rodillera.webp` | ✅     | `public/models/mostrador-rodillera.glb` ⬜ |
| Merchandising marcas      | `casos/merch-llavero.webp`       | ✅     | `public/models/merch-llavero.glb` ⬜       |

> **Modelos 3D:** exportá desde el CAD/slicer a **GLB** (Blender: _File → Export → glTF Binary_), idealmente < 5 MB. Copialo en `public/models/` y en el caso escribí `modelo3d: /models/tapas-luminaria-led.glb`. Si un caso tiene modelo 3D, el detalle muestra el visor rotable en lugar de la foto. Estos archivos **no pasan** por el optimizador.

### `/recursos` y guías

No usan fotos hoy (el diseño es tipográfico, con íconos). Opcional a futuro: una foto de la falla por guía, en `recursos/<slug-de-la-guia>.jpg` (por ejemplo `recursos/problemas-de-extrusion.jpg`). Código: ajuste.

### `/nosotros`

| Espacio                        | Archivo                           | Carpeta    | Medidas   | Estado | Código |
| ------------------------------ | --------------------------------- | ---------- | --------- | ------ | ------ |
| Foto del equipo / familia      | `nosotros-equipo.jpg`             | `paginas/` | 1600×1200 | ⬜     | ajuste |
| Galería del taller (3–4 fotos) | `taller-01.jpg` … `taller-04.jpg` | `paginas/` | 1200×900  | ⬜     | ajuste |

### Contacto, Cotizar, Condiciones, 404

Sin imágenes (formularios y texto). Opcional: foto de la fachada o del taller en Contacto → `paginas/taller-01.jpg` (reutilizada).

### Identidad y redes

| Elemento                                | Archivo       | Carpeta                    | Estado      | Notas                                               |
| --------------------------------------- | ------------- | -------------------------- | ----------- | --------------------------------------------------- |
| Logo vectorial completo                 | `logo.svg`    | `src/assets/images/marca/` | ⬜          | Reemplaza el wordmark en texto del header y footer. |
| Imagen para redes por defecto           | `default.jpg` | `public/og/`               | ✅          | Se regenera con `npm run brand:generate`.           |
| Imagen para redes de la vertical Marcas | `marcas.jpg`  | `public/og/`               | ⬜ opcional | 1200×630. Código: ajuste.                           |

---

## 4. Prioridades sugeridas

1. **Catálogo de merch: 6 fotos** (`merch/`). Es lo más visible que hoy está vacío ("Foto a producir").
2. **Heroes propios de Merchandising y Proyectos especiales**, para no repetir las fotos de los casos.
3. **Logos con nombre** de cada cliente.
4. **Fotos institucionales** (`paginas/`): taller, equipo y heroes de Home e Industria/Marcas. Cuando estén, pedile a Claude el ajuste de código para mostrarlas.
5. **Logo SVG.**
6. Opcionales: módulos de capacitación, modelos 3D de los casos, fotos de las guías.

## 5. Checklist antes de publicar fotos nuevas

- [ ] Nombre en minúsculas, sin acentos ni espacios, igual al de la tabla.
- [ ] Copiada en la carpeta correcta.
- [ ] Ejecutado `npm run images:optimize` (quedó `.webp`).
- [ ] Ruta con `.webp` escrita en el contenido (o subida desde `/keystatic`).
- [ ] Revisado en `npm run dev`, en desktop y en mobile.
- [ ] Commit, push y nuevo deploy.
