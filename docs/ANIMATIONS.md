# Animaciones

## Lista de animaciones

| ID | Nombre | Descripcion | Easing por defecto |
|----|--------|-------------|-------------------|
| `rotate` | Rotar | Rotacion continua 360 | linear |
| `wheel` | Rueda | Rotacion continua con pasos de 90 | linear |
| `spiral` | Espiral | Movimiento espiral con rotacion y escala | ease-in-out |
| `pulse` | Pulsar | Escala arriba/abajo | ease-in-out |
| `bounce` | Rebotar | Rebote vertical | ease-in-out |
| `gravity` | Gravedad | Caida con rebote realista | ease-out |
| `slide` | Deslizar | Movimiento horizontal | ease-in-out |
| `oval` | Ovalo | Trayectoria eliptica configurable | linear |
| `elastic` | Elastico | Efecto de resorte | ease-out |
| `wave` | Wave | Movimiento ondulatorio vertical | ease-in-out |
| `fade` | Desvanecer | Oscurecimiento opacidad | ease-in-out |
| `draw` | Dibujar | Dibujado de trazos (stroke) | ease-in-out |
| `shake` | Temblar | Vibracion horizontal | ease-in-out |
| `float` | Flotar | Flotacion suave vertical | ease-in-out |
| `spin` | Girar | Giro con escala | ease-in-out |
| `glow` | Brillar | Brillo con drop-shadow | ease-in-out |

## Ejes de referencia (transform-origin)

Cada animacion respeta el eje de transformacion configurado:

- **X**: 0% (izquierda) a 100% (derecha), default: 50%
- **Y**: 0% (arriba) a 100% (abajo), default: 50%

Ejemplo: Para rotar desde la esquina superior izquierda, usar X=0%, Y=0%.

## Efectos con controles especiales

### Ovalo
- **Ancho (X)**: Radio horizontal de la elipse (10-150px)
- **Alto (Y)**: Radio vertical de la elipse (10-150px)
- **Angulo**: Rotacion de la trayectoria eliptica (0-360grados)

### Gravedad
- Simula caida libre con rebote amortiguado
- Usa easing cubic-bezier para realismo

### Dibujar
- Animacion de stroke-dashoffset
- Funciona mejor con SVGs que tengan trazos (stroke)

### Espiral
- Combina rotacion con escala
- Crea efecto de espiral entrante/saliente

### Elastico
- Efecto de resorte con sobreoscilacion
- Escala de 0.3 a 1.1 con rebotes

## Easing functions disponibles

| Valor CSS | Descripcion |
|-----------|-------------|
| `linear` | Velocidad constante |
| `ease` | Lento inicio y fin (default CSS) |
| `ease-in` | Lento inicio |
| `ease-out` | Lento fin |
| `ease-in-out` | Lento inicio y fin |
| `cubic-bezier(x1,y1,x2,y2)` | Curva personalizada |
