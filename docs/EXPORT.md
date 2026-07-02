# Exportar

El botón **"Descargar SVG Animado"** genera un archivo `.svg` autocontenido con animaciones CSS embebidas.

## Qué se exporta

- El SVG original con todos sus elementos
- Un elemento `<style>` con los `@keyframes` de los presets activos
- Reglas CSS individuales por elemento (`tag:nth-child(n)`)
- Variables CSS para configuración (`--oval-rx`, `--oval-ry`, `--fade-min`, `--fade-max`, etc.)
- Multi-preset: cada elemento puede tener varios keyframes combinados

## Lo que NO se exporta

- ~~Clase `element-selected`~~ (eliminada del clon)
- ~~Estilos inline del editor~~ (`outline`, `outline-offset`, `filter`)
- ~~Keyframes direccionales temporales~~ (`<style id="dir-keyframes">`)

## Las transformaciones visuales SÍ se exportan

- Rotación visual (`visualRotation`) → `transform: rotate(Ndeg)`
- Escala visual (`scale`) → parte del transform
- Posición visual (`visualX`/`visualY`) → `transform: translate(Xpx, Ypx)`

## Estructura del SVG exportado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 200 200">
  <style>
    circle:nth-child(1) {
      transform-origin: center center;
      transform-box: fill-box;
      --fade-min: 0.15;
      --fade-max: 1;
      animation: svgFade 2s ease-in-out infinite normal;
    }
    @keyframes svgFade {
      0%,100% { opacity: var(--fade-max, 1); }
      50% { opacity: var(--fade-min, 0.15); }
    }
  </style>
  <!-- elementos SVG originales -->
</svg>
```

## Compatible con

- Navegadores web modernos
- Editores SVG (Inkscape, Illustrator)
- Embebido en HTML con `<img>` o `<object>`
- CSS inline en páginas web
