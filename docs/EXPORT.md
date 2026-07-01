# Exportar

## SVG Animado

El boton "Descargar SVG Animado" genera un archivo `.svg` autocontenido con la animacion CSS embebida.

## Que se exporta

- El SVG original con todos sus elementos
- Un elemento `<style>` con los keyframes CSS de la animacion seleccionada
- Variables CSS para configuracion (duracion, easing, etc.)

## Estructura del SVG exportado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 200 200">
  <style>
    svg {
      transform-origin: center center;
      transform-box: fill-box;
      animation: svgRotate 2s linear infinite normal;
    }
    @keyframes svgRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
  <!-- elementos SVG originales -->
</svg>
```

## Compatible con

- Navegadores web modernos
- Editores SVG (Inkscape, Illustrator)
- Embebido en HTML con `<img>` o `<object>`
- CSS inline en paginas web

## No exporta

- Posiciones del modo piezas (solo efecto en preview)
- Configuracion de eje de referencia (se usa default)
- Efectos que requieren JavaScript
