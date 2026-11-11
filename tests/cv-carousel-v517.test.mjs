import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {wrapProjectIndex} from '../public/assets/project-carousel.js';
import {validCvLink} from '../public/assets/cv-download.js';
import {sanitizeContent} from '../netlify/functions/content.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('ciclo de projetos retorna do último índice ao primeiro, inclusive no sentido contrário',()=>{
  assert.equal(wrapProjectIndex(4,3),0);assert.equal(wrapProjectIndex(-1,3),3);
  assert.equal(wrapProjectIndex(2,3),2);assert.equal(wrapProjectIndex(1,0),0);
});
test('carrossel usa a função de volta circular no botão seguinte e anterior',()=>{
  const js=source('public/assets/project-carousel.js');
  assert.match(js,/index=wrapProjectIndex\(to,maxIndex\(\)\)/);
  assert.match(js,/next.addEventListener\('click',\(\)=>move\(index\+1\)\)/);
  assert.match(js,/prev.addEventListener\('click',\(\)=>move\(index-1\)\)/);
});
test('menu CV está na posição correta, entre foto e legenda, com duas opções PDF',()=>{
  const html=source('public/index.html');
  assert.match(html,/<div class="portrait-reflection"[\s\S]*?<div class="cv-download"[\s\S]*?<div class="portrait-caption">/);
  assert.match(html,/id="cv-link-traditional"/);assert.match(html,/id="cv-link-ats"/);
  for(const name of ['curriculo-tradicional.pdf','curriculo-ats.pdf']){
    const path=new URL('../public/assets/cv/'+name,import.meta.url);
    assert.ok(statSync(path).size>20_000);
    assert.equal(readFileSync(path).subarray(0,5).toString(),'%PDF-');
  }
});
test('URLs de CV rejeitam esquemas perigosos e preservam PDFs locais ou da Netlify',()=>{
  assert.equal(validCvLink('javascript:alert(1)'),'');
  assert.equal(validCvLink('/assets/cv/curriculo-ats.pdf'),'/assets/cv/curriculo-ats.pdf');
  assert.equal(validCvLink('/.netlify/functions/media?key=aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa.pdf'),'/.netlify/functions/media?key=aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa.pdf');
  assert.equal(validCvLink('data:application/pdf,xx'),'');
  assert.equal(sanitizeContent({aboutCvTraditional:'/assets/cv/curriculo-tradicional.pdf'}).aboutCvTraditional,'/assets/cv/curriculo-tradicional.pdf');
  assert.throws(()=>sanitizeContent({aboutCvAts:'javascript:alert(1)'}),/inválido/);
});
test('painel pode enviar novo PDF do CV e atualizar os links no conteúdo',()=>{
  const cms=source('public/assets/cms-admin.js');
  assert.match(cms,/async function uploadPdf/);
  assert.match(cms,/aboutCvTraditional','aboutCvAts/);
  const media=source('netlify/functions/media.mjs');
  assert.match(media,/'application\/pdf': 'pdf'/);
  assert.match(media,/Content-Disposition/);
});
