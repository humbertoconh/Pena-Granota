// Las fotos se comprimen en el móvil (~300 KB); 4mb deja margen sin pasar el límite de 4,5 MB de Vercel.
module.exports = { experimental: { serverActions: { bodySizeLimit: '4mb' } } };
