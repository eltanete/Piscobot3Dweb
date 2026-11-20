---
titulo: Fallas electrónicas en impresoras 3D
descripcion: Placas que no encienden, motores que no responden, sensores y finales de carrera. Qué se puede revisar con seguridad y cuándo parar.
categoria: Electrónica
icono: cpu
fecha: 2026-11-20
provisorio: true
---

Las fallas electrónicas son las que más conviene diagnosticar con cuidado: un error puede dañar componentes caros o generar riesgos eléctricos.

> **Seguridad primero:** desconectá la impresora de la red antes de abrir la electrónica. La fuente trabaja con tensión de red.

## Síntomas habituales

- La impresora no enciende o se reinicia sola.
- Un motor no se mueve, vibra sin girar o pierde pasos.
- El homing falla o la máquina ignora los finales de carrera.
- La pantalla queda en blanco o muestra caracteres extraños.

## Qué se puede revisar

1. **Conexiones:** cables flojos, conectores quemados o pines doblados, sobre todo en los cables que se mueven con los ejes.
2. **Fusibles** de la placa y de la fuente.
3. **Finales de carrera y sensores:** verificá su estado desde el menú o con el comando M119.
4. **Ventiladores de la electrónica:** un driver sin refrigeración pierde pasos o se apaga.
5. **Firmware:** una actualización mal hecha puede dejar la placa sin responder.

## Cuándo parar

- Olor a quemado, componentes ennegrecidos o hinchados.
- La fuente hace ruido o no entrega tensión estable.
- Hace falta medir o soldar sobre la placa.

En estos casos, lo más seguro y económico es un diagnóstico profesional.
