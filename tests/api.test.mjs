import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import contentEndpoint from '../netlify/functions/content.mjs';
import techEndpoint from '../netlify/functions/technologies.mjs';
import {issueSession} from '../netlify/functions/lib/security.mjs';
import {reset} from './mock-blobs.mjs';
process.env.ADMIN_EMAIL='qa@example.org';
process.env.SESSION_SECRET='TESTING_KEY_ONLY_THIS_IS_LONG_ENOUGH_DO_NOT_DEPLOY_12345';
const salt='fedcba9876543210abcdef9876543210';
process.env.ADMIN_PASSWORD_HASH=`scrypt$${salt}$${scryptSync('temporary-test-secret',salt,64).toString('hex')}`;
const base='https://portfolio.test/.netlify/functions/';
const session=()=>`portfolio_session=${issueSession()}`;
function request(endpoint,method='GET',value=null,opts={}) {
  return new Request(base+endpoint,{method,headers:{'Origin':opts.origin??'https://portfolio.test',...(opts.auth?{'Cookie':session()}:{}),...(value?{'Content-Type':'application/json'}:{})},body:value?JSON.stringify(value):undefined});
}
async function call(fn,endpoint,method='GET',value=null,opts={}){
  const res=await fn(request(endpoint,method,value,opts));
  return {status:res.status,body:await res.json()};
}
test('content: fallback, auth, validation, revisions and persistence', async()=>{
  reset();
  let r=await call(contentEndpoint,'content');
  assert.equal(r.status,200);assert.equal(r.body.content.heroLine1,'Transformando');assert.equal(r.body.revision,0);
  r=await call(contentEndpoint,'content','PATCH',{revision:0,patch:{heroLine1:'Novo título'}});
  assert.equal(r.status,401);
  r=await call(contentEndpoint,'content','PATCH',{revision:0,patch:{heroLine1:'Novo título'}},{auth:true,origin:'https://attacker.test'});
  assert.equal(r.status,403);
  r=await call(contentEndpoint,'content','PATCH',{revision:0,patch:{heroLine1:'Criando produtos digitais',aboutImagePosition:'28'}},{auth:true});
  assert.equal(r.status,200);assert.equal(r.body.content.heroLine1,'Criando produtos digitais');assert.equal(r.body.revision,1);
  r=await call(contentEndpoint,'content');assert.equal(r.body.content.heroLine1,'Criando produtos digitais');
  r=await call(contentEndpoint,'content','PATCH',{revision:0,patch:{aboutLead:'conflito'}},{auth:true});assert.equal(r.status,409);
  r=await call(contentEndpoint,'content','PATCH',{revision:1,patch:{metaTitle:'Título <script>alert(1)</script>'}},{auth:true});
  assert.equal(r.status,200);assert.equal(r.body.content.metaTitle,'Título <script>alert(1)</script>'); // rendered only with textContent
  r=await call(contentEndpoint,'content','PATCH',{revision:2,patch:{aboutImage:'javascript:alert(1)'}},{auth:true});assert.equal(r.status,400);
  r=await call(contentEndpoint,'content','PATCH',{revision:2,patch:{unknownField:'!'}},{auth:true});assert.equal(r.status,400);
});
test('technologies: protected CRUD, reorder, field sanitation and empty catalog',async()=>{
  reset();
  let r=await call(techEndpoint,'technologies');assert.equal(r.status,200);assert.equal(r.body.technologies.length,25);
  r=await call(techEndpoint,'technologies','POST',{label:'TypeScript',cat:'linguagens',icon:'TS',color:'#3178c6'});assert.equal(r.status,401);
  r=await call(techEndpoint,'technologies','POST',{label:'TypeScript',cat:'linguagens',icon:'TS',color:'#3178c6'},{auth:true});
  assert.equal(r.status,200);assert.equal(r.body.technologies.length,26);
  const id=r.body.technologies.at(-1).id;assert.equal(r.body.technologies.at(-1).label,'TypeScript');
  r=await call(techEndpoint,'technologies','POST',{id,label:'TypeScript 5',cat:'linguagens',icon:'TS',color:'#3178c6'},{auth:true});assert.equal(r.body.technologies.length,26);
  let ids=r.body.technologies.map(i=>i.id);ids=[ids.at(-1),...ids.slice(0,-1)];
  r=await call(techEndpoint,'technologies','PATCH',{ids},{auth:true});assert.equal(r.status,200);assert.equal(r.body.technologies[0].id,id);
  r=await call(techEndpoint,'technologies','DELETE',{id},{auth:true});assert.equal(r.body.technologies.length,25);
  r=await call(techEndpoint,'technologies','POST',{label:'Foobar',cat:'invalid',color:'#ffffff'},{auth:true});assert.equal(r.status,400);
  r=await call(techEndpoint,'technologies','PATCH',{ids:['arbitrary']},{auth:true});assert.equal(r.status,400);
});

import projectEndpoint from '../netlify/functions/projects.mjs';
import certificateEndpoint from '../netlify/functions/certificates.mjs';
import categoryEndpoint from '../netlify/functions/categories.mjs';
import {getStore} from './mock-blobs.mjs';
test('categories: protected CRUD, multi-classification, migration of V4, rename and deletion protections',async()=>{
  reset();
  const categoryReq=(kind,method='GET',payload=null,opts={})=>call(categoryEndpoint,`categories?kind=${kind}`,method,payload,opts);
  let r=await categoryReq('projects');assert.equal(r.status,200);assert.equal(r.body.categories.length,5);
  r=await categoryReq('projects','POST',{label:'Cloud AWS'});assert.equal(r.status,401);
  r=await categoryReq('projects','POST',{label:'Cloud AWS'},{auth:true});assert.equal(r.status,200);
  const aws=r.body.categories.find(c=>c.label==='Cloud AWS');assert.ok(aws?.id);
  const iot=r.body.categories.find(c=>c.label==='IoT');
  const full=r.body.categories.find(c=>c.label==='Full Stack');
  const ai=r.body.categories.find(c=>c.label==='Inteligência Artificial');
  r=await call(projectEndpoint,'projects','POST',{title:'Teste multi-categoria',description:'Sistema de testes',categories:[iot.id,aws.id,full.id,ai.id],tags:[],featured:false},{auth:true});
  assert.equal(r.status,200);const project=r.body.projects[0];assert.deepEqual(project.categories,[iot.id,aws.id,full.id,ai.id]);
  r=await categoryReq('projects','POST',{id:iot.id,label:'Sistemas IoT'},{auth:true});assert.equal(r.status,200);
  r=await call(projectEndpoint,'projects');assert.equal(r.body.projects[0].category,'Sistemas IoT');assert.deepEqual(r.body.projects[0].categories,[iot.id,aws.id,full.id,ai.id]);
  r=await categoryReq('projects','DELETE',{id:aws.id},{auth:true});assert.equal(r.status,409);
  r=await call(projectEndpoint,'projects','DELETE',{id:project.id},{auth:true});assert.equal(r.status,200);
  r=await categoryReq('projects','DELETE',{id:aws.id},{auth:true});assert.equal(r.status,200);
  // Registro anterior sem categories é convertido no servidor antes de renomear.
  await getStore('portfolio-projects').setJSON('projects',[{id:'legacy-project',title:'Legado',category:'Dados',description:'Antigo projeto'}]);
  const dataCat=(await categoryReq('projects')).body.categories.find(c=>c.label==='Dados');
  r=await categoryReq('projects','POST',{id:dataCat.id,label:'Análise de Dados'},{auth:true});assert.equal(r.status,200);
  r=await call(projectEndpoint,'projects');assert.deepEqual(r.body.projects[0].categories,[dataCat.id]);
  assert.equal(r.body.projects[0].category,'Análise de Dados');
  r=await categoryReq('projects','POST',{label:'Análise de Dados'},{auth:true});assert.equal(r.status,409);
});

test('certificate categories support custom areas, renamed labels and protected deletion',async()=>{
  reset();
  const c=(method='GET',data=null,opts={})=>call(categoryEndpoint,'categories?kind=certificates',method,data,opts);
  let r=await c();assert.equal(r.status,200);assert.ok(r.body.categories.length>=8);
  r=await c('POST',{label:'Robótica Industrial'},{auth:true});assert.equal(r.status,200);
  const id=r.body.categories.find(c=>c.label==='Robótica Industrial').id;
  r=await call(certificateEndpoint,'certificates','POST',{name:'Curso Robótica',description:'Laboratório',hours:'30 horas',org:'Instituto',groupId:id},{auth:true});
  assert.equal(r.status,200);const certificate=r.body.certificates[0];assert.equal(certificate.groupId,id);
  r=await c('POST',{id,label:'Automação e Robótica'},{auth:true});assert.equal(r.status,200);
  r=await call(certificateEndpoint,'certificates');assert.equal(r.body.certificates[0].group,'Automação e Robótica');
  r=await c('DELETE',{id},{auth:true});assert.equal(r.status,409);
  r=await call(certificateEndpoint,'certificates','DELETE',{id:certificate.id},{auth:true});assert.equal(r.status,200);
  r=await c('DELETE',{id},{auth:true});assert.equal(r.status,200);
});
