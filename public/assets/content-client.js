import { contentDefaults, contentFields } from './site-schema.js';
const validKeys = new Set(contentFields.map(item=>item.key));
export function applyContent(content = contentDefaults, root = document) {
  const values = {...contentDefaults, ...Object.fromEntries(Object.entries(content).filter(([key,value])=>validKeys.has(key) && typeof value==='string'))};
  root.querySelectorAll('[data-content-key]').forEach(node=>{
    const key=node.dataset.contentKey;
    if (key in values) node.textContent = values[key];
  });
  root.querySelectorAll('[data-placeholder-key]').forEach(node=>{
    const value=values[node.dataset.placeholderKey];
    if (typeof value==='string') node.placeholder=value;
  });
  root.querySelectorAll('[data-url-key]').forEach(node=>{
    const url=values[node.dataset.urlKey];
    if (typeof url==='string' && url.startsWith('https://')) node.href=url;
  });
  const contact = root.querySelector('#public-contact-email');
  if (contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) contact.href=`mailto:${values.contactEmail}`;
  const portrait = values.aboutImage;
  if (portrait && (/^https:\/\//i.test(portrait) || /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(portrait))) {
    root.querySelectorAll('[data-portrait]').forEach(img => {
      img.onerror=()=>{img.onerror=null;img.src='/assets/portrait-placeholder.svg';};
      img.src=portrait;
    });
  }
  const panel=root.querySelector('.portrait-panel');
  if (panel) panel.style.setProperty('--portrait-position',`${Math.min(100,Math.max(0,Number(values.aboutImagePosition)||0))}%`);
  if (root === document) {
    document.title=values.metaTitle||contentDefaults.metaTitle;
    const meta=root.querySelector('meta[name="description"]');
    if (meta) meta.content=values.metaDescription;
    const og=root.querySelector('meta[property="og:description"]');
    if (og) og.content=values.metaDescription;
  }
}
export async function loadSiteContent() {
  applyContent(contentDefaults);
  try {
    const response=await fetch('/.netlify/functions/content',{cache:'no-store'});
    if (!response.ok || !(response.headers.get('content-type')||'').includes('application/json')) return;
    const data=await response.json();
    if (data?.content) applyContent(data.content);
  } catch { /* Prévia estática: usar o conteúdo original do HTML. */ }
}
