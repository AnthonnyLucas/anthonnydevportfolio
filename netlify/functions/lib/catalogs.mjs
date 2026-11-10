import { getStore } from '@netlify/blobs';
import { showcaseProjects, certificates, certificateCategories } from '../../../public/assets/data.js';

export const projectSeeds = [
  {id:'full-stack',label:'Full Stack'}, {id:'iot',label:'IoT'},
  {id:'inteligencia-artificial',label:'Inteligência Artificial'},
  {id:'dados',label:'Dados'}, {id:'outros',label:'Outros'}
];
const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55);
export const certificateSeeds = certificateCategories.filter(v=>v!=='Todas').map(label=>({id:slug(label),label}));
export const technologySeeds = [
  {id:'linguagens',label:'Linguagens'},
  {id:'frameworks',label:'Frameworks'},
  {id:'infra',label:'Infra & DevOps'},
  {id:'iot',label:'IoT & Dados'}
];
export const allowedKinds = ['projects','certificates','technologies'];
export const defaultsFor = kind => kind==='projects' ? projectSeeds : kind==='technologies' ? technologySeeds : certificateSeeds;
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
  const storeName=kind==='projects'?'portfolio-projects':kind==='technologies'?'portfolio-technologies':'portfolio-certificates';
  const key=kind==='technologies'?'technologies':kind;
  const store=getStore(storeName);
  const saved=await store.get(key,{type:'json'});
  if(Array.isArray(saved))return saved;
  if(kind==='technologies')return (await import('../../../public/assets/data.js')).skills;
  return kind==='projects'?showcaseProjects:certificates;
}
