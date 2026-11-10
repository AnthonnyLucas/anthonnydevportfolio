import { getStore } from '@netlify/blobs';
import { showcaseProjects } from '../../public/assets/data.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';
import {loadCategories,categoryId,expandProject} from './lib/catalogs.mjs';

const MAX = 500;
const shorten = (v, n) => String(v ?? '').trim().slice(0, n);
function safeUrl(value, image = false) {
  const v = shorten(value, 600);
  if (!v) return '';
  if (image && (/^\/.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(v) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(v))) return v;
  try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) ? v : ''; } catch { return ''; }
}
function normalize(value, catalog, prior = null) {
  if (!value || typeof value !== 'object') throw new Error('Projeto inválido.');
  const title = shorten(value.title, 100);
  const description = shorten(value.description, 1600);
  if (!title || !description) throw new Error('Título e descrição são obrigatórios.');
  if (Array.isArray(value.categories) && value.categories.some(c=>!categoryId(c,catalog))) throw new Error('Uma ou mais categorias são inválidas. Atualize o painel.');
  const ids=Array.isArray(value.categories) ? [...new Set(value.categories.map(c=>categoryId(c,catalog)).filter(Boolean))] : [];
  if (!ids.length && value.category) { const single=categoryId(value.category,catalog); if(single)ids.push(single); }
  if (!ids.length) throw new Error('Selecione ao menos uma categoria válida.');
  return {
    id: prior?.id || crypto.randomUUID(),
    title, description,
    categories:ids,
    category:catalog.find(c=>c.id===ids[0])?.label || 'Outros',
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
    const catalog=await loadCategories('projects');
    if (req.method === 'GET') {
      const saved = await store.get('projects', { type: 'json' });
      const projects = Array.isArray(saved) ? saved : showcaseProjects;
      return json({ projects:projects.map(p=>expandProject(p,catalog)) });
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
      return json({ projects:filtered.map(p=>expandProject(p,catalog)) });
    }
    const id = String(body.id || '');
    const index = projects.findIndex(p => p.id === id);
    if (id && index < 0) return json({ error: 'Projeto não encontrado.' }, 404);
    if (index < 0 && projects.length >= MAX) return json({ error: `Limite de ${MAX} projetos atingido.` }, 400);
    const clean = normalize(body, catalog, index >= 0 ? projects[index] : null);
    if (index >= 0) projects[index] = clean; else projects.unshift(clean);
    await store.setJSON('projects', projects);
    return json({ projects:projects.map(p=>expandProject(p,catalog)) });
  } catch (error) {
    if (/obrigatóri|inválid|Selecione/.test(error.message || '')) return json({ error: error.message }, 400);
    console.error('projects error:', error);
    return json({ error: 'Erro ao acessar armazenamento na Netlify.' }, 500);
  }
}
