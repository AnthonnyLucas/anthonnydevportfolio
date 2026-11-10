import { showcaseProjects } from './data.js';
import { setupCertificates } from './cert-carousel.js';
import { setupTechCarousel } from './tech-carousel.js';

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];
const el = (tag, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

// Tema persistente (somente preferências visuais, nunca credenciais).
const savedTheme = localStorage.getItem('portfolio-theme');
const preferred = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
document.documentElement.dataset.theme = ['dark', 'light'].includes(savedTheme) ? savedTheme : preferred;
qs('#theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('portfolio-theme', theme);
});
qs('#year').textContent = new Date().getFullYear();

// Scroll e navegação ativa sem eventos pesados.
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  qs('#scroll-progress').style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
const observer = new IntersectionObserver(entries => {
  for (const item of entries) if (item.isIntersecting) {
    item.target.classList.add('visible');
    observer.unobserve(item.target);
  }
}, { threshold: .12 });
qsa('.reveal').forEach(node => observer.observe(node));
const sections = qsa('.section-anchor');
const navObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (!visible.length) return;
  qsa('.nav-link').forEach(link => {
    const active = link.dataset.section === visible[0].target.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });
sections.forEach(section => navObserver.observe(section));

setupTechCarousel();

setupCertificates();

const projectsGrid = qs('#project-grid');
let currentProjects = [];
let projectFilter = 'Todos';
const safeUrl = (s, image = false) => {
  if (typeof s !== 'string' || !s) return '';
  if (image && (/^\/.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(s) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(s))) return s;
  try {const url = new URL(s);return ['http:', 'https:'].includes(url.protocol) ? url.href : '';} catch{return '';}
};
function renderProjects() {
  const filtered = currentProjects.filter(p => projectFilter === 'Todos' || p.category === projectFilter);
  projectsGrid.replaceChildren();
  if (!filtered.length) {
    const empty = el('div','project-empty');
    empty.append(el('span','empty-symbol', projectFilter === 'Todos' ? '⌘' : '◎'));
    empty.append(el('h3','',projectFilter === 'Todos' ? 'Novos projetos a caminho.' : 'Nenhum projeto nesta categoria.'));
    const p = el('p','',projectFilter === 'Todos' ? 'Estou organizando cases, imagens e demonstrações dos meus trabalhos. Enquanto isso, vamos conversar sobre o próximo desafio?' : 'Explore outra categoria para conhecer mais projetos.');
    empty.append(p);
    if (projectFilter === 'Todos') {const a = el('a','', 'Entrar em contato ↗');a.href='#contato';const span=el('p');span.append(a);empty.append(span);}
    projectsGrid.append(empty); return;
  }
  filtered.sort((a,b) => Number(b.featured)-Number(a.featured));
  filtered.forEach((project, i) => {
    const card = el('article','project-card');
    const visual = el('div','project-visual');
    const url = safeUrl(project.image, true);
    if (url) { const img = el('img'); img.src=url; img.alt=`Ilustração conceitual: ${project.title}`;img.loading='lazy';visual.append(img); }
    else visual.append(el('span','project-glyph','</>'));
    visual.append(el('span','project-index',String(i + 1).padStart(2,'0')));
    const body=el('div','project-body');
    body.append(el('span','project-category',project.category || 'Projeto'),el('h3','',project.title),el('p','',project.description));
    const tags=el('div','project-tags');
    (Array.isArray(project.tags)?project.tags:[]).forEach(tag=>tags.append(el('span','',tag)));
    body.append(tags);
    const links=el('div','project-links');
    for (const [key,label] of [['repository','Código ↗'],['demo','Visualizar ↗']]) {
      const href=safeUrl(project[key]);if (!href) continue;
      const link=el('a','',label);link.href=href;link.target='_blank';link.rel='noopener noreferrer';links.append(link);
    }
    if (links.childNodes.length) body.append(links);
    card.append(visual,body);
    projectsGrid.append(card);
  });
}
async function loadProjects() {
  try {
    const res = await fetch('/.netlify/functions/projects', { cache:'no-store' });
    if (!res.ok) throw new Error('Sem API');
    const body = await res.json();
    currentProjects = Array.isArray(body.projects) ? body.projects : showcaseProjects;
  } catch {
    // A prévia HTML abre sem as funções; os projetos reais só estarão disponíveis no Netlify Dev ou deploy.
    currentProjects = showcaseProjects;
  }
  renderProjects();
}
qsa('[data-project-filter]').forEach(btn => btn.addEventListener('click', () => {
  projectFilter = btn.dataset.projectFilter;
  qsa('[data-project-filter]').forEach(peer => {peer.classList.toggle('active',peer===btn);peer.setAttribute('aria-pressed',String(peer===btn));});
  renderProjects();
}));
loadProjects();
