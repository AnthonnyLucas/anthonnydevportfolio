// Proxy controlado para a indexação de logotipos: exclusivamente três coleções abertas.
// Não aceita URLs arbitrárias nem executa SVG remoto; retorna somente nomes válidos.
const ALLOWED=new Set(['devicon','logos','simple-icons']);
const validSlug=/^[a-z0-9][a-z0-9._-]{0,110}$/i;
export function flattenIconNames(data){
  if(!data||typeof data!=='object')return [];
  const raw=[...(Array.isArray(data.uncategorized)?data.uncategorized:[])];
  if(data.categories && typeof data.categories==='object')for(const values of Object.values(data.categories)){
    if(Array.isArray(values))raw.push(...values);
  }
  return [...new Set(raw.filter(v=>typeof v==='string'&&validSlug.test(v)))].slice(0,12000);
}
export default async function handler(req){
  const source=new URL(req.url).searchParams.get('source');
  if(req.method!=='GET')return Response.json({error:'Método não permitido.'},{status:405});
  if(!ALLOWED.has(source))return Response.json({error:'Coleção não permitida.'},{status:400});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),11000);
  try{
    const response=await fetch(`https://api.iconify.design/collection?prefix=${source}`,{signal:controller.signal});
    if(!response.ok)throw new Error('API indisponível.');
    const names=flattenIconNames(await response.json());
    if(names.length<100)throw new Error('Coleção incompleta.');
    return Response.json({source,names,count:names.length},{headers:{'Cache-Control':'public, max-age=3600, s-maxage=86400','X-Content-Type-Options':'nosniff'}});
  }catch{
    return Response.json({error:'Não foi possível obter a coleção agora; tente novamente.'},{status:503});
  }finally{clearTimeout(timer);}
}
