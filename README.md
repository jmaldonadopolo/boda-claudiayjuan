# Claudia & Juan · Invitación de boda

Landing interactiva para celebrar la boda de Claudia y Juan, el 31 de octubre de 2026. Incluye una invitación con apertura de cortinas, cuenta regresiva, historia familiar, álbum fotográfico y libro de dedicatorias local.

## Desarrollo

- `npm run dev`: inicia Astro en `http://localhost:4321`.
- `npm run build`: genera el sitio estático en `dist/`.
- `npm run preview`: sirve localmente la compilación.

Las fotografías optimizadas y los recursos gráficos están en `public/`. Las dedicatorias se guardan en el dispositivo del visitante; para compartirlas entre personas se debe conectar un servicio de almacenamiento.

## Revisión responsive y scroll

Se revisó la portada con Playwright en navegador a estos tamaños de ventana:

| Vista | Tamaño | Resultado |
| --- | ---: | --- |
| Móvil estrecho | 320 × 800 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Móvil | 360 × 800, 375 × 812 y 390 × 844 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Tableta | 768 × 1024 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Escritorio | 1024 × 768 y 1440 × 900 | Sin desbordamiento horizontal; encabezado dentro del viewport |

En 390 × 844 también se recorrió el enlace de fecha hasta `#celebracion`: la cita de Proverbios queda visible, hay una sola cita y no aparece el lema «Te elijo…». La página conserva el orden vertical de portada, historia, recuerdos, celebración y dedicatorias.

Lenis suaviza la rueda en navegadores donde puede inicializarse; el desplazamiento táctil sigue siendo nativo. Si Lenis no está disponible, los enlaces mantienen el desplazamiento nativo del navegador. Con `prefers-reduced-motion: reduce`, la página omite Lenis y desactiva las animaciones de desplazamiento. Esta variante se comprobó en Chromium: Lenis queda desactivado y el enlace de fecha sigue llegando a `#celebracion`. La etiqueta `theme-color` usa el camel claro `#f6eee1` para coordinar la interfaz del navegador móvil con el fondo de la página. El scrollbar de escritorio usa un pulgar borgoña sobre una pista camel clara; se declaran estilos estándar para Firefox y pseudoelementos WebKit para Chromium/Safari. En móviles que ocultan automáticamente la barra, el navegador conserva ese comportamiento del sistema.

La revisión se hizo en Chromium/Playwright a los tamaños indicados; no representa una prueba física en cada versión de Safari, Firefox o navegadores móviles.
