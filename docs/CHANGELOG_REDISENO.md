# Documentación de Cambios — Darío Martínez Computación

Resumen técnico y funcional del rediseño integral, optimización de rendimiento, espejo de catálogo en Supabase, módulo de estadísticas semanales y mejoras en `/revision`.

---

## 1. Identidad Visual, Rediseño React Bits y Rendimiento

- **Logos con transparencia real:** generados y aplicados en `public/LOGO_CLARO.png` (header público/admin) y `public/LOGO_OSCURO.png` (footer oscuro y `/admin-login`) a través de `src/components/brand-logo.tsx`.
- **Componentes interactivos (`src/components/react-bits.tsx` y `src/components/ui/button.tsx`):**
  - `SpotlightCard`, `Magnet`, `CountUp`, `AuroraBackdrop` y botones con efecto brillo/glare (`.rb-glare`), variantes `instagram` y `whatsapp` y respuesta táctil.
- **Header flotante y navegación (`src/components/header.tsx`):**
  - Se transforma en isla translúcida al hacer scroll con indicador de progreso integrado en el borde inferior (sin líneas flotantes sueltas).
  - En `/admin`, el botón derecho reemplaza el acceso duplicado por **Salir** (cierre de sesión real).
  - En `/revision` y en `/admin/estadisticas` (modo invitado sin login), oculta el header público/admin para mantener aislamiento estricto.
- **Footer y botón flotante de WhatsApp (`src/components/footer.tsx`, `src/components/whatsapp-float-button.tsx`):**
  - `IntersectionObserver` sobre `#footer-bottom-bar` para que el botón flotante nunca tape **Acceso interno** ni enlaces del pie de página.
  - Enlaces actualizados a la nueva página de Facebook (`61595361025236`) e Instagram (`@dariomartinez.computacion`).
- **Carga instantánea y Skeletons:**
  - `src/components/skeletons.tsx`, `src/components/route-progress.tsx` y archivos `loading.tsx` en todas las rutas públicas.
  - Reemplazo de spinners en `src/components/loading-image.tsx` por shimmer skeletons `.rb-skeleton`.
  - Paginación progresiva en cliente en `src/app/productos/catalog-product-grid.tsx` (*Cargar más productos* instantáneo).
- **Rediseño de `/admin-login` (`src/app/admin-login/page.tsx`):** pantalla completa Cobalt Aurora de 2 columnas con logo oscuro transparente y tarjeta de acceso de alto contraste.
- **Correcciones de contenido y UI pública:**
  - Eliminación del carrito administrativo en desuso (`admin-cart`).
  - Fotos reales subidas a Supabase Storage para los modelos que antes tenían imágenes generadas por IA.
  - Banner de `/controladores-fiscales` a ancho completo sin barras laterales y nuevo hero en `/sobre-nosotros`.
  - Formulario de contacto (`src/components/contact-form.tsx`) con apertura directa a WhatsApp + botón de respaldo.
  - SEO local, JSON-LD `hasOfferCatalog`, `robots.ts`, `sitemap.ts` y etiqueta de Google Ads (`AW-18473054013`) integrados y aislados de `/revision` mediante `SoloSitio`.

---

## 2. Espejo de Catálogo en Supabase (Bajo Demanda / Por Cambios)

- **Tabla espejo:** `docs/supabase-catalog-mirror.sql` (`catalogo_productos`) poblada con los artículos publicados en stock (excluyendo insumos internos con marca `Z` en kardex).
- **Sincronización orientada a cambios:**
  - Endpoint `POST /api/catalog/sync` (`src/app/api/catalog/sync/route.ts` y `src/lib/catalog-sync.ts`).
  - Replicador liviano por cambios en `scripts/mysql-change-replicator.js`.
- Permite servir el catálogo web con tiempos de respuesta rápidos sin depender directamente de la disponibilidad del servidor MySQL local.

---

## 3. Estadísticas, KPIs y Dashboards Semanales (`/admin/estadisticas`)

- **Filtros de período (`src/app/api/analytics/stats/route.ts` y `src/app/admin/estadisticas/page.tsx`):**
  - 5 rangos: **Hoy**, **Última semana**, **Último mes**, **Último trimestre** y **Último año** (con barra compacta en 1 fila para celular).
  - **Corte histórico fijo (`HISTORICAL_CUTOFF_DATE = '2026-11-25'`):** fechas hasta el 25/11/2026 incluyen base histórica consolidada; a partir del 26/11/2026 se muestran exclusivamente datos 100% reales registrados en Supabase (`web_analytics_events`).
- **4 KPIs simétricos:** Visitas, Visitantes Únicos, Clics en Productos (desplegable por producto) y Clics a WhatsApp (`2×2` en celular, `4` columnas en desktop).
- **Gráficas responsive:** Evolución de Visitas (con leyenda y scroll táctil en rangos de 30 días), Dispositivos, Orígenes de Tráfico y Páginas más visitadas.
- **Dashboards Semanales de Redes y Ads (`src/components/weekly-social-dashboards.tsx` + `src/app/api/analytics/weekly-dashboards/route.ts`):**
  - Selector semanal unificado para las 3 plataformas apiladas: **Instagram → Facebook → Google**.
  - Badge verde **`● Semana actual`** sincronizado al reloj del cliente y botón **`Volver a esta semana >`** al navegar semanas previas.
  - Grid asimétrico estilo Bento que se arma automáticamente al subir capturas (almacenadas en Supabase Storage bajo `images/weekly-dashboards/{week}/{platform}/`).
  - **Solo para admin autenticado (`401` si no está logueado):**
    - Subida por drag & drop o selector múltiple (`POST`).
    - Borrado rápido en 1 clic con cruz roja **`×`** (`DELETE`).
    - Reordenamiento por drag & drop entre tarjetas y botón **`Guardar`** (`PUT`, persiste `_order.json` en Supabase Storage).
  - Lightbox ampliado para cualquier captura.
- **Enlaces con referencias UTM:** ubicados al final de la vista y visibles únicamente para el administrador.

---

## 4. Revisión de Contenido (`/revision`) y Acceso Compartido sin Login

- **Acceso restringido por enlace directo (`src/middleware.ts`, `src/components/header.tsx`, `src/components/footer.tsx`):**
  - Un usuario sin iniciar sesión que recibe el enlace directo puede ver **únicamente** `/revision` y `/admin/estadisticas` (en modo solo lectura, sin drag & drop, sin controles de edición y sin menú de administración).
  - Botón bidireccional en la barra superior de ambas vistas (**`Ir a Revisión`** ↔ **`Ver Estadísticas`**).
  - Cualquier intento de acceder a `/admin`, `/admin/consultas`, `/admin/editar-*`, etc., redirige automáticamente a `/admin-login` (`307`).
- **Mejoras visuales y de interacción en `/revision` (`src/app/revision/`):**
  - Grilla **Masonry** sin huecos verticales entre historias (`9:16`), publicaciones (`4:5`) y portadas.
  - Selectores desplegables propios (`SelectorFiltro`) en móvil con contadores y check de selección.
  - Contadores visibles de **aprobadas** y **pendientes** en el encabezado.
  - **Edición directa sobre el texto de la imagen** tanto en PC como en celular (`lamina.tsx`, `carrete.tsx`, `comparar.tsx`).
  - **Movimiento libre de textos:** al tocar cualquier texto aparece la manija **`✥ Mover`** para arrastrarlo con dedo o mouse (se guarda con la revisión, funciona con Deshacer/Comparar e impresión).
  - Fondo de lienzo punteado tipo mesa de diseño en `Detalle`, flechas **`↑` / `↓`** de alto contraste, campo de **Nota** directo (sin campo de nombre), íconos SVG en todos los botones de acción y botón de impresión oculto en teléfono.
  - Fix de `animate-page-enter` en `tailwind.config.ts` (`transform: none` + `backwards`) para evitar interferencias con overlays `position: fixed`.
- **Aprobación protegida por PIN (`src/lib/revision-servidor.ts`, `src/app/api/revision/pieza/route.ts`):**
  - Solo el administrador logueado (`admin_auth=1`) o quien ingrese el **PIN `4977`** (validado en servidor con SHA-256 + `timingSafeEqual` y recordado en el dispositivo) puede **Aprobar** o **Desaprobar** piezas. El resto puede sugerir cambios, mover textos, dejar notas y guardar.

---

## 5. Variables de Entorno Requeridas en Producción (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `BACKEND_API_URL`
- `API_BASE_URL`
- `API_TOKEN`
