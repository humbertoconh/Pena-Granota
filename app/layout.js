import './globals.css';

export const metadata = { title: 'Peña Levantinista', description: 'Socios y contabilidad de la peña' };
export const viewport = { themeColor: '#0a3d91', width: 'device-width', initialScale: 1 };

export default function Root({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
