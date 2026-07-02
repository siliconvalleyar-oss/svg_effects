# Animaciones

## Lista de animaciones

| ID | Nombre | Descripción | Easing default | Controles especiales |
|----|--------|-------------|----------------|---------------------|
| `rotate` | Rotar | Rotación continua 360° | linear | — |
| `wheel` | Rueda | Rotación con pasos de 90° | linear | — |
| `pulse` | Pulsar | Escala 1 → 1.15 | ease-in-out | — |
| `bounce` | Rebotar | TranslateY -20px | ease-in-out | Ángulo de dirección |
| `gravity` | Gravedad | Caída con rebote amortiguado | ease-out | Ángulo de dirección |
| `slide` | Deslizar | TranslateX ±80px | ease-in-out | Ángulo de dirección |
| `oval` | Óvalo | Trayectoria elíptica configurable | linear | Ancho X, Alto Y, Ángulo |
| `fade` | Desvanecer | Opacidad configurable | ease-in-out | **Min/Max** (0–100%) |
| `draw` | Dibujar | stroke-dashoffset | ease-in-out | — |
| `shake` | Temblar | Vibración horizontal ±8px | ease-in-out | Ángulo de dirección |
| `float` | Flotar | TranslateY -15px | ease-in-out | Ángulo de dirección |
| `spin` | Girar | Rotación + escala 0.85 | ease-in-out | — |
| `glow` | Brillar | drop-shadow | ease-in-out | — |

## Múltiples presets simultáneos

Cada elemento puede tener varios presets activos a la vez (`presetIds` array). Se combinan como animaciones CSS separadas por coma. Si dos presets modifican la misma propiedad CSS, el último en la lista tiene prioridad.

## Efectos con controles especiales

### Óvalo
- **Ancho (X)**: Radio horizontal de la elipse (10–150px)
- **Alto (Y)**: Radio vertical de la elipse (10–150px)
- **Ángulo**: Rotación de la trayectoria elíptica (0–360°)

### Desvanecer (nuevo)
- **Min**: Opacidad mínima (0–100%, default 15%)
- **Max**: Opacidad máxima (0–100%, default 100%)
- Los valores se persisten por elemento en `fadeMin`/`fadeMax`

### Dibujar
- Animación de stroke-dashoffset
- Funciona mejor con SVGs que tengan trazos (stroke)

## Sentido / Ángulo de movimiento

Las animaciones basadas en translación (slide, bounce, shake, float, gravity) soportan un control de ángulo (0–360°) para definir la dirección del movimiento. Se muestra una flecha de trayectoria superpuesta en el preview.

## Easing functions disponibles

| Valor CSS | Descripción |
|-----------|-------------|
| `linear` | Velocidad constante |
| `ease` | Lento inicio y fin |
| `ease-in` | Lento inicio |
| `ease-out` | Lento fin |
| `ease-in-out` | Lento inicio y fin |
