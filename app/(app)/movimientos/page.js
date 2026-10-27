import { db } from '../../../lib/db';
import { eur, hoy, temporadaDe, fechaES } from '../../../lib/util';
import { deleteMovimiento } from '../../../lib/actions';
import DeleteButton from '../../../components/DeleteButton';

export default async function Movimientos({ searchParams }) {
  const sql = await db();
  const actual = temporadaDe(hoy());
  const temp = searchParams.temp || actual;
  const tipo = ['ingreso', 'gasto'].includes(searchParams.tipo) ? searchParams.tipo : '';
  const q = (searchParams.q || '').trim();

  const temporadas = await sql`select distinct temporada from movimientos union select ${actual} order by 1 desc`;
  const movs = await sql`select m.id, m.fecha::text fecha, m.tipo, m.categoria, m.concepto, m.importe, m.foto_url, s.nombre socio
    from movimientos m left join socios s on s.id = m.socio_id
    where m.temporada = ${temp} and (${tipo} = '' or m.tipo = ${tipo})
      and (${q} = '' or m.concepto ilike '%' || ${q} || '%' or m.categoria ilike '%' || ${q} || '%')
    order by m.fecha desc, m.id desc`;

  const ing = movs.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + Number(m.importe), 0);
  const gas = movs.filter((m) => m.tipo === 'gasto').reduce((a, m) => a + Number(m.importe), 0);

  return (
    <>
      <h1>Cuentas</h1>
      <form className="filtros">
        <input name="q" placeholder="Buscar concepto o categoría" defaultValue={q} />
        <select name="temp" defaultValue={temp}>
          {temporadas.map((t) => <option key={t.temporada}>{t.temporada}</option>)}
        </select>
        <select name="tipo" defaultValue={tipo}>
          <option value="">Todo</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
        </select>
        <button className="btn sec">Filtrar</button>
        <a className="btn sec" href={`/api/export?temp=${encodeURIComponent(temp)}`}>⬇ Excel (CSV)</a>
      </form>

      <div className="kpis">
        <div className="kpi"><small>Ingresos</small><b className="pos">{eur(ing)}</b></div>
        <div className="kpi"><small>Gastos</small><b className="neg">{eur(gas)}</b></div>
      </div>

      <div className="tarjeta">
        {movs.length === 0 && <p style={{ color: 'var(--gris)' }}>No hay movimientos con estos filtros.</p>}
        {movs.map((m) => (
          <div className="item" key={m.id}>
            {m.foto_url && (m.foto_url.endsWith('.pdf')
              ? <a href={m.foto_url} target="_blank" rel="noreferrer" className="mini" style={{ fontSize: 28 }}>📄</a>
              : <a href={m.foto_url} target="_blank" rel="noreferrer"><img className="mini" src={m.foto_url} alt="Ticket" /></a>)}
            <div className="info">
              <b>{m.concepto}</b>
              <small>{fechaES(m.fecha)} · {m.categoria}{m.socio ? ` · ${m.socio}` : ''}</small>
            </div>
            <span className={'imp ' + (m.tipo === 'ingreso' ? 'pos' : 'neg')}>
              {m.tipo === 'ingreso' ? '+' : '−'}{eur(m.importe)}
            </span>
            <DeleteButton action={deleteMovimiento} id={m.id} texto="¿Borrar este movimiento y su foto?">✕</DeleteButton>
          </div>
        ))}
      </div>
    </>
  );
}
