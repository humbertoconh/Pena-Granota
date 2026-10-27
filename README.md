# Peña Levantinista · socios y contabilidad

App móvil para llevar socios, cuotas, ingresos y gastos con foto del ticket. Colores azulgrana.

Stack gratis: **Next.js en Vercel + Neon (Postgres) + Vercel Blob (fotos)**. Sin Supabase.

## Desplegar

1. Sube esta carpeta a un repositorio de GitHub (o usa `vercel` desde la terminal).
2. En Vercel: **Add New → Project** e importa el repo.
3. En el proyecto, pestaña **Storage**:
   - **Create Database → Neon** (plan gratis). Añade solo `DATABASE_URL`.
   - **Create Database → Blob**. Añade `BLOB_READ_WRITE_TOKEN`.
4. En **Settings → Environment Variables** añade:
   - `PENA_PASSWORD` → la contraseña de la junta
   - `AUTH_SECRET` → una frase larga cualquiera
   - `PENA_NOMBRE` → p. ej. `Peña Granota de Orriols`
5. **Deployments → Redeploy**.

Las tablas se crean solas la primera vez que entras. En el móvil: abre la web y "Añadir a pantalla de inicio".

## Uso

- **＋** (botón rojo): nuevo gasto o ingreso, con foto hecha en el momento o de la galería/PDF.
- **Socios**: alta, edición, baja, y botón "Cobrar cuota" (crea el ingreso solo).
- **Cuentas**: filtros por temporada (julio–junio), tipo y texto; descarga CSV para Excel.

## En local

```
npm install
DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... PENA_PASSWORD=1234 npm run dev
```
