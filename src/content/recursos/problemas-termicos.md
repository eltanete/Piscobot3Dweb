---
titulo: Problemas térmicos en impresoras 3D
descripcion: Temperaturas inestables, thermal runaway, hotend o cama que no calientan. Causas y revisiones básicas del sistema térmico.
categoria: Térmica
icono: thermometer
fecha: 2026-11-20
provisorio: true
---

El sistema térmico (calentadores, termistores y su control) es crítico tanto para la calidad de impresión como para la seguridad del equipo.

## Síntomas habituales

- **Thermal runaway:** la impresora se detiene con un error de temperatura.
- La temperatura oscila varios grados durante la impresión.
- El hotend o la cama no llegan a la temperatura configurada.
- La lectura de temperatura salta a valores imposibles.

## Causas frecuentes

| Síntoma                                    | Causa probable                                                   |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Lectura que salta o marca valores absurdos | Termistor dañado o cable cortado                                 |
| No llega a temperatura                     | Cartucho calefactor débil, fuente insuficiente o MOSFET dañado   |
| Oscilaciones                               | PID sin calibrar o ventilador de capa apuntando al bloque        |
| Thermal runaway                            | Termistor mal fijado, cable intermitente o calefactor defectuoso |

## Revisiones básicas

1. **Calibración PID:** ejecutá el autotune del firmware para el hotend y la cama.
2. **Fijación del termistor:** debe estar firme dentro del bloque calefactor.
3. **Media o "calcetín" de silicona:** protege el bloque de corrientes de aire del ventilador.
4. **Cables:** revisá los que se mueven con el cabezal o la cama.

> **Nunca desactives la protección contra thermal runaway.** Es la que evita que una falla se convierta en un riesgo de incendio.

Si el error persiste después de estas revisiones, el equipo necesita un diagnóstico del sistema térmico completo.
