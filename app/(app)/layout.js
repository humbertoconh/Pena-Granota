import Nav from '../../components/Nav';
import { logout } from '../../lib/actions';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }) {
  return (
    <>
      <div className="banda" />
      <header className="cab">
        <div className="wrap">
          <b>🐸 {process.env.PENA_NOMBRE || 'Peña Levantinista'}</b>
          <form action={logout}><button>Salir</button></form>
        </div>
      </header>
      <main className="wrap">{children}</main>
      <Nav />
    </>
  );
}
