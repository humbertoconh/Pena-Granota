import { db } from '../../../../lib/db';
import { hoy } from '../../../../lib/util';
import { addMovimiento } from '../../../../lib/actions';
import MovimientoForm from '../../../../components/MovimientoForm';

export default async function Nuevo() {
  const sql = await db();
  const socios = await sql`select id, numero, nombre from socios where activo order by numero nulls last, nombre`;
  return (
    <>
      <h1>Nuevo movimiento</h1>
      <MovimientoForm action={addMovimiento} socios={socios} hoy={hoy()} />
    </>
  );
}
