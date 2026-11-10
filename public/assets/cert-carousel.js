import { certificates, certificateCategories } from './data.js';
const $ = s => document.querySelector(s);
const create = (tag, className = '', content = '') => {
  const node = document.createElement(tag);
  node.className = className;
  if (content) node.textContent = content;
  return node;
};
const safeImage = value => {
  if (typeof value !== 'string') return '';
  if (/^\/assets\/certificates\/[a-z0-9-]+\.webp$/.test(value) ||
      /^\/\.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(png|jpg|webp|gif)$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};

export function setupCertificates() {
  const track = $('#cert-grid');
  const viewport = $('#cert-viewport');
  const categoryBar = $('#cert-filters');
  const previous = $('#cert-prev');
  const next = $('#cert-next');
  const counter = $('#cert-counter');
  const live = $('#cert-live');
  const dialog = $('#cert-dialog');
  const dialogImage = $('#cert-dialog-image');
  const dialogTitle = $('#cert-dialog-title');
  if (!track || !viewport || !categoryBar) return;

  let all = certificates;
  let selection = [...all];
  let index = 0;
  let gesture = null;
  let settling = false;
  const visibleCount = () => matchMedia('(max-width: 740px)').matches ? 1 : 2;
  const maxIndex = () => Math.max(0, selection.length - visibleCount());
  const offsetFor = i => {
    const first = track.children[0];
    const chosen = track.children[i];
    return first && chosen ? chosen.offsetLeft - first.offsetLeft : 0;
  };
  function announce() {
    const limit = Math.min(selection.length, index + visibleCount());
    counter.textContent = `${String(index + 1).padStart(2, '0')}–${String(limit).padStart(2, '0')} / ${String(selection.length).padStart(2, '0')}`;
    live.textContent = `${index + 1} a ${limit} de ${selection.length}: ${selection.slice(index, limit).map(c => c.name).join(' e ')}`;
    [...track.children].forEach((card, i) => {
      const visible = i >= index && i < limit;
      card.classList.toggle('is-visible', visible);
      const previewButton = card.querySelector('.cert-view');
      if (previewButton) previewButton.tabIndex = visible ? 0 : -1;
    });
  }
  function move(to, behavior = 'smooth') {
    if (!selection.length) return;
    index = to < 0 ? maxIndex() : to > maxIndex() ? 0 : to;
    settling = true;
    viewport.scrollTo({ left: offsetFor(index), behavior });
    announce();
    setTimeout(() => { settling = false; }, behavior === 'smooth' ? 420 : 0);
  }
  function render() {
    track.replaceChildren();
    selection.forEach((course, i) => {
      const card = create('article', 'cert-card');
      const visual = create('div', 'cert-visual');
      const picture = safeImage(course.image);
      if (picture) {
        const img = create('img', 'cert-photo');
        img.src = picture; img.loading = 'lazy';
        img.alt = `Miniatura do certificado: ${course.name}`;
        img.addEventListener('error', () => {
          img.remove();
          visual.classList.add('cert-no-image');
          visual.append(create('span', 'cert-abstract', '◈'), create('span', 'cert-placeholder-caption', 'Imagem disponível no painel'));
        }, { once: true });
        visual.append(img);
        const view = create('button', 'cert-view', 'Ampliar imagem ↗');
        view.type = 'button';
        view.setAttribute('aria-label', `Ampliar imagem de ${course.name}`);
        view.addEventListener('click', () => {
          if (typeof dialog.showModal !== 'function') { window.open(picture, '_blank', 'noopener'); return; }
          dialogImage.src = picture;
          dialogImage.alt = `Certificado de ${course.name}`;
          dialogTitle.textContent = course.name;
          dialog.showModal();
        });
        visual.append(view);
      } else {
        visual.classList.add('cert-no-image');
        const mark = create('span', 'cert-abstract', '◈');
        mark.setAttribute('aria-hidden', 'true');
        visual.append(mark, create('span', 'cert-placeholder-caption', 'Imagem a adicionar'));
      }
      const content = create('div', 'cert-content');
      const topline = create('div', 'cert-topline');
      topline.append(create('span', 'cert-category-label', course.group), create('span', 'cert-number', String(i + 1).padStart(2,'0')));
      const name = create('h3', '', course.name);
      const description = create('p', 'cert-description', course.description || 'Informações sobre a formação e os conhecimentos abordados.');
      const bottom = create('div', 'cert-bottom');
      bottom.append(create('span', 'cert-provider', course.org), create('span', 'cert-hours', course.hours));
      content.append(topline, name, description, bottom, create('span', 'cert-kind', course.type));
      card.append(visual, content);
      track.append(card);
    });
    if (!selection.length) track.append(create('p', 'cert-empty', 'Nenhuma formação nesta categoria.'));
    index = 0;
    viewport.scrollLeft = 0;
    announce();
    previous.disabled = next.disabled = selection.length <= visibleCount();
  }
  certificateCategories.forEach(category => {
    const button = create('button', 'filter-chip', category);
    button.type = 'button';
    button.dataset.category = category;
    const active = category === 'Todas';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.addEventListener('click', () => {
      [...categoryBar.children].forEach(sibling => {
        const selected = sibling === button;
        sibling.classList.toggle('active', selected);
        sibling.setAttribute('aria-pressed', String(selected));
      });
      selection = all.filter(item => category === 'Todas' || item.group === category);
      render();
    });
    categoryBar.append(button);
  });
  previous.addEventListener('click', () => move(index - 1));
  next.addEventListener('click', () => move(index + 1));
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(index - 1); }
    if (event.key === 'Home') { event.preventDefault(); move(0); }
    if (event.key === 'End') { event.preventDefault(); move(maxIndex()); }
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    gesture = { x: event.clientX, scroll: viewport.scrollLeft };
    viewport.classList.add('is-grabbing');
  });
  viewport.addEventListener('pointermove', event => {
    if (!gesture) return;
    if (Math.abs(event.clientX - gesture.x) > 4) {
      viewport.scrollLeft = gesture.scroll + gesture.x - event.clientX;
    }
  });
  const finish = () => {
    if (!gesture) return;
    const distance = Math.abs(viewport.scrollLeft - gesture.scroll);
    gesture = null;
    viewport.classList.remove('is-grabbing');
    if (distance > 5) {
      index = Math.max(0, Math.min(maxIndex(), [...track.children].reduce((best, card, i) =>
        Math.abs(offsetFor(i) - viewport.scrollLeft) < Math.abs(offsetFor(best) - viewport.scrollLeft) ? i : best, 0)));
      move(index);
    }
  };
  viewport.addEventListener('pointerup', finish);
  viewport.addEventListener('pointercancel', finish);
  viewport.addEventListener('pointerleave', finish);
  viewport.addEventListener('dragstart', e => e.preventDefault());
  let scrollScheduled = false;
  viewport.addEventListener('scroll', () => {
    if (settling || gesture || scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      let closest = 0;
      for (let i = 0; i <= maxIndex(); i++) {
        if (Math.abs(offsetFor(i)-viewport.scrollLeft) < Math.abs(offsetFor(closest)-viewport.scrollLeft)) closest = i;
      }
      if (closest !== index) { index = closest; announce(); }
    });
  }, {passive:true});
  window.addEventListener('resize', () => move(Math.min(index,maxIndex()), 'instant'));
  $('#cert-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { dialogImage.removeAttribute('src'); });
  async function load() {
    try {
      const response = await fetch('/.netlify/functions/certificates', {cache:'no-store'});
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('API indisponível');
      const data = await response.json();
      if (Array.isArray(data.certificates)) all = data.certificates;
    } catch { /* Pré-visualização estática: mantém o catálogo inicial. */ }
    selection = [...all];
    render();
  }
  load();
}
