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
  const brandImage=root.querySelector('#sidebar-brand-icon');
  const brandGlyph=root.querySelector('#sidebar-brand-glyph');
  const iconUrl=values.sidebarBrandImage;
  if (brandImage) {
    const valid=typeof iconUrl==='string' && (/^https:\/\//.test(iconUrl) || /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(iconUrl));
    brandImage.hidden=!valid;
    if(valid){brandImage.src=iconUrl;brandImage.onerror=()=>{brandImage.hidden=true;if(brandGlyph)brandGlyph.hidden=false;};}
    if(brandGlyph)brandGlyph.hidden=valid;
  }
  const customs=root.querySelector('#sidebar-custom-links');
  if(customs){customs.replaceChildren();for(let n=1;n<=3;n++){
    const title=values[`sidebarExtra${n}Name`],url=values[`sidebarExtra${n}Url`];
    if(!title || !url?.startsWith('https://'))continue;
    const link=root.createElement('a');link.href=url;link.textContent=title;
    link.target='_blank';link.rel='noopener noreferrer';customs.append(link);
  }}
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
