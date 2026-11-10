import { getStore } from '@netlify/blobs';
import { showcaseProjects, certificates, certificateCategories } from '../../../public/assets/data.js';

export const projectSeeds = [
  {id:'full-stack',label:'Full Stack'}, {id:'iot',label:'IoT'},
  {id:'inteligencia-artificial',label:'Inteligência Artificial'},
  {id:'dados',label:'Dados'}, {id:'outros',label:'Outros'}
];
const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55);
export const certificateSeeds = certificateCategories.filter(v=>v!=='Todas').map(label=>({id:slug(label),label}));
export const allowedKinds = ['projects','certificates'];
export const defaultsFor = kind => kind==='projects' ? projectSeeds : certificateSeeds;
export async function loadCategories(kind) {
  if(!allowedKinds.includes(kind)) throw new Error('Catálogo inválido.');
  const store=getStore('portfolio-category-catalogs');
  const saved=await store.get(kind,{type:'json'});
  return Array.isArray(saved) ? saved : defaultsFor(kind).map(c=>({...c}));
}
export function categoryId(value,list,fallback='') {
  const text=String(value??'').trim();
  const found=list.find(c=>c.id===text || c.label.toLocaleLowerCase('pt-BR')===text.toLocaleLowerCase('pt-BR'));
  return found?.id ?? fallback;
}
export function expandProject(project,list) {
  const ids=Array.isArray(project.categories) ? project.categories.map(v=>categoryId(v,list)).filter(Boolean) : [];
  if(!ids.length && project.category) {
    const older=categoryId(project.category,list);
    if(older)ids.push(older);
  }
  const unique=[...new Set(ids)];
  return {...project,categories:unique,category:list.find(c=>c.id===unique[0])?.label || project.category || 'Outros'};
}
export function expandCertificate(certificate,list) {
  const id=categoryId(certificate.groupId || certificate.group,list);
  return {...certificate,groupId:id || '',group:list.find(c=>c.id===id)?.label || certificate.group || 'Outros'};
}
export async function listCatalogRecords(kind) {
  const store=getStore(kind==='projects'?'portfolio-projects':'portfolio-certificates');
  const saved=await store.get(kind==='projects'?'projects':'certificates',{type:'json'});
  return Array.isArray(saved) ? saved : kind==='projects'?showcaseProjects:certificates;
}
