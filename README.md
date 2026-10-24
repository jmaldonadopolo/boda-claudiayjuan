# Claudia & Juan · Una historia para recordar

Landing interactiva para recordar y compartir la historia de Claudia y Juan. Incluye apertura de cortinas, cuenta regresiva, álbum fotográfico y un muro público de dedicatorias.

## Desarrollo

- `npm run dev`: inicia Astro en `http://localhost:4321`.
- `npm run build`: genera la portada estática en `dist/`.
- `npm run preview`: sirve localmente la compilación.
- `npm run db:migrate:local`: crea la tabla de dedicatorias en D1 local.
- `npm run db:migrate:remote`: aplica las migraciones a D1 en Cloudflare.

Las fotografías originales están en `src/assets/gallery-originals/`; el retrato principal, la foto del altar y diez imágenes de recuerdos usan `Image` de `astro:assets` para generar versiones WebP responsivas. Los dos retratos de la boda civil conservan el encuadre vertical completo en el collage y están incluidos en el lightbox. El álbum completo carga sus miniaturas y fotografías WebP locales de `public/photos/gallery/`; no depende de Google Fotos. La imagen social sin texto usa la foto de la salida del auto y se sirve desde `public/og/claudia-juan-boda-civil.jpg` en formato 1200 × 630, con el retrato vertical completo centrado. El formulario de dedicatorias es una isla Preact que se hidrata al acercarse al bloque. Envía y consulta mensajes en `/api/dedications`; una Cloudflare Pages Function escribe registros con consultas preparadas en D1. En desarrollo, el muro presenta 15 dedicatorias de muestra locales para revisar el diseño; no se envían ni se guardan. En producción solo aparecen los mensajes de D1. Cada nota se puede abrir en un lightbox navegable. No usa `localStorage` ni consulta en intervalos: carga una vez al aparecer la isla.

El muro usa una textura de corcho a todo lo ancho, con altura que crece según el número de notas. Las notas mantienen proporción cuadrada también cuando hay pocas; en móvil se abren al tocar, y el gesto de deslizar queda reservado al desplazamiento de la página. Un sobre flotante lleva a la sección de dedicatorias y se oculta mientras esa sección está visible. La pica pica y su sonido se disparan una vez al terminar la apertura de las cortinas. La página incluye `noindex, nofollow, noarchive` en metadatos y en los encabezados HTTP para evitar su indexación.

Se usa Astro estático + Pages Functions porque el adaptador oficial `@astrojs/cloudflare` actual ya no admite Cloudflare Pages y recomienda Workers. Así solo el API ejecuta código en el borde y el resto continúa como archivos estáticos de Pages.

### Cloudflare Pages y D1

La base D1 remota `boda-claudia-juan-dedications` ya está creada, el binding `DB` ya está vinculado en `wrangler.jsonc` y la migración inicial ya está aplicada. Pages compila con `npm run build`, usa `dist` como salida y lee el binding desde el archivo Wrangler.

Para enlazar otra cuenta, crear la base con `npx wrangler d1 create boda-claudia-juan-dedications`, sustituir el UUID de `database_id` y aplicar el esquema con `npm run db:migrate:remote`.

Para desarrollo de la interfaz, ejecutar `npm run dev`. Para probar las Pages Functions y D1 localmente, ejecutar `npm run db:migrate:local`, `npm run build` y `npx wrangler pages dev dist`. El plan gratuito de Cloudflare incluye límites diarios de Workers/Functions y D1; el diseño evita consultas periódicas y limita la carga a las 24 notas más recientes.

## Revisión responsive y scroll

Se revisó la portada con Playwright en navegador a estos tamaños de ventana:

| Vista | Tamaño | Resultado |
| --- | ---: | --- |
| Móvil estrecho | 320 × 800 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Móvil | 360 × 800, 375 × 812 y 390 × 844 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Tableta | 768 × 1024 | Sin desbordamiento horizontal; encabezado dentro del viewport |
| Escritorio | 1024 × 768 y 1440 × 900 | Sin desbordamiento horizontal; encabezado dentro del viewport |

En 390 × 844 también se recorrió el enlace de fecha hasta `#celebracion`: la cita de Proverbios queda visible, hay una sola cita y no aparece el lema «Te elijo…». La página conserva el orden vertical de portada, historia, recuerdos, celebración y dedicatorias. El muro conserva dos columnas en móviles y pasa a una columna en pantallas muy estrechas; el fondo de corcho se extiende hasta los bordes sin desplazar las notas fuera del centro.

El muro actualizado se comprobó en Chromium con 320 × 800, 390 × 844, 768 × 1024 y 1440 × 900: en los cuatro tamaños aparecen las 15 notas de muestra, el corcho comienza alineado al borde izquierdo y no hay desbordamiento horizontal. Al reducir la lista a dos notas, ambas conservan su proporción cuadrada.

Lenis suaviza la rueda en navegadores donde puede inicializarse; el desplazamiento táctil sigue siendo nativo. Si Lenis no está disponible, los enlaces mantienen el desplazamiento nativo del navegador. Con `prefers-reduced-motion: reduce`, la página omite Lenis y desactiva las animaciones de desplazamiento. Esta variante se comprobó en Chromium: Lenis queda desactivado y el enlace de fecha sigue llegando a `#celebracion`. La etiqueta `theme-color` usa el camel claro `#f6eee1` para coordinar la interfaz del navegador móvil con el fondo de la página. El scrollbar de escritorio usa un pulgar borgoña sobre una pista camel clara; se declaran estilos estándar para Firefox y pseudoelementos WebKit para Chromium/Safari. En móviles que ocultan automáticamente la barra, el navegador conserva ese comportamiento del sistema.

La revisión se hizo en Chromium/Playwright a los tamaños indicados; no representa una prueba física en cada versión de Safari, Firefox o navegadores móviles.
