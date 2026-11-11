// Componente da seção Sobre mim. Nunca intercepta links da navegação entre seções.
export function validCvLink(value){
  if(typeof value!=='string')return '';
  const url=value.trim();
  if(/^\/assets\/cv\/[a-z0-9_-]+\.pdf$/i.test(url))return url;
  if(/^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.pdf$/i.test(url))return url;
  try {const parsed=new URL(url);if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password)return parsed.href;}catch{}
  return '';
}
export function setCvLinks(config={},root=document){
  for(const [key,id] of [['aboutCvTraditional','cv-link-traditional'],['aboutCvAts','cv-link-ats']]){
    const node=root.getElementById?.(id)??root.querySelector?.(`#${id}`);
    if(!node)continue;
    const link=validCvLink(config[key]);
    if(link){node.href=link;node.removeAttribute('aria-disabled');node.removeAttribute('tabindex');}
    else {node.removeAttribute('href');node.setAttribute('aria-disabled','true');node.tabIndex=-1;}
    if(link.startsWith('https://')){node.target='_blank';node.rel='noopener noreferrer';}
    else {node.removeAttribute('target');node.removeAttribute('rel');}
  }
}
export function setupCvDropdown(root=document){
  const holder=root.querySelector('#cv-download'),trigger=root.querySelector('#cv-download-toggle'),menu=root.querySelector('#cv-download-menu');
  if(!holder||!trigger||!menu)return;
  const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');};
  trigger.addEventListener('click',()=>{menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden));});
  root.addEventListener('pointerdown',e=>{if(!holder.contains(e.target))close();});
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();trigger.focus();}});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>close()));
}
