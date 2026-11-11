import { getStore } from '@netlify/blobs';
import { showcaseProjects } from '../../public/assets/data.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';
import {loadCategories,categoryId,expandProject} from './lib/catalogs.mjs';
import {seed as defaultTechnologies} from './technologies.mjs';

const MAX = 500;
const shorten = (v, n) => String(v ?? '').trim().slice(0, n);
function safeUrl(value, image = false) {
  const v = shorten(value, 600);
  if (!v) return '';
  if (image && (/^\/.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(v) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(v))) return v;
  try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) ? v : ''; } catch { return ''; }
}
// Os vínculos são por ID. Um resumo do ícone mantém informações históricas caso a
// tecnologia seja excluída; nomes/ícones atuais prevalecem enquanto ela existir.
const snapshot = t => ({id:String(t.id),label:shorten(t.label,64),icon:shorten(t.icon,12),logoUrl:shorten(t.logoUrl,800),color:shorten(t.color,7)});
const legacyTechnologyIds = (project, technologies) => {
  if(Array.isArray(project.technologyIds))return [...new Set(project.technologyIds.filter(id=>typeof id==='string'))];
  const labels=new Set((Array.isArray(project.tags)?project.tags:[]).map(tag=>String(tag).trim().toLocaleLowerCase('pt-BR')));
  return technologies.filter(t=>labels.has(String(t.label).trim().toLocaleLowerCase('pt-BR'))).map(t=>t.id);
};
const expandWithTechnologies = (project, categories, technologies) => {
  const ids=legacyTechnologyIds(project,technologies);
  const preserved=new Map((Array.isArray(project.technologySnapshots)?project.technologySnapshots:[]).map(t=>[t.id,t]));
  const available=new Map(technologies.map(t=>[t.id,t]));
  const knownNames=new Set(technologies.map(t=>String(t.label).trim().toLocaleLowerCase('pt-BR')));
  const topics=(Array.isArray(project.tags)?project.tags:[]).filter(t=>!knownNames.has(String(t).trim().toLocaleLowerCase('pt-BR')));
  return {...expandProject(project,categories),technologyIds:ids,topics,
    technologies:ids.map(id=>available.get(id)||preserved.get(id)).filter(Boolean).map(snapshot)};
};
function normalize(value, catalog, technologies, prior = null) {
  if (!value || typeof value !== 'object') throw new Error('Projeto inválido.');
  const title = shorten(value.title, 100);
  const description = shorten(value.description, 1600);
  if (!title || !description) throw new Error('Título e descrição são obrigatórios.');
  if (Array.isArray(value.categories) && value.categories.some(c=>!categoryId(c,catalog))) throw new Error('Uma ou mais categorias são inválidas. Atualize o painel.');
  const ids=Array.isArray(value.categories) ? [...new Set(value.categories.map(c=>categoryId(c,catalog)).filter(Boolean))] : [];
  if (!ids.length && value.category) { const single=categoryId(value.category,catalog); if(single)ids.push(single); }
  if (!ids.length) throw new Error('Selecione ao menos uma categoria válida.');
  const previousIds=prior?legacyTechnologyIds(prior,technologies):[];
  const selected=value.technologyIds===undefined ? previousIds : value.technologyIds;
  if(!Array.isArray(selected) || selected.length>30 || selected.some(id=>typeof id!=='string'))throw new Error('Seleção de tecnologias inválida (máximo de 30).');
  const linkedIds=[...new Set(selected)];
  const known=new Map(technologies.map(t=>[t.id,t]));
  const previousSnapshots=new Map((Array.isArray(prior?.technologySnapshots)?prior.technologySnapshots:[]).map(t=>[t.id,t]));
  if(linkedIds.some(id=>!known.has(id) && !(previousIds.includes(id) && previousSnapshots.has(id))))throw new Error('Tecnologia não cadastrada. Atualize a lista do painel.');
  const snapshots=linkedIds.map(id=>snapshot(known.get(id)||previousSnapshots.get(id)));
  return {
    id: prior?.id || crypto.randomUUID(),
    title, description,
    categories:ids,
    category:catalog.find(c=>c.id===ids[0])?.label || 'Outros',
    image: safeUrl(value.image, true),
    repository: safeUrl(value.repository),
    demo: safeUrl(value.demo),
    tags: [...new Set(Array.isArray(value.tags) ? value.tags.map(t => shorten(t, 30)).filter(Boolean) : (prior?.tags||[]))].slice(0, 12),
    technologyIds:linkedIds,
    technologySnapshots:snapshots,
    featured: Boolean(value.featured),
    updatedAt: new Date().toISOString()
  };
}
export default async function handler(req) {
  try {
    const store = getStore('portfolio-projects');
    const catalog=await loadCategories('projects');
    const savedTechnologies=await getStore('portfolio-technologies').get('technologies',{type:'json'});
    const technologies=Array.isArray(savedTechnologies)?savedTechnologies:defaultTechnologies;
    if (req.method === 'GET') {
      const saved = await store.get('projects', { type: 'json' });
      const projects = Array.isArray(saved) ? saved : showcaseProjects;
      return json({ projects:projects.map(p=>expandWithTechnologies(p,catalog,technologies)) });
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
      return json({ projects:filtered.map(p=>expandWithTechnologies(p,catalog,technologies)) });
    }
    const id = String(body.id || '');
    const index = projects.findIndex(p => p.id === id);
    if (id && index < 0) return json({ error: 'Projeto não encontrado.' }, 404);
    if (index < 0 && projects.length >= MAX) return json({ error: `Limite de ${MAX} projetos atingido.` }, 400);
    const clean = normalize(body, catalog, technologies, index >= 0 ? projects[index] : null);
    if (index >= 0) projects[index] = clean; else projects.unshift(clean);
    await store.setJSON('projects', projects);
    return json({ projects:projects.map(p=>expandWithTechnologies(p,catalog,technologies)) });
  } catch (error) {
    if (/obrigatóri|inválid|Selecione|Tecnologia não cadastrada/.test(error.message || '')) return json({ error: error.message }, 400);
    console.error('projects error:', error);
    return json({ error: 'Erro ao acessar armazenamento na Netlify.' }, 500);
  }
}
