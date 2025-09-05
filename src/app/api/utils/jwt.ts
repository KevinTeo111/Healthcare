import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'dev-secret-change-me';
  return secret;
}

export function signJwt(payload: AuthTokenPayload, expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS): { token: string; maxAge: number } {
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: expiresInSeconds });
  return { token, maxAge: expiresInSeconds };
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded as T;
  } catch {
    return null;
  }
}

export function readTokenFromRequest(req: Request): string | null {
  // Prefer Authorization header, fallback to cookie named 'token'
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7);
  }
  // In route handlers, cookies are available on NextResponse, but we can parse from header
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}



