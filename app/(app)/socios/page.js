import { db } from '../../../lib/db';
import { eur, hoy, temporadaDe } from '../../../lib/util';
import { addSocio, updateSocio, toggleSocio, deleteSocio, cobrarCuota, setCuota } from '../../../lib/actions';
import DeleteButton from '../../../components/DeleteButton';

export default async function Socios({ searchParams }) {
  const sql = await db();
  const temp = temporadaDe(hoy());
  const q = (searchParams.q || '').trim();
  const f = searchParams.f === 'pendientes' ? 'pendientes' : 'todos';

  const [aj] = await sql`select valor from ajustes where clave='cuota'`;
  const cuota = Number(aj?.valor ?? 30);
  const todos = await sql`select s.*, exists (select 1 from movimientos m where m.socio_id=s.id and m.categoria='Cuota' and m.temporada=${temp}) pagada
    from socios s where (${q} = '' or s.nombre ilike '%' || ${q} || '%' or s.numero::text = ${q})
    order by s.activo desc, s.numero nulls last, s.nombre`;
  const lista = f === 'pendientes' ? todos.filter((s) => s.activo && !s.pagada) : todos;

  return (
    <>
      <h1>Socios · {temp}</h1>

      <details className="tarjeta">
        <summary>＋ Nuevo socio</summary>
        <form action={addSocio} className="form" style={{ marginTop: 10 }}>
          <input name="nombre" placeholder="Nombre y apellidos" required />
          <div className="fila">
            <input name="numero" placeholder="Nº socio" inputMode="numeric" />
            <input name="telefono" placeholder="Teléfono" inputMode="tel" />
          </div>
          <input name="email" placeholder="Email" type="email" />
          <input name="notas" placeholder="Notas" />
          <button className="btn">Guardar socio</button>
        </form>
      </details>

      <details className="tarjeta">
        <summary>Cuota de la temporada: {eur(cuota)}</summary>
        <form action={setCuota} className="fila" style={{ marginTop: 10 }}>
          <input name="cuota" inputMode="decimal" defaultValue={cuota} />
          <button className="btn">Cambiar</button>
        </form>
      </details>

      <form className="filtros">
        <input name="q" placeholder="Buscar por nombre o nº" defaultValue={q} />
        <input type="hidden" name="f" value={f} />
        <button className="btn sec">Buscar</button>
      </form>
      <div className="chips">
        <a href={`/socios?f=todos&q=${encodeURIComponent(q)}`} className={f === 'todos' ? 'on' : ''}>Todos ({todos.length})</a>
        <a href={`/socios?f=pendientes&q=${encodeURIComponent(q)}`} className={f === 'pendientes' ? 'on' : ''}>
          Pendientes ({todos.filter((s) => s.activo && !s.pagada).length})
        </a>
      </div>

      <div className="tarjeta">
        {lista.length === 0 && <p style={{ color: 'var(--gris)' }}>No hay socios que mostrar.</p>}
        {lista.map((s) => (
          <div className="item" key={s.id} style={{ display: 'block' }}>
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>{s.numero ? `${s.numero} · ` : ''}{s.nombre}</b>
                <br />
                {s.telefono && <small><a href={`tel:${s.telefono}`}>{s.telefono}</a></small>}
              </div>
              {!s.activo ? <span className="badge baja">Baja</span>
                : s.pagada ? <span className="badge ok">Cuota ✓</span>
                : <span className="badge pend">Pendiente</span>}
            </div>
            <div className="acciones">
              {s.activo && !s.pagada && (
                <form action={cobrarCuota}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn peq">Cobrar {eur(cuota)}</button>
                </form>
              )}
              <form action={toggleSocio}>
                <input type="hidden" name="id" value={s.id} />
                <button className="btn sec peq">{s.activo ? 'Dar de baja' : 'Reactivar'}</button>
              </form>
              <DeleteButton action={deleteSocio} id={s.id} texto={`¿Borrar a ${s.nombre}? Sus pagos se conservan.`} />
            </div>
            <details>
              <summary>Editar</summary>
              <form action={updateSocio} className="form" style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={s.id} />
                <input name="nombre" defaultValue={s.nombre} required />
                <div className="fila">
                  <input name="numero" defaultValue={s.numero ?? ''} placeholder="Nº" inputMode="numeric" />
                  <input name="telefono" defaultValue={s.telefono ?? ''} placeholder="Teléfono" />
                </div>
                <input name="email" defaultValue={s.email ?? ''} placeholder="Email" />
                <input name="notas" defaultValue={s.notas ?? ''} placeholder="Notas" />
                <button className="btn peq">Guardar cambios</button>
              </form>
            </details>
          </div>
        ))}
      </div>
    </>
  );
}
