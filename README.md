# Dario Martinez — Sitio Web Institucional & Panel de Gestión

Plataforma web completa para **Dario Martinez**, empresa especializada en equipos de punto de venta (POS), controladores fiscales y servicios tecnológicos. Combina un sitio público de presentación comercial con un panel de administración privado para gestionar el negocio en tiempo real.

---

## Tecnologías

| Capa | Stack |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS, Radix UI, shadcn/ui |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Firebase + middleware de cookie |
| IA Generativa | Google Genkit + Gemini 2.5 Flash |
| Gráficos | Recharts |
| Formularios | React Hook Form + Zod |
| Deploy | Firebase App Hosting + Vercel Analytics |

---

## Estructura del Proyecto

```
src/
├── ai/                     # Configuración de Google Genkit / Gemini
├── app/
│   ├── (sitio público)
│   │   ├── page.tsx              # Home
│   │   ├── productos/            # Catálogo de productos
│   │   ├── servicios/            # Servicios ofrecidos
│   │   ├── posberry/             # Página dedicada al POS Posberry
│   │   ├── controladores-fiscales/
│   │   ├── sobre-nosotros/
│   │   ├── contacto/
│   │   └── preguntas-frecuentes/
│   ├── admin/                    # Panel de administración (protegido)
│   │   ├── articulos/            # ABM de artículos
│   │   ├── categorias/
│   │   ├── precios/
│   │   ├── ventas/
│   │   ├── kardex/               # Control de inventario
│   │   ├── estadisticas/         # Dashboard con gráficos
│   │   ├── consultas/            # Mensajes de contacto de clientes
│   │   ├── editar-home/
│   │   ├── editar-productos/
│   │   ├── editar-servicios/
│   │   ├── editar-posberry/
│   │   ├── editar-sobre-nosotros/
│   │   ├── editar-contacto/
│   │   ├── editar-controladores-fiscales/
│   │   └── editar-preguntas-frecuentes/
│   ├── admin-login/              # Login del panel
│   └── api/                      # API Routes (Next.js)
│       ├── admin/articulos/
│       ├── admin/categorias/
│       ├── admin/controladores-fiscales/
│       ├── admin/precios/
│       ├── admin/servicios/
│       ├── admin/ventas/
│       └── image-proxy/
├── components/                   # Componentes reutilizables
└── middleware.ts                  # Protección de rutas /admin
```

---

## Funcionalidades

### Sitio Público
- **Home** con carrusel automático, secciones de servicios, misión/visión/valores y clientes destacados
- **Catálogo de productos** con filtrado por categoría y detalle individual
- **Página Posberry** con información del sistema POS propio
- **Controladores fiscales** con especificaciones técnicas
- **Servicios** con descripción detallada de cada oferta
- **Contacto** con formulario que llega al panel de administración
- **Preguntas frecuentes** con acordeón interactivo
- **Sobre nosotros** con historia y equipo

### Panel de Administración (`/admin`)
Acceso protegido por cookie de sesión mediante middleware de Next.js.

- **Artículos** — alta, edición, baja y control de stock
- **Categorías** — organización del catálogo
- **Precios** — gestión de listas de precios
- **Ventas** — registro y seguimiento de operaciones
- **Kardex** — historial de movimientos de inventario
- **Estadísticas** — dashboard con gráficos de ventas y stock (Recharts)
- **Consultas** — bandeja de mensajes entrantes del formulario de contacto
- **Edición de contenido** — cada sección del sitio público es editable desde el panel sin tocar código

---

## Comenzar

### Requisitos
- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Firebase](https://firebase.google.com)
- API Key de Google AI (para Genkit)

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd DarioMartinez

# Instalar dependencias
npm install
```

### Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

GOOGLE_GENAI_API_KEY=tu_api_key_de_google_ai

ADMIN_PASSWORD=tu_contraseña_del_panel
```

### Desarrollo

```bash
npm run dev
```

La app corre en [http://localhost:9002](http://localhost:9002).

Para el servidor de IA (Genkit):

```bash
npm run genkit:dev
```

### Build de producción

```bash
npm run build
npm run start
```

---

## Deploy

El proyecto está configurado para **Firebase App Hosting** (`apphosting.yaml`) con una instancia máxima configurable. También incluye integración con **Vercel Analytics** y **Speed Insights**.

---

## Licencia

Proyecto privado — todos los derechos reservados © Dario Martinez.
