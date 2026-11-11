import { contentDefaults, contentFields } from './site-schema.js';
const validKeys = new Set(contentFields.map(item=>item.key));
// Normaliza links permitidos; nunca aceita javascript:, redirecionamentos arbitrários ou URLs com credenciais.
const CONTACT_EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const LEGACY_MAIL = 'mailto:anthonny6613@gmail.com';
function getMailHref(configured, contactEmail) {
  const raw = String(configured || '').trim();
  const value = (!raw || raw === LEGACY_MAIL) ? contentDefaults.gmailUrl : raw;
  if (CONTACT_EMAIL_PATTERN.test(value)) return `mailto:${value}`;
  if (/^mailto:/i.test(value) && CONTACT_EMAIL_PATTERN.test(value.slice(7))) return `mailto:${value.slice(7)}`;
  try {
    const link = new URL(value);
    if (link.protocol==='https:' && link.hostname.toLowerCase()==='mail.google.com' && link.pathname.startsWith('/mail') && CONTACT_EMAIL_PATTERN.test(link.searchParams.get('to') || '') && !link.username && !link.password) return link.href;
  } catch { /* Sem URL de composição válida. */ }
  return CONTACT_EMAIL_PATTERN.test(contactEmail) ? `mailto:${contactEmail}` : '';
}
function getWhatsAppHref(configured) {
  // As migrações de registros antigos são feitas pela API; em v5.8, apagar o campo desativa o link.
  const raw = String(configured ?? contentDefaults.whatsappUrl).trim();
  try {
    const link = new URL(raw);
    if (link.protocol!=='https:' || link.username || link.password) return '';
    const host=link.hostname.toLowerCase();
    if (host==='wa.me' && /^\/\d{10,15}\/?$/.test(link.pathname)) return link.href;
    if (['api.whatsapp.com','web.whatsapp.com'].includes(host) && link.pathname.startsWith('/send') && /^\d{10,15}$/.test(link.searchParams.get('phone') || '')) return link.href;
  } catch { /* Link inválido ou não cadastrado. */ }
  return '';
}
function bindContactLink(node, href, label, newTab=true) {
  if (!node) return;
  node.classList.toggle('sidebar-social-icon-pending', !href && node.classList.contains('sidebar-social-icon'));
  if (href) {
    node.href=href;
    node.removeAttribute('aria-disabled');
    node.setAttribute('aria-label',label);
    if (newTab && href.startsWith('https://')) {node.target='_blank';node.rel='noopener noreferrer';}
    else {node.removeAttribute('target');node.removeAttribute('rel');}
    node.removeAttribute('tabindex');
  } else {
    node.removeAttribute('href');node.removeAttribute('target');node.removeAttribute('rel');
    node.setAttribute('aria-disabled','true');node.setAttribute('tabindex','-1');
  }
}

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
  // Todos os atalhos de contato utilizam os mesmos campos editáveis do CMS.
  const gmailHref=getMailHref(values.gmailUrl,values.contactEmail);
  const whatsappHref=getWhatsAppHref(values.whatsappUrl);
  bindContactLink(root.querySelector('#sidebar-gmail'),gmailHref,'Enviar mensagem por e-mail');
  bindContactLink(root.querySelector('#public-contact-email'),gmailHref,'E-mail: abrir composição de mensagem');
  bindContactLink(root.querySelector('#sidebar-whatsapp'),whatsappHref,'Conversar pelo WhatsApp');
  bindContactLink(root.querySelector('#public-contact-whatsapp'),whatsappHref,'WhatsApp: iniciar conversa');
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
