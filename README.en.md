<div align="center">

# Dario Martinez — Corporate Site & Management Panel

**Complete web platform for Dario Martinez (POS hardware, fiscal controllers, tech services). Public site + realtime private admin.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/)

**[📦 Repo](https://github.com/FelipeDiazAimar/DarioMartinez) · [🇪🇸 Español](README.md)**

</div>

## What is it?

Corporate platform for a POS/fiscal-controller company. **Public site** (`src/app/(sitio)` routes): home, products, services, dedicated Posberry POS page, fiscal controllers, about, contact, FAQ. **Private admin** (`src/app/admin`, cookie-middleware protected): articles/categories/prices/sales CRUD, Kardex inventory control, statistics dashboard (Recharts), customer inquiries inbox, and per-page content editors (`editar-home/productos/servicios/posberry/…`), plus `/admin-login` and Next.js API routes.

## Stack & run

Next `15.5.9` (Turbopack `:9002`) · React `19.2` · TS · Tailwind + Radix/shadcn · Supabase `2.95` (+ `pg`/`mysql2` drivers) · Firebase `11.9` auth · Genkit `1.20` + Gemini 2.5 Flash (`genkit:dev`) · Recharts · RHF + Zod · Vercel Analytics + Speed Insights. Client docs: `README_CLIENTE.md`, `RESUMEN_EXECUTIVE_CLIENTE.md`.

```bash
npm install
npm run dev        # 👉 http://localhost:9002
npm run genkit:dev # AI server
npm run build && npm start
```

Env: Supabase keys, Firebase web keys (`NEXT_PUBLIC_FIREBASE_*`), `GOOGLE_GENAI_API_KEY`, `ADMIN_PASSWORD`. Deploy: Firebase App Hosting (`apphosting.yaml`).

## Author

**Felipe Diaz Aimar** — https://www.linkedin.com/in/felipe-aimar/ · felipediazaimar@gmail.com · https://github.com/FelipeDiazAimar · Private project, all rights reserved © Dario Martinez.
