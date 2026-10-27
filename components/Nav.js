'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['/', '📊', 'Panel'],
  ['/socios', '👥', 'Socios'],
  ['/movimientos/nuevo', '＋', 'Nuevo', true],
  ['/movimientos', '🧾', 'Cuentas'],
];

export default function Nav() {
  const p = usePathname();
  const activo = (h) => (h === '/' ? p === '/' : h === '/movimientos' ? p === '/movimientos' : p.startsWith(h));
  return (
    <nav className="nav">
      {items.map(([h, ic, t, mas]) => (
        <Link key={h} href={h} className={(activo(h) ? 'on ' : '') + (mas ? 'mas' : '')}>
          <span>{ic}</span>
          <small>{t}</small>
        </Link>
      ))}
    </nav>
  );
}
