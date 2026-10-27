'use client';

export default function Error({ error, reset }) {
  return (
    <div className="tarjeta">
      <h2>Vaya, algo ha fallado</h2>
      <p className="error">{error.message}</p>
      <button className="btn" onClick={reset}>Reintentar</button>
    </div>
  );
}
