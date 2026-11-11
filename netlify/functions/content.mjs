import { getStore } from '@netlify/blobs';
import { contentDefaults, contentFields } from '../../public/assets/site-schema.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';
const schema = new Map(contentFields.map(item => [item.key, item]));
const CONTACT_SCHEMA_VERSION = 8;
function upgradeLegacyContacts(values, saved) {
  if (Number(saved?.schemaVersion || 0) >= CONTACT_SCHEMA_VERSION) return values;
  // Antes de v5.8: Gmail padrão mailto e WhatsApp sem configuração.
  if (!values.gmailUrl || values.gmailUrl === 'mailto:anthonny6613@gmail.com') values.gmailUrl = contentDefaults.gmailUrl;
  if (!values.whatsappUrl) values.whatsappUrl = contentDefaults.whatsappUrl;
  return values;
}
export function sanitizeContent(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('Conteúdo inválido.');
  const output = {};
  for (const [key, value] of Object.entries(patch)) {
    const spec = schema.get(key);
    if (!spec || typeof value !== 'string') throw new Error(`Campo não permitido: ${key.slice(0,60)}`);
    const clean = value.trim();
    if (clean.length > spec.max) throw new Error(`O campo ${spec.label} excedeu ${spec.max} caracteres.`);
    if (spec.type === 'url' || spec.type === 'image') {
      if (clean && !(/^https:\/\/[^\s]+$/i.test(clean) || (spec.type === 'image' && /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(clean)))) throw new Error(`Endereço inválido em ${spec.label}.`);
      if (clean.startsWith('https://')) {
        try {const u = new URL(clean);if (!u.hostname || u.username || u.password) throw new Error('URL inválida');}
        catch {throw new Error(`Endereço inválido em ${spec.label}.`);}
      }
    }
    if (spec.type === 'pdf' && clean) {
      const local = /^\/assets\/cv\/[a-z0-9_-]+\.pdf$/i.test(clean);
      const uploaded = /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.pdf$/i.test(clean);
      let remote=false;
      try {const link=new URL(clean);remote=link.protocol==='https:' && Boolean(link.hostname) && !link.username && !link.password;}catch{}
      if(!local && !uploaded && !remote)throw new Error(`Link de currículo inválido em ${spec.label}.`);
    }
    if (spec.type === 'gmailLink' && clean) {
      const validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clean);
      const validMailto = /^mailto:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clean);
      let validCompose = false;
      try {
        const link = new URL(clean);
        validCompose = link.protocol === 'https:' && link.hostname.toLowerCase() === 'mail.google.com' && link.pathname.startsWith('/mail') && Boolean(link.searchParams.get('to')) && !link.username && !link.password;
      } catch { /* Link em branco ou formato mailto. */ }
      if (!validEmail && !validMailto && !validCompose) throw new Error('Link do Gmail inválido. Informe um e-mail, mailto: ou link de composição do Gmail.');
    }
    if (spec.type === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254)) throw new Error('E-mail de contato inválido.');
    if (spec.type === 'range' && (!/^\d{1,3}$/.test(clean) || Number(clean) > 100)) throw new Error('Enquadramento deve estar entre 0 e 100.');
    output[key] = clean;
  }
  return output;
}
export default async function handler(req) {
  try {
    if (req.method !== 'GET' && req.method !== 'PATCH') return json({error:'Método não permitido.'},405,{Allow:'GET, PATCH'});
    if (req.method === 'PATCH' && !validSession(req)) return authError();
    if (req.method === 'PATCH' && !sameOrigin(req)) return json({error:'Origem não autorizada.'},403);
    const store = getStore('portfolio-site-content');
    const saved = await store.get('current', {type:'json'});
    const current = upgradeLegacyContacts({ ...contentDefaults, ...(saved?.values && typeof saved.values === 'object' ? sanitizeContent(saved.values) : {}) }, saved);
    const revision = Number.isSafeInteger(saved?.revision) ? saved.revision : 0;
    if (req.method === 'GET') return json({content:current,revision});
    const data = await req.json().catch(() => null);
    if (!data || typeof data !== 'object') return json({error:'Dados inválidos.'},400);
    if (data.revision !== revision) return json({error:'O conteúdo mudou desde que o painel foi aberto. Recarregue o painel para evitar sobrescrever mudanças.'},409);
    const updates = sanitizeContent(data.patch);
    if (!Object.keys(updates).length) return json({error:'Nenhum campo enviado.'},400);
    const next = { ...current, ...updates };
    await store.setJSON('current',{values:next,revision:revision+1,schemaVersion:CONTACT_SCHEMA_VERSION,updatedAt:new Date().toISOString()});
    return json({content:next,revision:revision+1});
  } catch (error) {
    if (/inválid|não permitido|excedeu|Enquadramento/i.test(error.message||'')) return json({error:error.message},400);
    console.error('content error',error);
    return json({error:'Não foi possível acessar o conteúdo. Confira o armazenamento Netlify Blobs.'},500);
  }
}
