# Claudia & Juan · Invitación de boda

Landing interactiva para recordar la historia de Claudia y Juan. Incluye apertura de cortinas, cuenta regresiva, álbum fotográfico y un muro público de dedicatorias.

## Desarrollo

- `npm run dev`: inicia Astro en `http://localhost:4321`.
- `npm run build`: genera la portada estática en `dist/`.
- `npm run preview`: sirve localmente la compilación.
- `npm run db:migrate:local`: crea la tabla de dedicatorias en D1 local.
- `npm run db:migrate:remote`: aplica las migraciones a D1 en Cloudflare.

Las fotografías optimizadas y los recursos gráficos están en `public/`. El formulario de dedicatorias es una isla Preact que se hidrata al acercarse al bloque. Envía y consulta mensajes en `/api/dedications`; una Cloudflare Pages Function escribe registros con consultas preparadas en D1. El muro muestra una nota de ejemplo además de los mensajes compartidos. No usa `localStorage` ni consulta en intervalos: carga una vez al aparecer la isla.

Se usa Astro estático + Pages Functions porque el adaptador oficial `@astrojs/cloudflare` actual ya no admite Cloudflare Pages y recomienda Workers. Así solo el API ejecuta código en el borde y el resto continúa como archivos estáticos de Pages.

### Conectar D1 con Cloudflare Pages

1. Crear la base de datos: `npx wrangler d1 create boda-claudia-juan-dedications`.
2. Copiar el UUID devuelto en `database_id` de `wrangler.jsonc` y mantener el binding con nombre `DB`.
3. Aplicar el esquema remoto: `npm run db:migrate:remote`.
4. En Pages, usar `npm run build` como comando de compilación y `dist` como directorio de salida; el archivo `wrangler.jsonc` define la vinculación D1.

Para desarrollo de la interfaz, ejecutar `npm run dev`. Para probar las Pages Functions y D1 localmente, ejecutar `npm run db:migrate:local`, `npm run build` y `npx wrangler pages dev dist`. El plan gratuito de Cloudflare incluye límites diarios de Workers/Functions y D1; el diseño evita consultas periódicas y limita la carga a las 24 notas más recientes.

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
