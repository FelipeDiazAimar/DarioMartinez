# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Comercios y empresas de San Francisco (Córdoba) y la región** (más de 23 localidades): buscan sistemas de punto de venta (POSBerry), controladores fiscales homologados por AFIP/ARCA (Hasar, Samsung, Epson), soporte técnico fiscal y equipamiento informático confiable.
- **Particulares y hogares**: buscan reparación y mantenimiento de PC y notebooks, actualización de hardware (SSD/RAM), configuración de redes/WiFi, asistencia remota (AnyDesk/TeamViewer) y compra de equipamiento tecnológico.
- **Equipo administrativo de Darío Martínez Computación**: gestiona contenidos editables del sitio (CMS en Supabase), consultas entrantes, catálogo de artículos/precios/kardex (MySQL API), estadísticas reales del sitio y enlaces de campaña con referencias de origen.

## Product Purpose

Sitio web institucional, catálogo en vivo y panel administrativo de **Darío Martínez Computación** (Libertador Norte 163, San Francisco, Córdoba — casi 50 años de trayectoria). Su objetivo principal es facilitar el contacto rápido por WhatsApp y la exploración clara del catálogo de productos, servicio técnico, POSBerry y controladores fiscales, mientras brinda al equipo interno métricas reales de tráfico y enlaces rastreables para sus canales digitales.

## Positioning

Empresa tecnológica con casi 50 años de presencia local y regional en San Francisco y el este cordobés/oeste santafesino: combina taller técnico especializado, distribuidor y soporte de controladores fiscales homologados (Hasar, Samsung, Epson), implementación local de POSBerry con facturación ARCA y catálogo conectado en tiempo real al stock del comercio.

## Operating Context

- Atención presencial en Libertador Norte 163, San Francisco, Córdoba (Lunes a Jueves 7:30–12:30 y 15:30–19:30; Viernes 8:00–12:00 y 15:30–19:30; Sábados cerrado) y cobertura técnica regional en más de 23 localidades.
- Contacto rápido por WhatsApp (`5493564504977`), teléfono (`03564 15-504977`), email y redes sociales (Instagram, Facebook, Google Maps).
- Asistencia técnica remota mediante descarga directa de AnyDesk y TeamViewer.
- Analíticas de tráfico web combinando Vercel Analytics / Speed Insights con registro propio en Supabase para panel interno (`/admin/estadisticas`) y atribución de enlaces de referencia (WhatsApp, Facebook, Instagram, Google).

## Capabilities and Constraints

- **Stack existente**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI / shadcn, Recharts, Supabase (CMS + consultas + analíticas + categorías), MySQL/Express API externa para catálogo de artículos/stock/precios/kardex/ventas.
- **Preservación de CMS**: Todas las secciones editables desde `/admin` (`home_content`, `servicios`, `productos`, `posberry_content`, `controladores_fiscales_content`, `sobre_nosotros`, `contacto_info`, `preguntas_frecuentes`, `consultas`, `imagenes`, `categorias`) deben mantener su lectura y escritura intactas.
- **Textos aprobados**: Los textos institucionales y de servicios están aprobados por la empresa y deben preservarse (corrigiendo únicamente inconsistencias técnicas evidentes como etiquetas de columnas BD en `/productos/[id]` o texto de "editor de demostración" en admin).
- **Imágenes**: Las fotografías propias de la empresa (`LOGO1.png`, `LOGO3.png`, `FOTOFRENTE.jpeg`, logos de marcas/integraciones, carruseles e imágenes subidas en Supabase) se preservan; las imágenes de productos del catálogo provienen de la BD/API y las genéricas placeholder de productos pueden mejorarse o reemplazarse por SVGs técnicos propios.
- **Acceso Admin**: Debe moverse fuera del header público (acceso discreto en el footer y ruta `/admin-login`), manteniendo autenticación existente.

## Brand Commitments

- **Nombre**: Darío Martínez Computación.
- **Colores institucionales vinculantes**: Azul institucional profundo (`#00308F` / `hsl(220 100% 28%)`), azul técnico de acento (`#2D4CB0` / `hsl(228 59% 43%)`), fondo blanco limpio (`#FFFFFF`), neutros azulados suaves y tinta azul marino oscuro (`#172136`).
- **Activos confirmados**: `public/LOGO1.png` (logo actual), `public/LOGO3.png` (logo histórico para evolución), `public/FOTOFRENTE.jpeg` (frente real del local), `public/LOGOBOSBERRY3.png`, `public/POSBERRY.png`, `public/POSBERRY2.png`, logos oficiales `hasarlogo.png`, `samsunglogo.png`, `epsonlogo.png`, y logos de integraciones (`mercadopago`, `fiserv`, `clover`, `payway`, `pvs`, `bind`).

## Evidence on Hand

- Fotografía real del frente del local (`public/FOTOFRENTE.jpeg`).
- Logos oficiales de la marca y de socios/marcas comerciales en `public/`.
- Contenido institucional en Supabase (`home_content`, `servicios`, `posberry_content`, `controladores_fiscales_content`, `sobre_nosotros`, `contacto_info`, `preguntas_frecuentes`).
- Consultas reales enviadas por visitantes en la tabla `consultas` de Supabase.
- Stock y artículos reales desde API MySQL (`API_BASE_URL`).
- **Ausencias que no deben fabricarse**: no inventar testimonios falsos, cifras de clientes no confirmadas (solo citar "> 9.000 comercios" en POSBerry y "casi 50 años" de trayectoria ya aprobados en el sitio) ni métricas falsas en `/admin/estadisticas`.

## Product Principles

1. **Claridad inmediata para dos audiencias**: tanto un comerciante que necesita resolver AFIP/POSBerry como un vecino que busca arreglar su notebook deben encontrar su solución y contactar por WhatsApp en menos de 10 segundos.
2. **Verdad técnica y datos reales**: cero métricas ficticias, cero etiquetas internas de base de datos visibles y estado horario real según hora de Argentina.
3. **Respeto total al CMS y la identidad**: la evolución estética eleva la marca usando sus colores, textos aprobados y contenidos dinámicos de Supabase sin romper ninguna pantalla de edición.
4. **Mobile-first sin recortes**: filtros de categorías, cobertura regional, catálogo y panel de estadísticas completamente utilizables desde el celular.
