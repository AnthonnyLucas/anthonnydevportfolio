import {showcaseProjects} from './data.js';
const $=s=>document.querySelector(s);
const el=(tag,cls='',value='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n;};
const safeUrl=(s,image=false)=>{
  if(typeof s!=='string' || !s)return '';
  if(image && (/^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(s) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(s)))return s;
  try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}
};
export function setupProjects(){
  const viewport=$('#project-viewport'),track=$('#project-grid'),bar=$('#project-filters');
  const prev=$('#project-prev'),next=$('#project-next'),live=$('#project-live'),counter=$('#project-counter');
  if(!viewport||!track||!bar)return;
  let list=[...showcaseProjects],categories=[],filter='all',selection=[],index=0,drag=null,settling=false;
  const visibleCount=()=>matchMedia('(max-width:740px)').matches?1:2;
  const maxIndex=()=>Math.max(0,selection.length-visibleCount());
  const offset=i=>track.children[i] ? track.children[i].offsetLeft-track.children[0].offsetLeft:0;
  function update(){
    const first=selection.length?index+1:0,last=Math.min(selection.length,index+visibleCount());
    counter.textContent=`${String(first).padStart(2,'0')}–${String(last).padStart(2,'0')} / ${String(selection.length).padStart(2,'0')}`;
    prev.disabled=next.disabled=selection.length<=visibleCount();
    live.textContent=selection.length ? `Projetos ${first} a ${last} de ${selection.length}: ${selection.slice(index,last).map(p=>p.title).join(', ')}` : 'Nenhum projeto encontrado';
    [...track.children].forEach((card,i)=>{if(!card.classList.contains('project-card'))return;card.classList.toggle('is-visible',i>=index && i<index+visibleCount());card.querySelectorAll('a').forEach(link=>link.tabIndex=i>=index&&i<index+visibleCount()?0:-1);});
  }
  function move(to,behavior='smooth'){
    if(!selection.length){update();return;}
    index=Math.max(0,Math.min(maxIndex(),to));
    settling=true;viewport.scrollTo({left:offset(index),behavior});update();
    setTimeout(()=>{settling=false;},behavior==='smooth'?430:0);
  }
  function renderCards(){
    track.replaceChildren();
    if(!selection.length){const box=el('div','project-empty');box.append(el('h3','',filter==='all'?'Novos projetos a caminho.':'Nenhum projeto nesta categoria.'),el('p','','Selecione outra categoria para explorar os projetos.'));track.append(box);index=0;update();return;}
    selection.forEach((project,i)=>{
      const card=el('article','project-card');
      const visual=el('div','project-visual');const url=safeUrl(project.image,true);
      if(url){const img=el('img');img.src=url;img.loading='lazy';img.alt=`Imagem do projeto ${project.title}`;visual.append(img);}
      else visual.append(el('span','project-glyph','</>'));
      visual.append(el('span','project-index',String(i+1).padStart(2,'0')));
      const body=el('div','project-body');
      const labels=(Array.isArray(project.categories)?project.categories:[]).map(id=>categories.find(c=>c.id===id)?.label).filter(Boolean);
      const categoriesLine=el('div','project-category-badges');(labels.length?labels:[project.category||'Projeto']).forEach(label=>categoriesLine.append(el('span','project-category',label)));
      body.append(categoriesLine,el('h3','',project.title),el('p','',project.description));
      const tags=el('div','project-tags');(Array.isArray(project.tags)?project.tags:[]).forEach(tag=>tags.append(el('span','',tag)));body.append(tags);
      const links=el('div','project-links');for(const [key,label] of [['repository','Código ↗'],['demo','Visualizar ↗']]){
        const href=safeUrl(project[key]);if(!href)continue;const a=el('a','',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';links.append(a);
      }
      if(links.childNodes.length)body.append(links);
      card.append(visual,body);track.append(card);
    });
    index=0;viewport.scrollLeft=0;update();
  }
  function applyFilter(){
    selection=list.filter(p=>filter==='all' || (Array.isArray(p.categories)?p.categories.includes(filter):p.category===categories.find(c=>c.id===filter)?.label))
      .sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
    renderCards();
  }
  function renderFilters(){
    bar.replaceChildren();const entries=[{id:'all',label:'Todos'},...categories];
    for(const item of entries){const btn=el('button',`filter-chip${item.id===filter?' active':''}`,item.label);btn.type='button';btn.dataset.projectFilter=item.id;btn.setAttribute('aria-pressed',String(item.id===filter));btn.addEventListener('click',()=>{
      filter=item.id;[...bar.children].forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});applyFilter();
    });bar.append(btn);}
  }
  prev.addEventListener('click',()=>move(index-1));next.addEventListener('click',()=>move(index+1));
  viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();move(index-1);}if(e.key==='Home'){e.preventDefault();move(0);}if(e.key==='End'){e.preventDefault();move(maxIndex());}});
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:viewport.scrollLeft};viewport.classList.add('is-grabbing');});
  viewport.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)>4)viewport.scrollLeft=drag.left+drag.x-e.clientX;});
  const end=()=>{if(!drag)return;const moved=Math.abs(drag.left-viewport.scrollLeft);drag=null;viewport.classList.remove('is-grabbing');if(moved>5){let target=0;for(let i=0;i<=maxIndex();i++)if(Math.abs(offset(i)-viewport.scrollLeft)<Math.abs(offset(target)-viewport.scrollLeft))target=i;move(target);}};
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('pointerleave',end);
  viewport.addEventListener('dragstart',e=>e.preventDefault());
  let scheduled=false;viewport.addEventListener('scroll',()=>{if(scheduled||drag||settling)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;let closest=0;for(let i=0;i<=maxIndex();i++)if(Math.abs(offset(i)-viewport.scrollLeft)<Math.abs(offset(closest)-viewport.scrollLeft))closest=i;if(closest!==index){index=closest;update();}});},{passive:true});
  window.addEventListener('resize',()=>move(Math.min(index,maxIndex()),'instant'));
  async function load(){
    const [p,c]=await Promise.allSettled([
      fetch('/.netlify/functions/projects',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
      fetch('/.netlify/functions/categories?kind=projects',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject())
    ]);
    if(p.status==='fulfilled' && Array.isArray(p.value.projects))list=p.value.projects;
    if(c.status==='fulfilled' && Array.isArray(c.value.categories))categories=c.value.categories;
    else categories=[{id:'full-stack',label:'Full Stack'},{id:'iot',label:'IoT'},{id:'inteligencia-artificial',label:'Inteligência Artificial'},{id:'dados',label:'Dados'},{id:'outros',label:'Outros'}];
    renderFilters();applyFilter();
  }
  load();
}
