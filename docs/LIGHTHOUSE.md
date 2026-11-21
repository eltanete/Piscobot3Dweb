# Informe de Lighthouse

> Medido el 21/11/2026 con Lighthouse 13.6 (Edge headless) sobre el **build estático de producción** servido con compresión gzip y URLs limpias (equivalente a Hostinger con el `.htaccess`). Mobile = Moto G Power simulado con 4G lento; Desktop = preset escritorio.

| Página                           | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP  | CLS   | TBT   |
| -------------------------------- | ----------- | ----------- | ------------- | ---------------- | --- | ---- | ----- | ----- |
| /                                | Mobile      | 100         | 100           | 100              | 100 | 1.0s | 0.001 | 90ms  |
| /                                | Desktop     | 100         | 100           | 100              | 100 | 0.5s | 0     | 0ms   |
| /marcas                          | Mobile      | 98          | 100           | 100              | 100 | 2.1s | 0     | 70ms  |
| /marcas                          | Desktop     | 100         | 100           | 100              | 100 | 0.5s | 0     | 0ms   |
| /marcas/merchandising            | Mobile      | 98          | 100           | 100              | 100 | 2.3s | 0     | 70ms  |
| /marcas/merchandising            | Desktop     | 100         | 100           | 100              | 100 | 0.5s | 0.003 | 0ms   |
| /fin-de-ano                      | Mobile      | 100         | 100           | 100              | 100 | 0.9s | 0     | 80ms  |
| /fin-de-ano                      | Desktop     | 100         | 100           | 100              | 100 | 0.3s | 0     | 0ms   |
| /casos                           | Mobile      | 98          | 100           | 100              | 100 | 0.8s | 0     | 170ms |
| /casos                           | Desktop     | 100         | 100           | 100              | 100 | 0.3s | 0.001 | 0ms   |
| /casos/carbone-autoelevadores    | Mobile      | 100         | 100           | 100              | 100 | 0.8s | 0     | 30ms  |
| /casos/carbone-autoelevadores    | Desktop     | 100         | 100           | 100              | 100 | 0.3s | 0     | 0ms   |
| /recursos/problemas-de-extrusion | Mobile      | 99          | 100           | 100              | 100 | 2.0s | 0     | 110ms |
| /recursos/problemas-de-extrusion | Desktop     | 100         | 100           | 100              | 100 | 0.5s | 0.003 | 0ms   |

## Lectura

- **Las cuatro categorías dan 98-100 en mobile y 100 en desktop** en las 7 páginas.
- **CLS** es 0 o prácticamente 0 en todas (meta < 0,1). **TBT** ≤ 170 ms (proxy de INP < 200 ms).
- **LCP mobile:** 0,8-1,0 s en Home, Fin de año, Casos y caso insignia. En /marcas (2,1 s), Merchandising (2,3 s) y el artículo (2,0 s) la foto del hero ronda la meta de 2 s: cuando lleguen las fotos definitivas (16:9, fondo liso) conviene revisarlo; si hace falta, en mobile se puede servir una versión 4:5 más liviana.

## Qué se optimizó para llegar acá

- CSS incrustado en el HTML (sin hoja que bloquee el render) y precarga de las fuentes Inter y JetBrains Mono (elimina el salto de layout por cambio de fuente).
- `content-visibility: auto` en las secciones (el navegador no procesa lo que está fuera de pantalla).
- Degradados radiales en lugar de filtros `blur` gigantes; animaciones infinitas acotadas.
- Heros con `<Picture>` AVIF/WebP, `fetchpriority="high"` y peso reducido; foto vertical de merch recortada a 4:3.
- Contraste AA en todos los textos (token `grafito-500` y verde de WhatsApp oscurecidos).

Los informes HTML completos quedan en la carpeta temporal de la sesión; para regenerarlos ver `docs/ESTADO.md`.
