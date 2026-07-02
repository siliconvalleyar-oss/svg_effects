# Modo Piezas

El modo piezas permite seleccionar y arrastrar elementos individuales dentro de un SVG.

## Activar

1. Cargar un SVG (importar, generar, o seleccionar del servidor)
2. Hacer clic en **"Mover piezas por separado"**
3. Las animaciones se pausan automáticamente

## Funcionamiento

### Seleccionar elemento
- Hacer clic en cualquier elemento del SVG (borde punteado violeta)
- También se puede seleccionar desde las miniaturas del panel derecho

### Mover elemento
- Arrastrar el elemento seleccionado con el mouse
- El desplazamiento se suma a la posición visual existente (`visualX`/`visualY`)
- Compatible con rotación y escala: el elemento mantiene su transformación visual

### Deseleccionar
- Presionar `ESC`
- Hacer clic en otro elemento (selecciona el nuevo)

## Comportamiento

- Las animaciones CSS se pausan al entrar al modo piezas
- Las animaciones se reanudan al salir del modo
- Los movimientos persisten al salir del modo (ya no se pierden)
- Las posiciones se guardan en el historial undo/redo
- Las transformaciones visuales (rotación, escala) no se pierden al salir del modo

## Exportación

Las posiciones, rotaciones y escalas visuales **SÍ se exportan** en el SVG animado.
