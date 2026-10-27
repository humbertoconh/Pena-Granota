'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { db } from './db';
import { token } from './auth';
import { CATS, hoy, temporadaDe } from './util';

const txt = (fd, k) => String(fd.get(k) ?? '').trim();

export async function login(fd) {
  const pw = process.env.PENA_PASSWORD;
  if (!pw || txt(fd, 'password') !== pw) redirect('/login?error=1');
  cookies().set('pena', await token(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 90, path: '/',
  });
  redirect('/');
}

export async function logout() {
  cookies().delete('pena');
  redirect('/login');
}

// ---------- Socios ----------
export async function addSocio(fd) {
  const sql = await db();
  const nombre = txt(fd, 'nombre');
  if (!nombre) return;
  const numero = parseInt(txt(fd, 'numero')) || null;
  await sql`insert into socios (numero, nombre, telefono, email, notas)
    values (${numero}, ${nombre}, ${txt(fd, 'telefono')}, ${txt(fd, 'email')}, ${txt(fd, 'notas')})`;
  revalidatePath('/socios');
}

export async function updateSocio(fd) {
  const sql = await db();
  const numero = parseInt(txt(fd, 'numero')) || null;
  await sql`update socios set numero=${numero}, nombre=${txt(fd, 'nombre')}, telefono=${txt(fd, 'telefono')},
    email=${txt(fd, 'email')}, notas=${txt(fd, 'notas')} where id=${+fd.get('id')}`;
  revalidatePath('/socios');
}

export async function toggleSocio(fd) {
  const sql = await db();
  await sql`update socios set activo = not activo where id=${+fd.get('id')}`;
  revalidatePath('/socios');
}

export async function deleteSocio(fd) {
  const sql = await db();
  await sql`delete from socios where id=${+fd.get('id')}`; // sus movimientos se conservan sin socio
  revalidatePath('/socios');
}

export async function setCuota(fd) {
  const sql = await db();
  const v = parseFloat(txt(fd, 'cuota').replace(',', '.'));
  if (!(v > 0)) return;
  await sql`insert into ajustes (clave, valor) values ('cuota', ${String(v)})
    on conflict (clave) do update set valor = excluded.valor`;
  revalidatePath('/socios');
}

export async function cobrarCuota(fd) {
  const sql = await db();
  const id = +fd.get('id');
  const f = hoy();
  const temp = temporadaDe(f);
  const [aj] = await sql`select valor from ajustes where clave='cuota'`;
  const [s] = await sql`select nombre from socios where id=${id}`;
  if (!s) return;
  const ya = await sql`select 1 from movimientos where socio_id=${id} and categoria='Cuota' and temporada=${temp}`;
  if (ya.length) return;
  await sql`insert into movimientos (fecha, tipo, categoria, concepto, importe, socio_id, temporada)
    values (${f}, 'ingreso', 'Cuota', ${`Cuota ${temp} - ${s.nombre}`}, ${Number(aj?.valor ?? 30)}, ${id}, ${temp})`;
  revalidatePath('/socios');
  revalidatePath('/');
}

// ---------- Movimientos ----------
export async function addMovimiento(fd) {
  const sql = await db();
  const tipo = txt(fd, 'tipo');
  const categoria = txt(fd, 'categoria');
  const fecha = txt(fd, 'fecha');
  const importe = parseFloat(txt(fd, 'importe').replace(',', '.'));
  if (!CATS[tipo]?.includes(categoria) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !(importe > 0)) {
    throw new Error('Datos no válidos: revisa tipo, categoría, fecha e importe.');
  }
  const socio = categoria === 'Cuota' && txt(fd, 'socio_id') ? +fd.get('socio_id') : null;

  let foto = null;
  const file = fd.getAll('foto').find((f) => f && f.size > 0);
  if (file) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Falta conectar Vercel Blob para guardar fotos.');
    const ext = file.type === 'application/pdf' ? 'pdf' : 'jpg';
    foto = (await put(`tickets/${fecha}.${ext}`, file, { access: 'public', addRandomSuffix: true })).url;
  }

  await sql`insert into movimientos (fecha, tipo, categoria, concepto, importe, socio_id, temporada, foto_url)
    values (${fecha}, ${tipo}, ${categoria}, ${txt(fd, 'concepto') || categoria}, ${importe}, ${socio}, ${temporadaDe(fecha)}, ${foto})`;
  revalidatePath('/');
  revalidatePath('/movimientos');
  revalidatePath('/socios');
  redirect('/movimientos');
}

export async function deleteMovimiento(fd) {
  const sql = await db();
  const [m] = await sql`delete from movimientos where id=${+fd.get('id')} returning foto_url`;
  if (m?.foto_url) await del(m.foto_url).catch(() => {});
  revalidatePath('/');
  revalidatePath('/movimientos');
  revalidatePath('/socios');
}
