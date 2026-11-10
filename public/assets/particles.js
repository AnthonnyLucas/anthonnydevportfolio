// Pontos e conexões em plano de fundo — um único loop com limite de 25 FPS.
// Sem dependências externas. Respeita movimento reduzido, aba oculta e telas pequenas.
export function initParticles({admin=false}={}) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const roots=admin ? [document.querySelector('.admin-wrap')] : [...document.querySelectorAll('.hero, .content-section')];
  const active=new Set();
  const scenes=[];
  const mobile=()=>window.innerWidth<=640;
  const rand=(a,b)=>Math.random()*(b-a)+a;
  for(const parent of roots.filter(Boolean)) {
    const canvas=document.createElement('canvas');
    canvas.className='section-particles';
    canvas.setAttribute('aria-hidden','true');
    canvas.setAttribute('role','presentation');
    parent.prepend(canvas);
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)continue;
    scenes.push({parent,canvas,ctx,nodes:[],width:0,height:0});
  }
  if(!scenes.length)return;
  function resizeScene(s){
    const width=s.parent.clientWidth, height=s.parent.clientHeight;
    if(!width||!height)return;
    const dpr=Math.min(window.devicePixelRatio||1,1.6);
    s.canvas.width=Math.round(width*dpr); s.canvas.height=Math.round(height*dpr);
    s.canvas.style.width=`${width}px`;s.canvas.style.height=`${height}px`;
    s.ctx.setTransform(dpr,0,0,dpr,0,0);
    s.width=width;s.height=height;
    const count=admin?(mobile()?16:33):(mobile()?12:(s.parent.classList.contains('hero')?38:27));
    s.nodes=Array.from({length:count},()=>({x:rand(.015,.985),y:rand(.02,.98),radius:rand(1,2.3),phase:rand(0,6.28),speed:rand(.15,.43)}));
  }
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const s=scenes.find(q=>q.parent===e.target);if(s){if(e.isIntersecting)active.add(s);else active.delete(s);}});},{rootMargin:'100px 0px'});
  for(const s of scenes){resizeScene(s);observer.observe(s.parent);}
  const resizeObserver=new ResizeObserver(entries=>{
    entries.forEach(e=>{const s=scenes.find(q=>q.parent===e.target);if(s && Math.abs(s.width-e.target.clientWidth)>1 || s && Math.abs(s.height-e.target.clientHeight)>1)resizeScene(s);});
  });
  scenes.forEach(s=>resizeObserver.observe(s.parent));
  let raf=0, last=0, previous=0;
  function drawScene(s,time,light,staticFrame){
    const {ctx,width:w,height:h}=s;
    if(!w||!h)return;
    ctx.clearRect(0,0,w,h);
    const base=light?'41,106,117':'160,236,176';
    const secondary=light?'47,108,169':'105,178,242';
    const dots=s.nodes.map(n=>({x:(n.x + (staticFrame?0:Math.sin(time*.00022*n.speed+n.phase)*.014))*w,y:(n.y+(staticFrame?0:Math.cos(time*.00018*n.speed+n.phase)*.019))*h,r:n.radius}));
    const max=mobile()?115:165;
    for(let i=0;i<dots.length;i++){
      const p=dots[i];
      for(let j=i+1;j<dots.length;j++){
        const q=dots[j],dist=Math.hypot(p.x-q.x,p.y-q.y);
        if(dist>=max)continue;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
        ctx.strokeStyle=`rgba(${base},${(light?.16:.18)*(1-dist/max)})`;
        ctx.lineWidth=.65;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${i%5===0?secondary:base},${light?.30:.43})`;ctx.fill();
    }
  }
  const repaint=()=>{
    const isLight=document.documentElement.dataset.theme==='light';
    scenes.forEach(s=>drawScene(s,0,isLight,true));
  };
  function tick(time){
    raf=requestAnimationFrame(tick);
    if(document.hidden || reduce?.matches || time-last<40)return;
    last=time;const light=document.documentElement.dataset.theme==='light';
    active.forEach(s=>drawScene(s,time,light,false));
  }
  const sync=()=>{
    if(reduce?.matches){if(raf){cancelAnimationFrame(raf);raf=0;}repaint();}
    else if(!raf)raf=requestAnimationFrame(tick);
  };
  reduce?.addEventListener?.('change',sync);
  window.addEventListener('portfolio:themechange',repaint);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)repaint();});
  sync();
}
