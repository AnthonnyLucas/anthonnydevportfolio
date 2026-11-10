import { getStore } from '@netlify/blobs';
import { configured, validatePassword, issueSession, validSession, sessionCookie, clearedCookie, sameOrigin, noStore, json, makeRateKey } from './lib/security.mjs';

export default async function handler(req) {
  try {
    if (req.method === 'GET') return json({ authenticated: validSession(req), configured: configured() });
    if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { Allow: 'GET, POST' });
    if (!sameOrigin(req)) return json({ error: 'Origem não autorizada.' }, 403);
    const body = await req.json().catch(() => ({}));
    if (body.action === 'logout') return json({ authenticated: false }, 200, { 'Set-Cookie': clearedCookie(req) });
    if (!configured()) return json({ error: 'Login ainda não configurado. Defina as variáveis de ambiente na Netlify.' }, 503);
    const email = String(body.email || '').trim().toLowerCase();
    const pw = body.password;
    if (email.length > 254 || typeof pw !== 'string' || pw.length > 1024) return json({ error: 'Credenciais inválidas.' }, 400);
    const throttle = getStore('portfolio-login-attempts');
    const key = `attempts-${makeRateKey(email)}`;
    const now = Date.now();
    const attempt = await throttle.get(key, { type: 'json' }) || { count: 0, reset: 0 };
    if (attempt.reset > now && attempt.count >= 8) return json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429);
    if (email !== process.env.ADMIN_EMAIL.toLowerCase() || !validatePassword(pw)) {
      const next = attempt.reset > now ? { count: attempt.count + 1, reset: attempt.reset } : { count: 1, reset: now + 15 * 60 * 1000 };
      await throttle.setJSON(key, next);
      return json({ error: 'E-mail ou senha incorretos.' }, 401);
    }
    await throttle.delete(key);
    return new Response(JSON.stringify({ authenticated: true }), { headers: { ...noStore, 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': sessionCookie(issueSession(), req) } });
  } catch (error) {
    console.error('auth error:', error);
    return json({ error: 'Não foi possível autenticar. Verifique as funções na Netlify.' }, 500);
  }
}
