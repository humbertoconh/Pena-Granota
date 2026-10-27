export default function manifest() {
  return {
    name: 'Peña Levantinista',
    short_name: 'Peña',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f5fa',
    theme_color: '#0a3d91',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
