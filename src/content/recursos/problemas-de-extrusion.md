---
titulo: Problemas de extrusión en impresoras 3D
descripcion: Sub-extrusión, atascos, filamento que patina y capas faltantes. Cómo reconocer cada síntoma, sus causas más comunes y qué revisar primero.
categoria: Extrusión
icono: layers
fecha: 2026-11-20
wpSlug: problemas-de-extrusion
provisorio: true
---

La extrusión es el corazón de una impresora FDM: si el filamento no sale en la cantidad y el momento correctos, ninguna otra calibración alcanza. Estos son los síntomas que más vemos en el taller y por dónde empezar a revisar.

## Síntomas habituales

| Síntoma              | Qué se ve                                               | Causa probable                                                          |
| -------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Sub-extrusión        | Paredes finas, huecos entre líneas, relleno "esponjoso" | Boquilla parcialmente tapada, temperatura baja, pasos/mm mal calibrados |
| Sobre-extrusión      | Bordes gruesos, gotas, superficie rugosa                | Flujo o pasos/mm demasiado altos, diámetro de filamento mal configurado |
| Atasco total         | El motor hace clic y no sale material                   | Boquilla tapada, heat creep, PTFE degradado                             |
| Filamento que patina | Marcas en el filamento, ruido en el extrusor            | Tensión del engranaje incorrecta, retracciones excesivas                |

## Qué revisar primero

1. **Temperatura.** Confirmá que el hotend llega a la temperatura indicada para el material y que se mantiene estable durante la impresión.
2. **Boquilla.** Una boquilla desgastada o parcialmente tapada es la causa más común de sub-extrusión. Hacé una extrusión manual en el aire: el hilo debe salir recto y constante.
3. **Camino del filamento.** Revisá que el carrete gire libre y que el tubo PTFE no esté quemado ni separado de la boquilla.
4. **Engranaje del extrusor.** Limpiá los restos de filamento y ajustá la tensión: ni tan floja que patine, ni tan fuerte que aplaste el filamento.
5. **Calibración de pasos/mm (e-steps).** Medí cuánto filamento entra realmente al pedir 100 mm y corregí el valor.

## Heat creep: el atasco que vuelve

Si la impresora se atasca siempre después de un rato imprimiendo, el problema suele ser que el calor sube por el disipador y ablanda el filamento antes de tiempo. Revisá el ventilador del disipador, la pasta térmica y las retracciones (muy largas favorecen el atasco).

## Cuándo conviene un diagnóstico

Si después de estos pasos el problema persiste, o aparece y desaparece sin patrón claro, conviene un diagnóstico completo: muchas veces hay más de una causa combinada (por ejemplo, un termistor que mide mal y una boquilla gastada).
