# Business Header Templates

Aquí puedes personalizar el header que aparece en la parte superior de LibreChat.

## 📋 Estructura

- `index.html` - Plantilla HTML principal
- `styles.css` - Estilos CSS (responsive, dark/light mode)

## 🎨 Personalización

### Variables disponibles

Estas variables se inyectan automáticamente desde la configuración del servidor:

```html
{{BUSINESS_CHAT_TITLE}}          <!-- Título del header -->
{{BUSINESS_CHAT_LOGO}}           <!-- Logo (modo claro) -->
{{BUSINESS_CHAT_LOGO_DARK}}      <!-- Logo (modo oscuro) -->
```

### Colores dinámicos (CSS)

El archivo CSS utiliza variables CSS que se aplican dinámicamente según el tema:

```css
--header-bg                      /* Fondo del header -->
--title-color                    <!-- Color del título -->
--text-secondary                 <!-- Color de texto secundario -->
--border-color                   <!-- Color de bordes -->
--accent-color                   <!-- Color de acento (azul) -->
```

### Google Fonts

Ya incluye dos fuentes de Google:
- **Poppins** - Para títulos
- **Roboto** - Para cuerpo

Para cambiar las fuentes, edita el `<link>` en `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 🚀 Cómo usar

### Opción 1: Mantener la plantilla por defecto

No necesitas hacer nada, se usará automáticamente.

### Opción 2: Personalizar la plantilla

1. Edita `index.html` con tu HTML personalizado
2. Edita `styles.css` con tus estilos
3. Reinicia el container de Docker

### Opción 3: Reemplazar con tu propia plantilla vía Docker Compose

En tu `docker-compose.override.yml`:

```yaml
services:
  api:
    volumes:
      - ./mi-header:/app/client/public/business-header
```

Donde `./mi-header` contiene tu `index.html` y `styles.css`.

## 📝 Ejemplo personalizado con Google Fonts Premium

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    .business-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
    }
  </style>
</head>
<body>
  <div class="business-header">
    <h1 class="business-title">{{BUSINESS_CHAT_TITLE}}</h1>
  </div>
</body>
</html>
```

## 🌓 Tema claro/oscuro

El CSS utiliza `light-dark()` para soportar ambos temas automáticamente. Pero también puedes usar:

```css
@media (prefers-color-scheme: dark) {
  .business-header {
    background-color: #141414;
    color: #fff;
  }
}
```

## ⚙️ Variables de entorno

Configura en tu `.env`:

```env
# Colors
BUSINESS_CHAT_BACKGROUND_LIGHT=#f3f3f3
BUSINESS_CHAT_BACKGROUND_DARK=#141414
BUSINESS_CHAT_TITLE_COLOR_LIGHT=black
BUSINESS_CHAT_TITLE_COLOR_DARK=white

# Logo y título
BUSINESS_CHAT_TITLE=Intelewriter
BUSINESS_CHAT_LOGO=https://example.com/logo.png
BUSINESS_CHAT_LOGO_DARK=https://example.com/logo-dark.png
```

## 💡 Tips

- Usa `clamp()` en CSS para responsive fonts: `font-size: clamp(1rem, 5vw, 2rem)`
- El header está fijo en la parte superior (sticky)
- Los estilos se aplican con `light-dark()` para máxima compatibilidad
- Soporta animaciones CSS y transiciones suaves
- Mobile-first approach - se optimiza automáticamente en pantallas pequeñas

## 🔗 Recursos

- [Google Fonts](https://fonts.google.com/)
- [CSS light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/light-dark)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
