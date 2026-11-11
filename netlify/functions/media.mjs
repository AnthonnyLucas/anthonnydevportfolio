import { getStore } from '@netlify/blobs';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';
import { randomUUID } from 'node:crypto';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_BYTES = 4 * 1024 * 1024;
export default async function handler(req) {
  try {
    const store = getStore('portfolio-media');
    if (req.method === 'GET') {
      const key = new URL(req.url).searchParams.get('key') || '';
      if (!/^[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(key)) return json({ error: 'Imagem inválida.' }, 400);
      const data = await store.get(key, { type: 'arrayBuffer' });
      if (!data) return json({ error: 'Imagem não encontrada.' }, 404);
      const contentType = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[key.split('.').at(-1)];
      return new Response(data, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
    if (!validSession(req)) return authError();
    if (!sameOrigin(req)) return json({ error: 'Origem não autorizada.' }, 403);
    const mime = (req.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (!TYPES[mime]) return json({ error: 'Use JPG, PNG, WEBP ou GIF.' }, 415);
    const len = Number(req.headers.get('content-length') || 0);
    if (len > MAX_BYTES) return json({ error: 'A imagem deve ter até 4 MB.' }, 413);
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return json({ error: 'Arquivo vazio ou maior que 4 MB.' }, 413);
    const signature = new Uint8Array(buffer.slice(0, 12));
    const jpg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    const png = [137,80,78,71,13,10,26,10].every((b, i) => signature[i] === b);
    const webp = String.fromCharCode(...signature.slice(0, 4)) === 'RIFF' && String.fromCharCode(...signature.slice(8, 12)) === 'WEBP';
    const gif = ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...signature.slice(0,6)));
    if (!({ 'image/jpeg': jpg, 'image/png': png, 'image/webp': webp, 'image/gif': gif })[mime]) return json({ error: 'A imagem não corresponde ao formato informado.' }, 415);
    const key = `${randomUUID()}.${TYPES[mime]}`;
    await store.set(key, buffer);
    return json({ url: `/.netlify/functions/media?key=${key}` }, 201);
  } catch (error) {
    console.error('media error:', error);
    return json({ error: 'Erro ao armazenar imagem na Netlify.' }, 500);
  }
}
