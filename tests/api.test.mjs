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
