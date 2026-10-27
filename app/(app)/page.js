import { db } from '../../lib/db';
import { eur, hoy, temporadaDe, fechaES } from '../../lib/util';

export default async function Panel() {
  const sql = await db();
  const temp = temporadaDe(hoy());

  const [tot] = await sql`select coalesce(sum(case when tipo='ingreso' then importe else -importe end),0) saldo from movimientos`;
  const [t] = await sql`select coalesce(sum(importe) filter (where tipo='ingreso'),0) ing,
    coalesce(sum(importe) filter (where tipo='gasto'),0) gas from movimientos where temporada=${temp}`;
  const [s] = await sql`select count(*) filter (where activo) activos,
    count(*) filter (where activo and exists (select 1 from movimientos m where m.socio_id=socios.id and m.categoria='Cuota' and m.temporada=${temp})) pagados
    from socios`;
  const cats = await sql`select categoria, sum(importe) total from movimientos where tipo='gasto' and temporada=${temp} group by 1 order by 2 desc`;
  const ult = await sql`select id, fecha::text fecha, tipo, concepto, importe from movimientos order by fecha desc, id desc limit 6`;

  const max = Math.max(1, ...cats.map((c) => Number(c.total)));
  const saldo = Number(tot.saldo);

  return (
    <>
      <h1>Temporada {temp}</h1>
      <div className="kpis">
        <div className="kpi saldo"><small>Saldo en caja</small><b>{eur(saldo)}</b></div>
        <div className="kpi"><small>Ingresos</small><b className="pos">{eur(t.ing)}</b></div>
        <div className="kpi"><small>Gastos</small><b className="neg">{eur(t.gas)}</b></div>
        <div className="kpi"><small>Socios activos</small><b>{s.activos}</b></div>
        <div className="kpi"><small>Cuota pagada</small><b>{s.pagados} / {s.activos}</b></div>
      </div>

      {cats.length > 0 && (
        <div className="tarjeta">
          <h2>Gastos por categoría</h2>
          {cats.map((c) => (
            <div key={c.categoria} style={{ marginBottom: 8 }}>
              <div className="fila" style={{ justifyContent: 'space-between' }}>
                <span>{c.categoria}</span><b>{eur(c.total)}</b>
              </div>
              <div className="barra"><i style={{ width: `${(Number(c.total) / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      <div className="tarjeta">
        <h2>Últimos movimientos</h2>
        {ult.length === 0 && <p style={{ color: 'var(--gris)' }}>Todavía no hay movimientos. Pulsa ＋ para añadir el primero.</p>}
        {ult.map((m) => (
          <div className="item" key={m.id}>
            <div className="info"><b>{m.concepto}</b><small>{fechaES(m.fecha)}</small></div>
            <span className={'imp ' + (m.tipo === 'ingreso' ? 'pos' : 'neg')}>
              {m.tipo === 'ingreso' ? '+' : '−'}{eur(m.importe)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
