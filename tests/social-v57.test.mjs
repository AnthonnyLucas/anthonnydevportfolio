import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scryptSync} from 'node:crypto';
import {issueSession} from '../netlify/functions/lib/security.mjs';
import handler, {sanitizeContent} from '../netlify/functions/content.mjs';
import {reset} from './mock-blobs.mjs';
import {contentFields,contentDefaults,contentGroups} from '../public/assets/site-schema.js';
import {applyContent} from '../public/assets/content-client.js';
const read=name=>readFileSync(new URL(`../public/assets/${name}`,import.meta.url),'utf8');
process.env.ADMIN_EMAIL='qa@example.org';
process.env.SESSION_SECRET='V57_AUTOMATED_TESTS_NEVER_DEPLOY_123456789ABCDE';
const salt='fedcba9876543210abcdef9876543210';
process.env.ADMIN_PASSWORD_HASH=`scrypt$${salt}$${scryptSync('test-secret',salt,64).toString('hex')}`;
const endpoint='https://portfolio.test/.netlify/functions/content';
const post=async(revision,patch)=> {
  const req=new Request(endpoint,{method:'PATCH',headers:{Origin:'https://portfolio.test',Cookie:`portfolio_session=${issueSession()}`,'Content-Type':'application/json'},body:JSON.stringify({revision,patch})});
  const res=await handler(req);return {status:res.status,body:await res.json()};
};
test('V5.7: links editáveis agrupados em Redes sociais com as quatro opções',()=>{
  assert.ok(contentGroups.some(x=>x.id==='redes'));
  for(const key of ['githubUrl','linkedinUrl','gmailUrl','whatsappUrl'])assert.equal(contentFields.find(x=>x.key===key)?.group,'redes');
  assert.equal(contentDefaults.gmailUrl,'https://mail.google.com/mail/u/0/?to=anthonny6613@gmail.com&fs=1&tf=cm');
  assert.equal(contentDefaults.whatsappUrl,'https://api.whatsapp.com/send/?phone=5581999318775&text&type=phone_number&app_absent=0');
  const admin=read('cms-admin.js');assert.match(admin,/gmailUrl/);assert.match(admin,/whatsappUrl/);
});
test('V5.7: servidor salva links de Gmail e WhatsApp e rejeita URL maliciosa',async()=>{
  reset();
  let r=await post(0,{gmailUrl:'mailto:meucontato@gmail.com',whatsappUrl:'https://wa.me/5581999999999'});
  assert.equal(r.status,200,r.body?.error);assert.equal(r.body.content.gmailUrl,'mailto:meucontato@gmail.com');
  assert.equal(r.body.content.whatsappUrl,'https://wa.me/5581999999999');
  let g=await handler(new Request(endpoint));let body=await g.json();assert.equal(body.content.gmailUrl,'mailto:meucontato@gmail.com');
  assert.equal(body.content.whatsappUrl,'https://wa.me/5581999999999');
  r=await post(1,{gmailUrl:'contatoalternativo@gmail.com'});assert.equal(r.status,200);
  r=await post(2,{gmailUrl:'https://mail.google.com/mail/?view=cm&fs=1&to=contato@gmail.com'});assert.equal(r.status,200);
  r=await post(3,{gmailUrl:'javascript:alert(1)'});assert.equal(r.status,400);
  r=await post(3,{gmailUrl:'https://unsafe-site.test/send?to=x@gmail.com'});assert.equal(r.status,400);
  r=await post(3,{whatsappUrl:'javascript:alert(1)'});assert.equal(r.status,400);
});
test('V5.7: setas têm faixas laterais e aparência de ícone, sem fundo',()=>{
  const css=read('v5-7.css');const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(css,/grid-template-columns:\s*var\(--carousel-gutter\) minmax\(0, 1fr\) var\(--carousel-gutter\)/);
  for(const selector of ['.tech-carousel-stage','.project-viewport','.cert-viewport'])assert.ok(css.includes(selector));
  for(const selector of ['.tech-carousel-navigation','.project-nav','.cert-nav'])assert.ok(html.includes(selector.slice(1)));
  assert.match(css,/background: transparent/);assert.match(css,/border: 0/);
  assert.match(html,/v5-7\.css\?v=5\.7\.1/);
});
