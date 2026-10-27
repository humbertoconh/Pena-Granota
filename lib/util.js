export const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n));
export const hoy = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
export const fechaES = (f) => String(f).slice(0, 10).split('-').reverse().join('/');

// Temporada de julio a junio: 2026-10-27 -> "2026/27"
export const temporadaDe = (f) => {
  const y = +f.slice(0, 4);
  const m = +f.slice(5, 7);
  return m >= 7 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
};

export const CATS = {
  ingreso: ['Cuota', 'Lotería', 'Rifa / Sorteo', 'Patrocinio / Subvención', 'Merchandising', 'Otros ingresos'],
  gasto: ['Autobús / Desplazamientos', 'Entradas / Abonos', 'Comida y bebida', 'Material (bufandas, banderas…)', 'Local', 'Eventos', 'Otros gastos'],
};
