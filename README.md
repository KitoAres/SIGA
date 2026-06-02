# SIGA — Sistema Integral de Gestión de Amor

App privada full-stack para cuidar el vínculo.

## Stack
- Node.js + Express (backend)
- PostgreSQL en Supabase
- Vanilla JS SPA (frontend)
- Vercel (deploy)
- Resend API (notificaciones email)
- Gemini API (SIGy, asistente emocional)

## Módulos
dashboard · recuerdos · citas · playlist · razones · promesas · carta · tiempo · eventos · cajita · espacio · calma · sigy · admin

## Setup
1. Clonar el repo y entrar a `backend/`
2. Copiar `.env.example` a `.env` y llenar las variables
3. Ejecutar `database.sql` en Supabase (SQL Editor)
4. `npm install && npm run dev`

## Variables de entorno requeridas
```
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_TO=
```
