# PISCOBOT 3D — Plan de acción nuevo sitio web

Nov 20, 2026 · @diego

## Resumen

Recomendamos reemplazar WordPress + Divi por un sitio en **Astro + Tailwind CSS**, con contenido editable desde un CMS liviano y un pequeño backend Node para formularios y cotizaciones, todo alojado en el mismo Hostinger.

El enfoque estratégico que entendimos: PISCOBOT 3D no vende "piezas impresas", vende **autoridad técnica** sobre la tecnología 3D. Esa base (hardware, diagnóstico, procesos, capacitación y diseño viable) alimenta dos verticales que no deben mezclarse:

- **Industria y Técnica**: servicio técnico, capacitaciones, impresión y desarrollo de productos.
- **Marcas y Agencias**: merchandising curado y personalizable, y proyectos especiales y activaciones.

La web tiene que hacer tres cosas: probar esa autoridad en los primeros segundos, bifurcar al visitante hacia su vertical sin fricción, y convertir (cotización, WhatsApp, reunión). El sitio actual es la fuente de contenido, no el modelo a copiar.

## Diagnóstico del sitio actual

El sitio productivo tiene buen material técnico (FAQs detalladas, casos reales, métricas, testimonios), pero está organizado por servicio y no por tipo de cliente, por eso la vertical Marcas no existe todavía.

**Inventario relevado (20/11/2026):** WordPress + Divi 4.27.4, 10 páginas, 6 artículos de blog y 134 archivos en la biblioteca de medios (155 imágenes en total con las referenciadas).

| Página actual | Qué aporta | Estado |
| --- | --- | --- |
| Inicio | Propuesta, 4 servicios, 3 dolores, contadores, logos, testimonios, quiénes somos | Reutilizable, reescribir |
| Servicio Técnico | Beneficios, 4 servicios, 6 fallas usuales, versión makers, FAQ completa (ingreso, egreso, garantía) | Muy completo |
| Capacitación Técnica 3D | 4 módulos con duración, beneficios, workshops, FAQ con precios de referencia | Muy completo |
| Impresión 3D | 6 casos de éxito con material y aplicación, FAQ de proceso, pagos y materiales | Muy completo |
| Diseño 3D | Proceso en 3 etapas, diseño, ingeniería inversa, escaneo, FAQ | Completo |
| Nosotros | Empresa familiar, +10 años, trayectoria y visión | Corto |
| Contacto | Tel, WhatsApp, email, dirección, horario, formulario, Google Form | Funcional |
| Blog (6 guías de fallas) | SEO técnico: extrusión, mecánica, adhesión, recurrentes, electrónica, térmica | Migrar como Recursos |
| Merchandising, Garantías | — | Vacías (sólo plantilla) |

**Problemas a resolver en la nueva web:**

- Textos duplicados entre páginas (testimonios y bloques "Servicios" repetidos) y descripciones cruzadas: en Servicio Técnico, "Mantenimiento Preventivo" tiene el texto de Fabricación.
- Merchandising aparece sólo como un caso dentro de Impresión 3D.
- Todos los CTA terminan en WhatsApp Web, que no funciona bien en mobile; no hay formulario para adjuntar archivos STL/STEP.
- Sin imagen para compartir en redes en casi todas las páginas e imágenes PNG pesadas (111 MB en total).
- Tres tipografías mezcladas (Inter, Arimo, Open Sans).

**Backup:** se generó `piscobot3d-backup-2026-11-20.zip` (111,7 MB) con textos por página en Markdown, los 6 artículos completos, la exportación de la API de WordPress y todas las imágenes originales ordenadas por fecha. Paleta actual relevada: grafito #1A1C21, azul #0033FF, naranja #FF6600.

## Stack tecnológico recomendado

La elección es **Astro** para el front y un backend mínimo en el propio Astro (modo servidor Node), porque el sitio es 90% contenido: Astro entrega HTML estático, casi sin JavaScript, y eso se traduce en carga instantánea y mejor SEO que cualquier tema de WordPress.

Hostinger soporta apps Node.js administradas en los planes Business y Cloud, con deploy automático desde GitHub y Astro entre los frameworks detectados ([Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [docs](https://docs.hostinger.com/node.js/overview)). **Hay que confirmar qué plan tienen hoy**: si es Premium o inferior, el sitio igual funciona como estático y los formularios se resuelven con un script PHP de envío.

| Capa | Recomendación | Por qué | Alternativa |
| --- | --- | --- | --- |
| Framework front | Astro + TypeScript | HTML estático, islas de interactividad sólo donde hacen falta, rutas por archivo | Next.js (más pesado para un sitio de contenido) |
| Estilos | Tailwind CSS con tokens propios | Mobile first nativo, sistema de diseño consistente, CSS final mínimo | CSS Modules |
| Componentes interactivos | Preact o React como islas | Galería de merch con filtros, formulario de cotización, menú mobile | Alpine.js |
| Visor 3D | `<model-viewer>` (GLB) | Mostrar piezas en 3D rotables: refuerza la autoridad técnica sin plugins | Three.js |
| Animación | CSS + Motion (micro-interacciones) | Fluido, respeta "reducir movimiento" | GSAP |
| Imágenes | `astro:assets` (AVIF/WebP, tamaños responsive) | Bajar de 111 MB de PNG a pocos MB servidos | Cloudinary |
| Contenido / CMS | Keystatic (contenido en el repositorio, panel web de edición) | Sin base de datos ni mantenimiento; editan textos, casos, merch y guías desde un panel | Payload CMS (si más adelante quieren usuarios, pedidos o área de clientes) |
| Backend | Endpoints de Astro en Node | Formulario de contacto y cotización con adjuntos STL/STEP, validación y anti-spam | Script PHP (si el plan no tiene Node) |
| Email transaccional | SMTP de Hostinger o Resend | Avisos de cotización al equipo y confirmación al cliente | — |
| Anti-spam | Cloudflare Turnstile | Sin captchas molestos | honeypot simple |
| Analítica | GA4 + Search Console (o Plausible) | Medir conversiones por vertical | Microsoft Clarity para mapas de calor |
| Código y deploy | GitHub + deploy automático de Hostinger | Cada cambio aprobado se publica solo; vista previa por cambio | Subida por .zip |

Esto deja afuera plugins, actualizaciones de seguridad de WordPress y el peso de Divi. El costo de hosting no cambia si el plan actual ya es Business o Cloud.

## Sitemap propuesto

El menú principal se organiza por tipo de cliente (Industria / Marcas) y no por servicio, así cada visitante entra a un recorrido propio desde el primer clic.

&#91;embedded content: sitemap · 2 verticales, 5 servicios, 5 páginas comunes\]

Casos y Recursos se filtran por vertical. Las versiones para makers y particulares viven como sección dentro de Servicio técnico y Capacitaciones, sin ocupar el menú principal. Condiciones reúne garantías, ingreso y egreso de equipos y formas de pago, hoy dispersas en las FAQ.

## Wireframe conceptual de la Home

La Home alterna bloques de autoridad compartida con un bloque de bifurcación temprano, para que el visitante elija su camino antes de hacer scroll largo y después encuentre su vertical reforzada más abajo.

&#91;embedded content: wireframe conceptual de la Home · 13 bloques\]

El bloque 3 es la pieza clave: dos tarjetas del mismo peso visual, cada una con su color y su CTA. Los bloques 6 y 7 repiten la bifurcación con más detalle para quien sigue bajando, y el 12 cierra preguntando qué necesita el visitante en vez de mostrar un formulario genérico.

## Lineamientos UX/UI

Se diseña primero en 375 px y se escala a tablet (768) y desktop (1280–1440), con un único sistema de componentes para que todo se vea homogéneo.

**Sistema de diseño (se define en la fase 2):**

- Una sola familia tipográfica de interfaz (por ejemplo Inter o Geist) + una monoespaciada para datos técnicos (materiales, tolerancias, tiempos), que refuerza el tono de ingeniería.
- Paleta base grafito + blanco; el azul #0033FF como color de marca y acción. Propuesta a validar: naranja #FF6600 como acento exclusivo de la vertical Marcas, para que cada visitante sepa en qué mundo está.
- Escala de espaciado de 8 px, grilla de 4 columnas en mobile y 12 en desktop, radios y sombras definidos una sola vez.
- Biblioteca de componentes: header, menú mobile, hero, tarjeta de servicio, tarjeta de caso, contador, logo wall, testimonio, acordeón FAQ, ficha de producto merch, formulario por pasos, CTA final, footer.

**Reglas de experiencia y persuasión:**

- Cada página responde en el primer pantallazo qué hacemos, para quién y cuál es el próximo paso.
- Un CTA principal por página (Cotizar / Agendar diagnóstico / Pedir catálogo) y WhatsApp como secundario siempre visible; en mobile, barra fija inferior con ambos.
- Prueba antes que promesa: métricas, casos con material y aplicación, logos y testimonios cerca de cada CTA.
- Contenido técnico escaneable: fichas, tablas cortas, acordeones para FAQ largas.
- Formulario de cotización por pasos (¿qué necesitás? → datos del proyecto → adjuntar archivo → contacto) que pre-clasifica el lead por vertical.
- WhatsApp con link `wa.me` (abre la app en mobile) y mensaje pre-cargado según la página.

**Metas de calidad:** Lighthouse ≥ 95 en mobile, LCP < 2,0 s, accesibilidad AA (contraste, foco visible, textos alternativos), HTML semántico y datos estructurados (Organization, LocalBusiness, Service, FAQPage, Article).

## Plan de acción

Estimamos 8 a 10 semanas desde la aprobación de esta estructura hasta el lanzamiento, con WordPress funcionando sin cambios hasta el día del cambio de dominio.

1. **Estrategia y arquitectura (semana 1).** Validar sitemap y wireframe de Home, definir CTA por página, confirmar plan de Hostinger y accesos (dominio, DNS, GitHub).
2. **Contenido (semanas 2–4, en paralelo).** Reescribir página por página con el tono definido, partiendo del backup. Producir lo que falta: catálogo de objetos base de merch, 3–4 proyectos especiales, fotos del taller y de piezas, y modelos GLB para el visor 3D.
3. **Diseño UI (semanas 2–4).** Moodboard, sistema de diseño (tokens y componentes), Home y una página interna por vertical en mobile y desktop; aprobación antes de programar.
4. **Desarrollo (semanas 4–7).** Repositorio, Astro + Tailwind, componentes, colecciones de contenido (servicios, casos, merch, guías, testimonios, FAQ), panel Keystatic, formulario de cotización con adjuntos, optimización de imágenes, SEO técnico y analítica.
5. **QA (semana 8).** Pruebas en iPhone, Android, tablet y desktop; Lighthouse, accesibilidad, formularios de punta a punta, revisión de textos.
6. **Migración y lanzamiento (semana 8–9).** Publicar en un subdominio de prueba, cargar redirecciones 301, apuntar el dominio, dar de alta el sitemap en Search Console. WordPress queda como respaldo 30 días y después se da de baja.
7. **Post-lanzamiento (semanas 9–12).** Medir conversiones por vertical, ajustar CTAs, publicar nuevas guías y casos desde el panel.

**Redirecciones 301 para no perder posicionamiento:**

| URL actual | URL nueva |
| --- | --- |
| /servicio-tecnico-impresora-3d/ | /industria/servicio-tecnico |
| /capacitacion-tecnica-en-impresion-3d/ | /industria/capacitaciones |
| /impresion-3d/ | /industria/impresion-y-desarrollo |
| /diseno-3d-y-desarrollos/ | /industria/impresion-y-desarrollo#diseno |
| /merchandising/ | /marcas/merchandising |
| /blog/ y las 6 guías (/problemas-de-extrusion/, etc.) | /recursos y /recursos/\[guía\] |
| /garantias/ | /condiciones |
| /nosotros/, /contacto/ | /nosotros, /contacto |

Los slugs y meta descripciones que hoy posicionan ("servicio técnico impresora 3D", "capacitación técnica impresión 3D", "impresión 3D en grandes cantidades") se conservan en los nuevos títulos.

## Decisiones pendientes

Para avanzar a la redacción página por página necesitamos cerrar estos puntos:

- [ ] ¿Qué plan de Hostinger tienen contratado (Premium, Business o Cloud)?
- [ ] ¿El naranja queda como acento de la vertical Marcas o se redefine la paleta?
- [ ] ¿La venta de insumos sigue siendo una línea de negocio a mostrar? (hoy aparece en "Nosotros" pero no en el brief)
- [ ] ¿Se publican precios de referencia de capacitaciones como en el sitio actual?
- [ ] Listado inicial de objetos base para el merchandising curado (6–12) y si tendrán precio por volumen o sólo cotización.
- [ ] Quién editará el contenido desde el panel y con qué frecuencia.
- [ ] Disponibilidad de fotos propias del taller y de trabajos, y de logos de clientes con permiso de uso.

Próximo paso: aprobada esta estructura, arrancamos con los textos finales de la Home.
