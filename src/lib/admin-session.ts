// Sesión del panel de administración.
// La cookie lleva "<vencimiento>.<firma>"; la firma es un HMAC-SHA256 con ADMIN_SESSION_SECRET,
// así que no se puede fabricar sin conocer el secreto. Usa Web Crypto para funcionar
// tanto en el middleware (Edge) como en las rutas de Node.

export const ADMIN_SESSION_COOKIE = 'admin_session';

/** Duración de la sesión: 12 horas, o 30 días con "Recordar este dispositivo". */
export const SESSION_SHORT_SECONDS = 60 * 60 * 12;
export const SESSION_LONG_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

/** Comparación en tiempo constante para no filtrar información por la duración. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  // Un secreto corto se podría adivinar: se exige uno largo.
  return secret && secret.length >= 32 ? secret : null;
}

export async function createSessionToken(secret: string, maxAgeSeconds: number) {
  const expiresAt = String(Math.floor(Date.now() / 1000) + maxAgeSeconds);
  return `${expiresAt}.${await sign(expiresAt, secret)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | null) {
  if (!token || !secret) return false;

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  return safeEqual(signature, await sign(expiresAt, secret));
}

/** Compara la clave ingresada con ADMIN_PASSWORD sin filtrar su largo. */
export async function passwordMatches(input: string, expected: string) {
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(input)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  return safeEqual(toBase64Url(a), toBase64Url(b));
}
