import { getStore } from '@netlify/blobs';
import { skills } from '../../public/assets/data.js';
import { authError, json, sameOrigin, validSession } from './lib/security.mjs';
const cats = ['linguagens','frameworks','infra','iot'];
const LIMIT = 100;
// Cores originais preservadas para não perder a identidade individual das 25 marcas.
const originalColors = {
  Java:'#E76F37',Python:'#3676AB',C:'#5B7FBD','C++':'#649AD6','C#':'#AA83D8',
  JavaScript:'#F2D34D',PHP:'#8E8CBB',Ruby:'#E96A76','HTML & CSS':'#ED7D58',
  React:'#61DAFB',Angular:'#EF637A','Node.js':'#7CCB7D','Spring Boot':'#84D67C',Django:'#4EBF9A',
  Docker:'#49B7ED',Kubernetes:'#638FEE',Git:'#FA7759',DevOps:'#5FCBD6',Cloud:'#7AA2F2',
  MQTT:'#A38AFF',LoRa:'#7CD9D1',LoRaWAN:'#7CD9D1',MySQL:'#76C3DE',
  'SQL Server':'#EC7A86','Power BI':'#ECD465'
};
const seed = skills.map((s,i) => ({id:`seed-tech-${i+1}`,label:s.label,cat:s.cat,icon:s.icon,color:originalColors[s.label]||'#B7FF79',logoUrl:''}));
const cut = (v,max) => String(v??'').trim().slice(0,max);
function validateLogo(value) {
  const url=cut(value,800);
  if (!url) return '';
  if (/^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(url)) return url;
  try {const parsed=new URL(url);if(parsed.protocol === 'https:' && !parsed.username && !parsed.password)return parsed.href;}catch {}
  throw new Error('Logo deve ser uma URL HTTPS ou uma imagem enviada pelo painel.');
}
export function cleanTechnology(raw,original=null) {
  if(!raw || typeof raw !== 'object') throw new Error('Tecnologia inválida.');
  const label=cut(raw.label,64), icon=cut(raw.icon,12), color=cut(raw.color,7),cat=cut(raw.cat,16);
  if(!label || !cats.includes(cat)) throw new Error('Informe nome e categoria válidos.');
  if(color && !/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Cor deve estar no formato #RRGGBB.');
  return {id:original?.id || crypto.randomUUID(),label,cat,icon:icon||label.slice(0,2).toUpperCase(),color:color||'#B7FF79',logoUrl:validateLogo(raw.logoUrl)};
}
export default async function handler(req) {
  try {
    if (!['GET','POST','DELETE','PATCH'].includes(req.method)) return json({error:'Método não permitido.'},405);
    if (req.method !== 'GET' && !validSession(req)) return authError();
    if (req.method !== 'GET' && !sameOrigin(req)) return json({error:'Origem não autorizada.'},403);
    const store=getStore('portfolio-technologies');
    const saved=await store.get('technologies',{type:'json'});
    const list=Array.isArray(saved) ? saved : [...seed];
    if (req.method==='GET') return json({technologies:list});
    const data=await req.json().catch(()=>({}));
    if (req.method==='DELETE') {
      const next=list.filter(item=>item.id!==String(data.id||''));
      if(next.length===list.length)return json({error:'Tecnologia não encontrada.'},404);
      await store.setJSON('technologies',next);
      return json({technologies:next});
    }
    if (req.method==='PATCH') {
      if(!Array.isArray(data.ids) || data.ids.length!==list.length || new Set(data.ids).size!==list.length || !data.ids.every(id=>list.some(t=>t.id===id))) return json({error:'Ordem enviada inválida.'},400);
      const byId=new Map(list.map(item=>[item.id,item]));
      const next=data.ids.map(id=>byId.get(id));
      await store.setJSON('technologies',next);
      return json({technologies:next});
    }
    const id=cut(data.id,100);
    const index=list.findIndex(t=>t.id===id);
    if(id && index<0)return json({error:'Tecnologia não encontrada.'},404);
    if(index<0 && list.length>=LIMIT)return json({error:'Limite de tecnologias atingido.'},400);
    const item=cleanTechnology(data,index<0?null:list[index]);
    if(index>=0)list[index]=item;else list.push(item);
    await store.setJSON('technologies',list);
    return json({technologies:list});
  } catch(error) {
    if (/inválid|Informe|Cor deve|Logo deve/i.test(error.message||''))return json({error:error.message},400);
    console.error('technologies error:',error);
    return json({error:'Não foi possível salvar as tecnologias. Verifique Netlify Blobs.'},500);
  }
}
