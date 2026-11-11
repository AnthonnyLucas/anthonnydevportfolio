import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const html=read('public/index.html');
const css=read('public/assets/v5-9.css');
const client=read('public/assets/content-client.js');
const schema=read('public/assets/site-schema.js');

test('v5.10: brilho e indicação de rolagem do hero não viram itens da grade',()=>{
  // Antes da correção, a regra abaixo aplicava `position:relative` a todos os filhos do hero.
  assert.doesNotMatch(css,/\.hero>:not\(\.section-particles\)[^{]*\{position:relative/);
  assert.match(css,/\.hero>\.hero-copy,\.hero>\.hero-art\{position:relative;z-index:1\}/);
  assert.match(css,/\.hero>\.hero-glow\{position:absolute;z-index:0\}/);
  assert.match(css,/\.hero>\.scroll-cue\{position:absolute;z-index:2\}/);
  assert.match(html,/<section id="inicio" class="hero section-anchor">/);
  assert.match(html,/class="hero-copy reveal visible"/);
  assert.match(html,/class="hero-art"/);
  assert.match(html,/v5-9\.css\?v=5\.10\.0/);
});

test('v5.10: contato inclui e-mail, WhatsApp, GitHub e LinkedIn, sem duplicar ids',()=>{
  const ids=['public-contact-email','public-contact-whatsapp','public-contact-github','public-contact-linkedin'];
  for(const id of ids){
    assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,`ID ${id}`);
    assert.match(html,new RegExp(`id="${id}"[\\s\\S]*?<span>(E-mail|WhatsApp|GitHub|LinkedIn)</span>`));
  }
  assert.match(html,/id="public-contact-github" data-url-key="githubUrl"/);
  assert.match(html,/id="public-contact-linkedin" data-url-key="linkedinUrl"/);
  assert.match(schema,/field\('githubUrl','redes'/);
  assert.match(schema,/field\('linkedinUrl','redes'/);
  assert.match(client,/root\.querySelectorAll\('\[data-url-key\]'\)/);
});

test('v5.10: documentos do projeto acompanham a versão',()=>{
  const readme=read('README.md');
  const credits=read('CREDITOS_E_REUTILIZACAO.md');
  const guide=read('GUIA_FUNCIONALIDADES_E_TESTES.md');
  assert.match(readme,/Versão:\*\* 5\.(?:10|11|12|13|14|15|16|17)\.0/);
  assert.match(credits,/Anthonny Lucas Santos da Silva/);
  assert.match(credits,/Atribuição obrigatória/);
  assert.match(guide,/Regressão específica v5\.10/);
  for(const endpoint of ['auth','content','technologies','projects','certificates','categories','media'])assert.match(guide,new RegExp('`'+endpoint+'`'));
});
