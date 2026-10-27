import { db } from '../../../lib/db';
import { hoy, temporadaDe } from '../../../lib/util';

export const dynamic = 'force-dynamic';

const celda = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;

// CSV con ; y BOM para que Excel en español lo abra bien con acentos.
export async function GET(req) {
  const sql = await db();
  const temp = new URL(req.url).searchParams.get('temp') || temporadaDe(hoy());
  const rows = await sql`select m.fecha::text fecha, m.tipo, m.categoria, m.concepto, m.importe, s.nombre socio, m.foto_url
    from movimientos m left join socios s on s.id = m.socio_id where m.temporada = ${temp} order by m.fecha, m.id`;
  const cab = ['Fecha', 'Tipo', 'Categoría', 'Concepto', 'Importe', 'Socio', 'Foto'];
  const body = rows.map((r) => [r.fecha, r.tipo, r.categoria, r.concepto, String(r.importe).replace('.', ','), r.socio, r.foto_url].map(celda).join(';'));
  return new Response('﻿' + [cab.map(celda).join(';'), ...body].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="peña-${temp.replace('/', '-')}.csv"`,
    },
  });
}
