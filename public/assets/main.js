import { setupProjects } from './project-carousel.js?v=5.15.0';
import { setupCertificates } from './cert-carousel.js';
import { setupTechCarousel } from './tech-carousel.js';
import { loadSiteContent } from './content-client.js';
import { initTheme } from './theme-controls.js';
import { initParticles } from './particles.js';

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];
const el = (tag, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

// O mesmo gerenciador de temas atende ao site público e ao painel administrativo.
initTheme();
initParticles();
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

const techCarousel = setupTechCarousel();
async function loadTechnologies() {
  // As categorias são independentes; se uma função estiver indisponível,
  // a vitrine original ainda funciona sem esconder os cartões existentes.
  const jobs=await Promise.allSettled([
    fetch('/.netlify/functions/technologies',{cache:'no-store'}),
    fetch('/.netlify/functions/categories?kind=technologies',{cache:'no-store'})
  ]);
  try {
    if(jobs[0].status==='fulfilled' && jobs[0].value.ok && (jobs[0].value.headers.get('content-type')||'').includes('application/json')){
      const data=await jobs[0].value.json();
      if(Array.isArray(data.technologies))techCarousel?.setSkills(data.technologies);
    }
  }catch { /* Fallback estático preservado. */ }
  try {
    if(jobs[1].status==='fulfilled' && jobs[1].value.ok && (jobs[1].value.headers.get('content-type')||'').includes('application/json')){
      const data=await jobs[1].value.json();
      if(Array.isArray(data.categories))techCarousel?.setCategories(data.categories);
    }
  }catch { /* Filtros originais preservados. */ }
}
loadTechnologies();
loadSiteContent();

setupCertificates();

setupProjects();
