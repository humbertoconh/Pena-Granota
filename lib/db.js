import { neon } from '@neondatabase/serverless';

let sql;
let ready;

// Crea las tablas la primera vez que se usa; no hay que ejecutar nada a mano.
export function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('Falta DATABASE_URL (conecta Neon al proyecto en Vercel).');
  sql ??= neon(url);
  ready ??= (async () => {
    await sql`create table if not exists socios (
      id serial primary key, numero int, nombre text not null, telefono text, email text, notas text,
      activo boolean not null default true, alta date not null default current_date)`;
    await sql`create table if not exists movimientos (
      id serial primary key, fecha date not null,
      tipo text not null check (tipo in ('ingreso','gasto')),
      categoria text not null, concepto text not null,
      importe numeric(10,2) not null check (importe > 0),
      socio_id int references socios(id) on delete set null,
      temporada text not null, foto_url text, creado timestamptz not null default now())`;
    await sql`create table if not exists ajustes (clave text primary key, valor text)`;
  })().catch((e) => { ready = undefined; throw e; });
  return ready.then(() => sql);
}
