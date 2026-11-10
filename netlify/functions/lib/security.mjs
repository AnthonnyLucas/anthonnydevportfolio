import { createHmac, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

const COOKIE = 'portfolio_session';
const HOURS = 12;
export const noStore = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { ...noStore, ...headers } });
const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};

export function configured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
}
export function validatePassword(password) {
  const [scheme, salt, hash] = String(process.env.ADMIN_PASSWORD_HASH || '').split('$');
  if (scheme !== 'scrypt' || !/^[a-f0-9]{32,}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  if (typeof password !== 'string' || password.length > 1024) return false;
  const derived = scryptSync(password, salt, 64).toString('hex');
  return safeEqual(derived, hash);
}
function signature(payload) {
  return createHmac('sha256', process.env.SESSION_SECRET || '').update(payload).digest('base64url');
}
export function issueSession() {
  const body = Buffer.from(JSON.stringify({ email: process.env.ADMIN_EMAIL.toLowerCase(), expires: Date.now() + HOURS * 3600000 })).toString('base64url');
  return `${body}.${signature(body)}`;
}
export function validSession(req) {
  if (!configured()) return false;
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split(';').map(p => p.trim()).find(p => p.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || token.length > 2048) return false;
  const [body, sig, extra] = token.split('.');
  if (!body || !sig || extra !== undefined || !safeEqual(signature(body), sig)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return data.expires > Date.now() && data.email === process.env.ADMIN_EMAIL.toLowerCase();
  } catch { return false; }
}
export function sessionCookie(token, req) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${HOURS * 3600}${secure}`;
}
export function clearedCookie(req) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
export function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(req.url).origin; } catch { return false; }
}
export const authError = () => json({ error: 'Acesso não autorizado. Entre novamente.' }, 401);
export const makeRateKey = email => createHash('sha256').update(String(email).toLowerCase()).digest('hex');
