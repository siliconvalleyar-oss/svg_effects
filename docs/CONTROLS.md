# Controles

## Controles basicos

### Velocidad (Duracion)
- Rango: 0.2s a 5s
- Controla la duracion de un ciclo de animacion
- Valores menores = mas rapido

### Retraso
- Rango: 0s a 3s
- Tiempo de espera antes de iniciar la animacion

### Repeticion
- **Infinito**: La animacion se repite indefinidamente
- **Una vez**: La animacion corre una sola vez
- **3 veces**: La animacion se repite 3 veces

### Direccion
- **Normal**: De principio a fin
- **Reversa**: De fin a principio
- **Alterno**: Alterna entre normal y reversa

## Controles de eje de referencia

### Eje X (Horizontal)
- Rango: 0% a 100%
- Default: 50% (centro)
- 0% = borde izquierdo del SVG
- 100% = borde derecho del SVG

### Eje Y (Vertical)
- Rango: 0% a 100%
- Default: 50% (centro)
- 0% = borde superior del SVG
- 100% = borde inferior del SVG

## Controles de amplitud

### Intensidad
- Rango: 10% a 200%
- Amplifica o reduce la magnitud del efecto
- Afecta: distancia de rebote, shake, slide, etc.

## Controles especificos por animacion

### Ovalo
- **Ancho (X)**: 10-150px - radio horizontal
- **Alto (Y)**: 10-150px - radio vertical
- **Angulo**: 0-360grados - rotacion de la trayectoria

### Color (Brillar)
- **Matiz**: Color del brillo (0-360grados)
- **Saturacion**: Intensidad del color (0-100%)

## Controles de reproduccion

- **Play**: Iniciar/reanudar animacion
- **Pause**: Pausar animacion
- **Stop**: Detener y resetear animacion

## Atajos de teclado

| Tecla | Accion |
|-------|--------|
| `ESC` | Deseleccionar elemento en modo piezas |
| `Space` | Play/Pause (cuando hay animacion activa) |
