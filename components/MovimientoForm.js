'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CATS } from '../lib/util';

// Reduce la foto a ~1600px en JPEG antes de subirla: sube rápido con datos móviles y cabe en el límite de Vercel.
async function comprimir(file) {
  if (!file.type.startsWith('image/')) return file;
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.8));
  return new File([blob], 'ticket.jpg', { type: 'image/jpeg' });
}

function Guardar() {
  const { pending } = useFormStatus();
  return <button className="btn grande" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>;
}

export default function MovimientoForm({ action, socios, hoy }) {
  const [tipo, setTipo] = useState('gasto');
  const [cat, setCat] = useState(CATS.gasto[0]);
  const [preview, setPreview] = useState(null);

  const cambiaTipo = (t) => { setTipo(t); setCat(CATS[t][0]); };

  async function onFoto(e) {
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    const peq = await comprimir(f);
    if (peq.size > 4 * 1024 * 1024) { alert('El archivo pesa más de 4 MB. Prueba con una foto.'); input.value = ''; return; }
    const dt = new DataTransfer();
    dt.items.add(peq);
    input.files = dt.files;
    setPreview(peq.type === 'application/pdf' ? 'pdf' : URL.createObjectURL(peq));
  }

  return (
    <form action={action} className="tarjeta form">
      <div className="seg">
        {['gasto', 'ingreso'].map((t) => (
          <label key={t} className={tipo === t ? 'on ' + t : ''}>
            <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => cambiaTipo(t)} />
            {t === 'gasto' ? '− Gasto' : '+ Ingreso'}
          </label>
        ))}
      </div>

      <label>Importe (€)
        <input name="importe" inputMode="decimal" placeholder="0,00" required autoFocus className="importe" />
      </label>
      <label>Fecha
        <input type="date" name="fecha" defaultValue={hoy} required />
      </label>
      <label>Categoría
        <select name="categoria" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATS[tipo].map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      {cat === 'Cuota' && (
        <label>Socio
          <select name="socio_id" required>
            <option value="">— elige socio —</option>
            {socios.map((s) => <option key={s.id} value={s.id}>{s.numero ? `${s.numero} · ` : ''}{s.nombre}</option>)}
          </select>
        </label>
      )}
      <label>Concepto
        <input name="concepto" placeholder="Ej: Autobús Valencia–Elche" />
      </label>

      <div className="fotos">
        <span>Ticket o factura</span>
        <div className="fila">
          <label className="btn sec">
            📷 Hacer foto
            <input type="file" name="foto" accept="image/*" capture="environment" onChange={onFoto} hidden />
          </label>
          <label className="btn sec">
            🖼️ Galería / PDF
            <input type="file" name="foto" accept="image/*,application/pdf" onChange={onFoto} hidden />
          </label>
        </div>
        {preview === 'pdf' && <p className="peq">📄 PDF adjuntado</p>}
        {preview && preview !== 'pdf' && <img src={preview} alt="Vista previa" className="preview" />}
      </div>

      <Guardar />
    </form>
  );
}
