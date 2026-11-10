import { skills } from './data.js';

// Original logos are requested from Devicon at runtime; every brand has a bundled SVG fallback.
// If a CDN cannot be reached, the local vector remains visible and accessible.
const brandMarks = {
  'Java':['java/java-original.svg','#E76F37'],
  'Python':['python/python-original.svg','#3676AB'],
  'C':['c/c-original.svg','#5B7FBD'],
  'C++':['cplusplus/cplusplus-original.svg','#649AD6'],
  'C#':['csharp/csharp-original.svg','#AA83D8'],
  'JavaScript':['javascript/javascript-original.svg','#F2D34D'],
  'PHP':['php/php-original.svg','#8E8CBB'],
  'Ruby':['ruby/ruby-original.svg','#E96A76'],
  'HTML & CSS':['html5/html5-original.svg','#ED7D58'],
  'React':['react/react-original.svg','#61DAFB'],
  'Angular':['angular/angular-original.svg','#EF637A'],
  'Node.js':['nodejs/nodejs-original.svg','#7CCB7D'],
  'Spring Boot':['spring/spring-original.svg','#84D67C'],
  'Django':['django/django-plain.svg','#4EBF9A'],
  'Docker':['docker/docker-original.svg','#49B7ED'],
  'Kubernetes':['kubernetes/kubernetes-original.svg','#638FEE'],
  'Git':['git/git-original.svg','#FA7759'],
  'DevOps':['azuredevops/azuredevops-original.svg','#5FCBD6'],
  'Cloud':['googlecloud/googlecloud-original.svg','#7AA2F2'],
  'MQTT':['mqtt/mqtt-original.svg','#A38AFF'],
  'LoRa':[null,'#7CD9D1'],
  'LoRaWAN':[null,'#7CD9D1'],
  'MySQL':['mysql/mysql-original.svg','#76C3DE'],
  'SQL Server':['microsoftsqlserver/microsoftsqlserver-plain.svg','#EC7A86'],
  'Power BI':[null,'#ECD465']
};
const cats = {linguagens:'LINGUAGENS',frameworks:'FRAMEWORKS',infra:'INFRA & DEVOPS',iot:'IOT & DADOS'};
const digits = n => String(n).padStart(2, '0');

export function setupTechCarousel() {
  const stage = document.querySelector('#tech-carousel');
  const track = document.querySelector('#tech-carousel-track');
  const previous = document.querySelector('#tech-prev');
  const next = document.querySelector('#tech-next');
  const currentLabel = document.querySelector('#tech-current');
  const totalLabel = document.querySelector('#tech-total');
  const progress = document.querySelector('#tech-progress-fill');
  const live = document.querySelector('#tech-live');
  if (!stage || !track || !previous || !next) return;

  let sourceSkills = [...skills];
  let filteredSkills = [...sourceSkills];
  let selectedFilter = 'all';
  let cards = [];
  let active = 0;
  let pointer = null;
  let gestureConsumed = false;

  const distance = (i, current, length) => {
    let d = (i-current+length)%length;
    if (d > length/2) d -= length;
    return d;
  };
  const visibleWindow = () => Math.min(2, Math.floor((filteredSkills.length-1)/2));

  function update(announce = true) {
    const n = filteredSkills.length;
    const windowSize = visibleWindow();
    previous.disabled = next.disabled = n <= 1;
    cards.forEach((card, i) => {
      const d = distance(i, active, n);
      const visible = Math.abs(d) <= windowSize;
      card.dataset.position = visible ? String(d) : 'off';
      card.setAttribute('aria-hidden', String(!visible));
      card.setAttribute('aria-current', String(d === 0));
      card.tabIndex = visible ? 0 : -1;
      card.style.pointerEvents = visible ? 'auto' : 'none';
    });
    currentLabel.textContent = n ? digits(active+1) : '00';
    totalLabel.textContent = digits(n);
    progress.style.width = `${n ? ((active+1)/n)*100 : 0}%`;
    const selected = filteredSkills[active];
    if (announce && selected) live.textContent = `${selected.label}, ${cats[selected.cat]}, ${active+1} de ${n}`;
  }

  function jumpTo(index, announce=true) {
    if (!filteredSkills.length) return;
    const n = filteredSkills.length;
    active = (index+n) % n;
    update(announce);
  }

  function logoFor(skill) {
    const wrap=document.createElement('span');
    wrap.className='tech-logo-wrap';
    const mark=brandMarks[skill.label];
    const external = typeof skill.logoUrl === 'string' && (skill.logoUrl.startsWith('https://') || /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(skill.logoUrl)) ? skill.logoUrl : '';
    const slug = {'C++':'cpp','C#':'csharp'}[skill.label] || skill.label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const fallback = `/assets/tech-logos/${slug}.svg`;
    if (!external && !mark) {
      const glyph=document.createElement('span');
      glyph.className='tech-logo-glyph';
      glyph.textContent=String(skill.icon || skill.label.slice(0,2)).slice(0,12);
      wrap.append(glyph);
      return wrap;
    }
    const img=document.createElement('img');
    img.className='tech-logo';img.alt='';img.decoding='async';img.draggable=false;
    if (external) {
      img.src=external;
      img.addEventListener('error',()=>{const glyph=document.createElement('span');glyph.className='tech-logo-glyph';glyph.textContent=String(skill.icon||skill.label.slice(0,2)).slice(0,12);img.replaceWith(glyph);},{once:true});
    } else if(mark?.[0]) {
      img.src=`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${mark[0]}`;
      img.addEventListener('error',()=>{img.src=fallback;img.addEventListener('error',()=>{const glyph=document.createElement('span');glyph.className='tech-logo-glyph';glyph.textContent=String(skill.icon||skill.label.slice(0,2)).slice(0,12);img.replaceWith(glyph);},{once:true});},{once:true});
    } else img.src=fallback;
    wrap.append(img);return wrap;
  }

  function render() {
    track.replaceChildren();
    cards = filteredSkills.map((skill, i) => {
      const card = document.createElement('button');
      card.className = 'tech-slide';
      card.type='button';
      const mark = brandMarks[skill.label];
      const color = /^#[0-9a-f]{6}$/i.test(skill.color||'') ? skill.color : (mark?.[1] || '#B7FF79');
      card.style.setProperty('--brand', color);
      card.setAttribute('aria-label', `${skill.label}, ${cats[skill.cat] || 'TECNOLOGIAS'}. Exibir em destaque`);
      const top = document.createElement('span');
      top.className = 'tech-slide-top';
      const category = document.createElement('span');
      category.textContent = cats[skill.cat] || 'TECNOLOGIAS';
      const index = document.createElement('span');
      index.textContent = digits(i+1);
      top.append(category, index);
      const centerpiece = document.createElement('span');
      centerpiece.className = 'tech-slide-center';
      centerpiece.append(logoFor(skill));
      const title = document.createElement('span');
      title.className = 'tech-slide-title';
      title.textContent = skill.label;
      const footer = document.createElement('span');
      footer.className = 'tech-slide-footer';
      footer.textContent = 'TECH STACK';
      card.append(top,centerpiece,title,footer);
      card.addEventListener('click', () => {
        if (gestureConsumed) return;
        jumpTo(i);
      });
      track.append(card);
      return card;
    });
    update(false);
    live.textContent = filteredSkills.length ? `${filteredSkills[0].label}. 1 de ${filteredSkills.length} tecnologias` : 'Sem tecnologias nesta categoria';
  }

  previous.addEventListener('click', () => jumpTo(active-1));
  next.addEventListener('click', () => jumpTo(active+1));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); jumpTo(active+1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); jumpTo(active-1); }
    if (e.key === 'Home') {e.preventDefault(); jumpTo(0);}
    if (e.key === 'End') {e.preventDefault(); jumpTo(filteredSkills.length-1);}
  });

  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointer = {id:e.pointerId,x:e.clientX,y:e.clientY};
    gestureConsumed=false;
    if (e.pointerType === 'mouse') stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointerup', e => {
    if (!pointer || pointer.id !== e.pointerId) return;
    const dx=e.clientX-pointer.x;
    const dy=e.clientY-pointer.y;
    pointer=null;
    if (Math.abs(dx)>38 && Math.abs(dx)>Math.abs(dy)*1.15) {
      gestureConsumed=true;
      jumpTo(active+(dx<0?1:-1));
      // A pointer gesture may produce a click: suppress it in the capturing listener below.
    }
  });
  stage.addEventListener('click', event => {
    if (!gestureConsumed) return;
    event.preventDefault();
    event.stopPropagation();
    gestureConsumed = false;
  }, true);
  stage.addEventListener('pointercancel',()=>{pointer=null;gestureConsumed=false;});
  stage.addEventListener('dragstart',e=>e.preventDefault());
  // Keep the currently filtered selection when possible; a new category starts with its first card.
  document.querySelectorAll('[data-stack]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.stack;
    selectedFilter = filter;
    document.querySelectorAll('[data-stack]').forEach(peer => {
      const selected = peer === button;
      peer.classList.toggle('active', selected);
      peer.setAttribute('aria-pressed', String(selected));
    });
    filteredSkills = sourceSkills.filter(item => filter==='all' || item.cat===filter);
    active=0;
    render();
  }));
  render();
  return {
    setSkills(nextSkills) {
      if (!Array.isArray(nextSkills)) return;
      sourceSkills=nextSkills.filter(item=>item && typeof item.label==='string' && typeof item.cat==='string');
      filteredSkills=sourceSkills.filter(item=>selectedFilter==='all' || item.cat===selectedFilter);
      active=0;
      render();
    }
  };
}
