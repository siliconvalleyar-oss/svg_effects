# Controles

## Controles básicos

### Velocidad (Duración)
- Rango: 0.2s a 5s
- Controla la duración de un ciclo de animación

### Retraso
- Rango: 0s a 3s
- Tiempo de espera antes de iniciar la animación

### Repetición
- **Infinito**: Se repite indefinidamente
- **Una vez**: Corre una sola vez
- **3 veces**: Se repite 3 veces

### Dirección
- **Normal**: De principio a fin
- **Reversa**: De fin a principio
- **Alterno**: Alterna entre normal y reversa

## Sentido / Ángulo de movimiento

Control deslizante (0–360°) + botones de dirección rápida (→ ↗ ↑ ↖ ← ↙ ↓ ↘).
Afecta a: slide, bounce, shake, float, gravity.
Muestra flecha de trayectoria superpuesta en el preview.

## Controles específicos por animación

### Óvalo (solo visible con preset `oval`)
| Control | Rango | Default |
|---------|-------|---------|
| Ancho X | 10–150px | 80px |
| Alto Y | 10–150px | 40px |
| Ángulo | 0–360° | 0° |

### Desvanecer (solo visible con preset `fade`)
| Control | Rango | Default |
|---------|-------|---------|
| Min (opacidad mínima) | 0–100% | 15% |
| Max (opacidad máxima) | 0–100% | 100% |

## Panel de propiedades (siempre visible al seleccionar)

| Campo | Descripción |
|-------|-------------|
| Etiqueta | Tag del elemento (`circle`, `rect`, etc.) |
| ID | ID del elemento o clase |
| Visible | Estado de visibilidad con botón de ojo |
| Posición X | Coordenada X del bbox |
| Posición Y | Coordenada Y del bbox |
| Ancho | Ancho del bbox |
| Alto | Alto del bbox |
| Ángulo | Rotación visual (slider -180° a 180°) |
| Escala | Escala visual (slider 10%–300%) |

## Controles de reproducción

- **Play**: Reanudar todas las animaciones
- **Pause**: Pausar todas las animaciones
- **Stop**: Detener y resetear

## Órden Z

Botones en el panel de elementos: Traer al frente, Enviar al fondo, Subir, Bajar.

## Historial (Undo/Redo)

- Ctrl+Z: Deshacer (hasta 50 niveles)
- Ctrl+Shift+Z: Rehacer
- Botones Undo/Redo en la interfaz

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copiar config de animación |
| `Ctrl+V` | Pegar config de animación |
| `Ctrl+D` | Duplicar elemento |
| `Delete` / `Backspace` | Eliminar elemento |
| `ESC` | Deseleccionar en modo piezas |
| `Space` | Play/Pause (fuera de inputs) |
