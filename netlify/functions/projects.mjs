import { getStore } from '@netlify/blobs';
import { showcaseProjects } from '../../public/assets/data.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';

const MAX = 60;
const shorten = (v, n) => String(v ?? '').trim().slice(0, n);
function safeUrl(value, image = false) {
  const v = shorten(value, 600);
  if (!v) return '';
  if (image && (/^\/.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(v) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(v))) return v;
  try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) ? v : ''; } catch { return ''; }
}
function normalize(value, prior = null) {
  if (!value || typeof value !== 'object') throw new Error('Projeto inválido.');
  const title = shorten(value.title, 100);
  const description = shorten(value.description, 1600);
  if (!title || !description) throw new Error('Título e descrição são obrigatórios.');
  return {
    id: prior?.id || crypto.randomUUID(),
    title, description,
    category: ['Full Stack', 'IoT', 'Inteligência Artificial', 'Dados', 'Outros'].includes(value.category) ? value.category : 'Outros',
    image: safeUrl(value.image, true),
    repository: safeUrl(value.repository),
    demo: safeUrl(value.demo),
    tags: [...new Set(Array.isArray(value.tags) ? value.tags.map(t => shorten(t, 30)).filter(Boolean) : [])].slice(0, 12),
    featured: Boolean(value.featured),
    updatedAt: new Date().toISOString()
  };
}
export default async function handler(req) {
  try {
    const store = getStore('portfolio-projects');
    if (req.method === 'GET') {
      const saved = await store.get('projects', { type: 'json' });
      const projects = Array.isArray(saved) ? saved : showcaseProjects;
      return json({ projects });
    }
    if (!validSession(req)) return authError();
    if (!sameOrigin(req)) return json({ error: 'Origem não autorizada.' }, 403);
    if (!['POST', 'DELETE'].includes(req.method)) return json({ error: 'Método não permitido.' }, 405);
    const body = await req.json().catch(() => ({}));
    const saved = await store.get('projects', { type: 'json' });
    const projects = Array.isArray(saved) ? saved : [...showcaseProjects];
    if (req.method === 'DELETE') {
      const id = String(body.id || '');
      const filtered = projects.filter(p => p.id !== id);
      if (filtered.length === projects.length) return json({ error: 'Projeto não encontrado.' }, 404);
      await store.setJSON('projects', filtered);
      return json({ projects: filtered });
    }
    const id = String(body.id || '');
    const index = projects.findIndex(p => p.id === id);
    if (id && index < 0) return json({ error: 'Projeto não encontrado.' }, 404);
    if (index < 0 && projects.length >= MAX) return json({ error: `Limite de ${MAX} projetos atingido.` }, 400);
    const clean = normalize(body, index >= 0 ? projects[index] : null);
    if (index >= 0) projects[index] = clean; else projects.unshift(clean);
    await store.setJSON('projects', projects);
    return json({ projects });
  } catch (error) {
    if (error.message?.includes('obrigatório') || error.message?.includes('inválido')) return json({ error: error.message }, 400);
    console.error('projects error:', error);
    return json({ error: 'Erro ao acessar armazenamento na Netlify.' }, 500);
  }
}
