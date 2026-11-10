import { getStore } from '@netlify/blobs';
import { authError,json,sameOrigin,validSession } from './lib/security.mjs';
import {allowedKinds,loadCategories,listCatalogRecords,categoryId,expandProject,expandCertificate} from './lib/catalogs.mjs';
const cleanText = s=>String(s??'').trim();
export default async function handler(req){
  try {
    if(!['GET','POST','DELETE'].includes(req.method))return json({error:'Método não permitido.'},405);
    const url=new URL(req.url);
    const kind=url.searchParams.get('kind');
    if(!allowedKinds.includes(kind))return json({error:'Tipo de categoria inválido.'},400);
    if(req.method!=='GET' && !validSession(req))return authError();
    if(req.method!=='GET' && !sameOrigin(req))return json({error:'Origem não autorizada.'},403);
    const list=await loadCategories(kind);
    if(req.method==='GET')return json({categories:list});
    const input=await req.json().catch(()=>({}));
    const id=cleanText(input.id);
    const store=getStore('portfolio-category-catalogs');
    if(req.method==='DELETE'){
      if(!list.some(c=>c.id===id))return json({error:'Categoria não encontrada.'},404);
      const records=await listCatalogRecords(kind);
      const used=records.some(item => kind==='projects'
        ? (Array.isArray(item.categories) && item.categories.some(v=>categoryId(v,list)===id) || categoryId(item.category,list)===id)
        : kind==='technologies' ? categoryId(item.cat,list)===id : categoryId(item.groupId||item.group,list)===id);
      if(used)return json({error:'Há registros vinculados a esta categoria. Reclassifique-os antes de excluir.'},409);
      const next=list.filter(c=>c.id!==id);
      await store.setJSON(kind,next);
      return json({categories:next});
    }
    const label=cleanText(input.label).replace(/\s+/g,' ');
    if(label.length<2 || label.length>55 || /[<>\x00-\x1f]/.test(label))return json({error:'Use um nome entre 2 e 55 caracteres, sem símbolos HTML.'},400);
    if(list.some(c=>c.label.toLocaleLowerCase('pt-BR')===label.toLocaleLowerCase('pt-BR') && c.id!==id))return json({error:'Já existe uma categoria com esse nome.'},409);
    const index=id?list.findIndex(c=>c.id===id):-1;
    if(id && index<0)return json({error:'Categoria não encontrada.'},404);
    if(index>=0){
      // Migra registros V4 (categorias em texto) ANTES de renomear; não perde a referência.
      if(kind!=='technologies'){
        const records=await listCatalogRecords(kind);
        const migrated=records.map(item=>kind==='projects'?expandProject(item,list):expandCertificate(item,list));
        const originalStore=getStore(kind==='projects'?'portfolio-projects':'portfolio-certificates');
        await originalStore.setJSON(kind==='projects'?'projects':'certificates',migrated);
      }
      list[index]={...list[index],label};
    }
    else {
      if(list.length>=60)return json({error:'Limite de 60 categorias atingido.'},400);
      list.push({id:crypto.randomUUID(),label});
    }
    await store.setJSON(kind,list);
    return json({categories:list});
  }catch(error){console.error('categories error:',error);return json({error:'Não foi possível atualizar as categorias.'},500);}
}
