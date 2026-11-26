---
name: Darío Martínez Computación
description: Arquitectura técnica minimalista y precisión institucional para soluciones informáticas, POSBerry y controladores fiscales.
colors:
  institutional-cobalt: "#00308F"
  technical-indigo: "#2D4CB0"
  deep-navy-ink: "#0E1A33"
  daylight-paper: "#FFFFFF"
  blueprint-surface: "#F4F7FC"
  hairline-border: "#D8E3F4"
  muted-slate: "#4D5D7C"
  signal-emerald: "#1FAF5A"
  alert-crimson: "#DC2626"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  data-mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "80px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.institutional-cobalt}"
    textColor: "{colors.daylight-paper}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-outline:
    backgroundColor: "{colors.daylight-paper}"
    textColor: "{colors.deep-navy-ink}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  card-surface:
    backgroundColor: "{colors.daylight-paper}"
    textColor: "{colors.deep-navy-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.daylight-paper}"
    textColor: "{colors.deep-navy-ink}"
    rounded: "{rounded.md}"
    height: "44px"
---

# Design System: Darío Martínez Computación

## Overview

**Creative North Star: "Mesa de Diagnóstico & Arquitectura de Sistemas"**

El lenguaje visual de Darío Martínez Computación une casi 50 años de respaldo técnico local en San Francisco (Córdoba) con la claridad de un manual de ingeniería contemporáneo. La interfaz trabaja sobre un fondo blanco de luz diurna (`#FFFFFF`) y superficies técnicas frías (`#F4F7FC`) delimitadas por líneas estructurales finas de 1px (`#D8E3F4`), alternadas con bloques arquitectónicos completos en el azul institucional de la empresa (`#00308F`).

El sistema rechaza explícitamente la plantilla genérica de tarjetas flotantes con sombras difusas, los textos con gradientes y las etiquetas decorativas sobre cada encabezado. Cada elemento gráfico —incluidos los diagramas vectoriales SVG de hardware, controladores fiscales y ecosistema POSBerry— cumple una función explicativa.

**Key Characteristics:**
- Retículas estructurales con bordes finos de 1px en lugar de sombras genéricas.
- Bloques de color institucional comprometido (`#00308F`) a escala de sección completa para momentos clave (Controladores Fiscales y CTAs finales).
- Ilustraciones geométricas SVG propias de precisión técnica sin depender de fotos genéricas de stock.
- Estado de atención comercial en vivo calculado en zona horaria de Argentina (`America/Argentina/Cordoba`).
- Transiciones y revelados progresivos con curva exponencial (`cubic-bezier(0.16, 1, 0.3, 1)`) y soporte completo de `prefers-reduced-motion`.

## Colors

Una paleta diurna y disciplinada anclada en el azul institucional histórico de la marca, complementada por neutros azulados de alta legibilidad y verde señal reservado exclusivamente para disponibilidad y WhatsApp.

### Primary
- **Institutional Cobalt** (`#00308F`): Color rector de la empresa. Se aplica en acciones primarias, identidad activa, barras de progreso de scroll, diagramas SVG y bloques de sección completa de alto impacto.
- **Technical Indigo** (`#2D4CB0`): Acento secundario de soporte para trazos vectoriales, series de gráficos y estados de interacción.

### Neutral
- **Daylight Paper** (`#FFFFFF`): Fondo principal de lectura y tarjetas estructurales.
- **Blueprint Surface** (`#F4F7FC`): Fondo alternado de secciones, paneles de horarios y formularios.
- **Hairline Border** (`#D8E3F4`): Divisores y contornos estructurales de 1px.
- **Deep Navy Ink** (`#0E1A33`): Tinta principal de titulares y texto con contraste superior a 12:1 sobre blanco.
- **Muted Slate** (`#4D5D7C`): Descripciones secundarias y metadatos manteniendo contraste ≥ 4.5:1.

### Semantic
- **Signal Emerald** (`#1FAF5A`): Reservado estrictamente para el canal WhatsApp, el estado "Abierto ahora" y disponibilidad de stock.
- **Alert Crimson** (`#DC2626`): Errores de validación y acciones destructivas en administración.

### Named Rules
**The Committed Field Rule.** El azul institucional (`#00308F`) se aplica con convicción en acciones primarias y secciones arquitectónicas completas, nunca diluido en gradientes decorativos ni sombras difusas.

**The Semantic Signal Rule.** El verde (`#1FAF5A`) pertenece únicamente a WhatsApp, estado de apertura real y confirmación de stock o cumplimiento.

## Typography

**Display Font:** Archivo (fallback `system-ui, sans-serif`)
**Body Font:** Public Sans (fallback `system-ui, sans-serif`)
**Data/Mono Font:** JetBrains Mono (fallback `ui-monospace, monospace`)

**Character:** Archivo aporta la autoridad geométrica y técnica que dialoga con el logotipo institucional, mientras Public Sans sostiene lecturas extensas de servicios, preguntas frecuentes y especificaciones técnicas con máxima nitidez en móvil y escritorio.

### Hierarchy
- **Display** (800, 3rem–3.75rem, line-height 1.04, tracking -0.03em): Titulares H1 de portada y apertura de página.
- **Headline** (700, 1.875rem–2.75rem, line-height 1.12, tracking -0.025em): Encabezados H2 de sección.
- **Title** (700, 1.125rem–1.25rem, line-height 1.3): Títulos de servicios, productos y paneles de administración.
- **Body** (400–500, 0.9375rem–1.125rem, line-height 1.6, medida máxima 65–75ch): Párrafos institucionales y descripciones.
- **Data Mono** (500, 0.75rem–0.875rem, `tabular-nums`): Exclusivo para cifras reales, stock, teléfonos, horarios, métricas de estadísticas y parámetros UTM.

### Named Rules
**The No-Eyebrow Rule.** Los encabezados hablan por sí mismos; no se colocan pastillas ni etiquetas en mayúsculas por encima de títulos H1 o H2.

**The Tabular Data Rule.** JetBrains Mono se utiliza únicamente para números, códigos, horarios y URLs rastreables, jamás como adorno tipográfico.

## Layout

Contenedor máximo de `1440px` con relleno horizontal responsivo (`16px` móvil, `24px` tablet, `32px` escritorio) y ritmo vertical de secciones entre `64px` y `112px`. Las páginas alternan bloques sobre `#FFFFFF` y `#F4F7FC` separados por bordes horizontales de `1px solid #D8E3F4`.

En móvil (`< 1024px`), el catálogo `/productos` expone una barra horizontal deslizable de categorías para mantener el filtrado completo sin barra lateral; el menú principal se resuelve en un cajón lateral con estado horario en vivo.

## Elevation & Depth

El sistema es plano y arquitectónico por defecto: la jerarquía se comunica mediante contraste tonal (`#FFFFFF` sobre `#F4F7FC`) y bordes finos de `1px`, evitando tarjetas con sombras grises permanentes. Las sombras se reservan exclusivamente para elementos flotantes sobre contenido (botón flotante de WhatsApp y bloque enmarcado sobre fondo azul institucional).

### Named Rules
**The Flat-By-Default Rule.** Los contenedores se separan por borde de 1px o cambio de superficie tonal, nunca por borde + sombra blanda simultáneos.

**The Inner-Surface Hover Rule.** Al pasar el cursor, el contenedor interactivo permanece quieto en su posición y solo su superficie o elemento interno realiza un desplazamiento sutil (`translateY(-3px)`), evitando parpadeos en bordes.

## Shapes

- **Controles y acciones (botones, chips de filtro, buscadores, indicador de horario):** Píldora completa (`9999px`).
- **Tarjetas, paneles, gráficos y marcos de imagen:** Radio arquitectónico de `16px` (`rounded-2xl`).
- **Campos de entrada e íconos enmarcados:** Radio de `12px` (`rounded-xl`).

## Components

### Buttons
- **Shape:** Píldora completa (`9999px`), altura `44px`–`48px` en CTAs principales.
- **Primary:** Fondo `#00308F` con texto blanco `#FFFFFF`; en bloques azules se invierte a fondo `#FFFFFF` con texto `#00308F`.
- **Outline / Secondary:** Fondo `#FFFFFF`, borde `1px solid #D8E3F4`, texto `#0E1A33`, transición de borde a `#00308F` al hover.

### Cards / Containers
- **Corner Style:** `16px` (`rounded-2xl`).
- **Background:** `#FFFFFF` sobre `#F4F7FC` o viceversa.
- **Border:** `1px solid #D8E3F4`, elevación por transición de borde (`#00308F` al 40%).

### Inputs / Fields
- **Style:** Altura `44px`–`48px`, borde `1px solid #D8E3F4`, fondo `#FFFFFF` o `#F4F7FC`.
- **Focus:** Transición de borde a `#00308F` y anillo visible `:focus-visible` de `2px solid #00308F`.

### Navigation
- Barra fija superior de `72px` con fondo blanco translúcido y línea inferior de `1px`. En el sitio público expone solo rutas de cliente + estado horario en vivo + CTA WhatsApp; el acceso administrativo reside discretamente en el pie de página.

### Signature Components
- **LiveOpenStatus:** Indicador en tiempo real calculado en zona horaria `America/Argentina/Cordoba`.
- **Cobertura Interactiva:** Buscador instantáneo de más de 23 localidades con confirmación inmediata y enlace a WhatsApp precargado.
- **Generador UTM en `/admin/estadisticas`:** Constructor y biblioteca de enlaces con referencias para WhatsApp, Instagram, Facebook y Google con copiado en un clic y atribución real en Supabase.

## Do's and Don'ts

### Do:
- **Do** preservar los colores institucionales (`#00308F`, `#2D4CB0`, `#FFFFFF`) y todos los textos aprobados desde Supabase.
- **Do** mantener el contenido visible por defecto ante scroll y respetar `prefers-reduced-motion`.
- **Do** usar los componentes vectoriales SVG en `src/components/brand-svgs.tsx` para representar hardware, controladores fiscales y arquitectura POSBerry.
- **Do** mostrar únicamente datos reales en `/admin/estadisticas` y registrar interacciones mediante `trackEvent`.

### Don't:
- **Don't** colocar badges o kickers por encima de encabezados H1 o H2.
- **Don't** usar texto con gradientes, sombras difusas en todas las tarjetas ni animaciones con `opacity: 0` permanente.
- **Don't** exponer el botón de administración en el header público ni etiquetas técnicas de base de datos en vistas de cliente.
- **Don't** fabricar cifras de visitas, testimonios o consultas ficticias.
