'use client';

export default function DeleteButton({ action, id, texto = '¿Seguro que quieres borrarlo?', children = 'Borrar' }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(texto)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="btn peligro peq">{children}</button>
    </form>
  );
}
