// Token de sesión = HMAC de una constante con la clave secreta. Funciona en Edge (middleware) y Node.
export async function token() {
  const secret = process.env.AUTH_SECRET || process.env.PENA_PASSWORD || 'sin-configurar';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('pena-ok'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
