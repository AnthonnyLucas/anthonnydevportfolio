import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { certificates, certificateCategories } from '../../public/assets/data.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';

const MAX = 100;
const cut = (v, n) => String(v ?? '').trim().slice(0, n);
function safeImage(v) {
  const value = cut(v, 800);
  if (!value) return '';
  if (/^\/assets\/certificates\/[a-z0-9-]+\.webp$/.test(value)) return value;
  if (/^\/\.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(png|jpg|webp|gif)$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
function clean(value, previous = null) {
  if (!value || typeof value !== 'object') throw new Error('Dados inválidos.');
  const name = cut(value.name, 160);
  const org = cut(value.org, 125);
  const hours = cut(value.hours, 50);
  const description = cut(value.description, 550);
  if (!name || !org || !hours || !description) throw new Error('Preencha nome, instituição, duração e descrição.');
  const group = certificateCategories.includes(value.group) && value.group !== 'Todas' ? value.group : 'Educação & Idiomas';
  return {
    id: previous?.id || randomUUID(),
    name, org, hours, description, group,
    type: cut(value.type, 80) || 'Participação',
    image: safeImage(value.image),
    updatedAt: new Date().toISOString()
  };
}
export default async function handler(req) {
  try {
    const store = getStore('portfolio-certificates');
    if (req.method === 'GET') {
      const saved = await store.get('certificates', { type: 'json' });
      return json({ certificates: Array.isArray(saved) ? saved : certificates });
    }
    if (!validSession(req)) return authError();
    if (!sameOrigin(req)) return json({ error: 'Origem não autorizada.' }, 403);
    if (!['POST', 'DELETE'].includes(req.method)) return json({ error: 'Método não permitido.' }, 405);
    const body = await req.json().catch(() => ({}));
    const saved = await store.get('certificates', { type: 'json' });
    const list = Array.isArray(saved) ? saved : [...certificates];
    if (req.method === 'DELETE') {
      const filtered = list.filter(item => item.id !== String(body.id || ''));
      if (filtered.length === list.length) return json({ error: 'Formação não encontrada.' }, 404);
      await store.setJSON('certificates', filtered);
      return json({ certificates: filtered });
    }
    const id = cut(body.id, 80);
    const index = list.findIndex(item => item.id === id);
    if (id && index < 0) return json({ error: 'Formação não encontrada.' }, 404);
    if (index < 0 && list.length >= MAX) return json({ error: 'Limite de formações atingido.' }, 400);
    const normalized = clean(body, index >= 0 ? list[index] : null);
    if (index >= 0) list[index] = normalized;
    else list.unshift(normalized);
    await store.setJSON('certificates', list);
    return json({ certificates: list });
  } catch (error) {
    if (error.message?.includes('Preencha') || error.message?.includes('inválidos')) return json({ error: error.message }, 400);
    console.error('certificates error:', error);
    return json({ error: 'Não foi possível salvar formações. Verifique o armazenamento Netlify Blobs.' }, 500);
  }
}
