import { login } from '../../lib/actions';

export default function Login({ searchParams }) {
  return (
    <>
      <div className="banda" />
      <div className="login">
        <h1>{process.env.PENA_NOMBRE || 'Peña Levantinista'}</h1>
        <p style={{ color: 'var(--gris)' }}>Acceso para la junta</p>
        <form action={login} className="form">
          <input type="password" name="password" placeholder="Contraseña" autoFocus required />
          {searchParams.error && <div className="error">Contraseña incorrecta</div>}
          <button className="btn grande">Entrar</button>
        </form>
      </div>
    </>
  );
}
