# Instalacion

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Python 3 (para el servidor local)

## Uso sin servidor

Abrir directamente `index.html` en el navegador. Limitaciones:
- No funciona el navegador de archivos del servidor
- Solo importar SVGs por drag & drop o selector de archivos

## Uso con servidor

```bash
cd /home/bee/src/svg_animated
./serve.sh 8080
```

Abrir `http://localhost:8080` en el navegador.

### Puerto personalizado

```bash
./serve.sh 3000
```

### Detener servidor

```bash
pkill -f "python3 -m http.server"
```

## Estructura de archivos

Coloca archivos SVG en el directorio `files/` para que aparezcan en el navegador de archivos del servidor.

```bash
cp mi-archivo.svg files/
```
