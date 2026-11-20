import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_LONG_SECONDS,
  SESSION_SHORT_SECONDS,
  createSessionToken,
  getSessionSecret,
  passwordMatches,
} from '@/lib/admin-session';

// Fuera de /api/admin a propósito: el middleware protege /api/admin/* y esta ruta
// tiene que poder usarse sin sesión.

const FAILED_LOGIN_DELAY_MS = 1000;

export async function POST(request: Request) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = getSessionSecret();

  if (!expectedPassword || !secret) {
    console.error('[admin-login] Faltan ADMIN_PASSWORD o ADMIN_SESSION_SECRET (mínimo 32 caracteres).');
    return NextResponse.json(
      { success: false, message: 'El acceso al panel no está configurado en el servidor.' },
      { status: 500 },
    );
  }

  let password = '';
  let remember = false;
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
    remember = body?.remember === true;
  } catch {
    return NextResponse.json({ success: false, message: 'Solicitud inválida.' }, { status: 400 });
  }

  if (!password || !(await passwordMatches(password, expectedPassword))) {
    // Frena los intentos de adivinar la clave probando muchas seguidas.
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return NextResponse.json({ success: false, message: 'Clave incorrecta. Intente de nuevo.' }, { status: 401 });
  }

  const maxAge = remember ? SESSION_LONG_SECONDS : SESSION_SHORT_SECONDS;
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(secret, maxAge), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Sin "recordar", la cookie se borra al cerrar el navegador (y la firma vence a las 12 h).
    ...(remember ? { maxAge } : {}),
  });

  return response;
}

/** Cerrar sesión. */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
