import test from 'node:test';
import assert from 'node:assert/strict';
import {techIconCatalog,ICONIFY_COLLECTIONS,collectionIconNames,iconifyItems,filterIconCatalog} from '../public/assets/tech-icon-catalog.js';
import {flattenIconNames} from '../netlify/functions/icon-library.mjs';
import handler from '../netlify/functions/icon-library.mjs';

const mockIndex={prefix:'simple-icons',uncategorized:['python','docker','react'],categories:{Dev:['node-dot-js','python','git'],Hardware:['raspberrypi','arduino']},hidden:['removed']};
test('v5.12: catálogo anterior permanece intacto',()=>{
  assert.equal(techIconCatalog.length,156);
  assert.ok(techIconCatalog.find(i=>i.name==='Assembly'));
  assert.equal(ICONIFY_COLLECTIONS.length,3);
});
test('v5.12: conversão de metadados Iconify remove duplicados e entradas inválidas',()=>{
  const names=collectionIconNames(mockIndex);
  assert.deepEqual(names,['python','docker','react','node-dot-js','git','raspberrypi','arduino']);
  assert.deepEqual(flattenIconNames(mockIndex),names);
  assert.deepEqual(collectionIconNames({uncategorized:['yes','INVALID:BAD','<script>','yes']}),['yes']);
});
test('v5.12: índice com mais de mil nomes validáveis resulta em mais de mil opções distintas e URLs HTTPS válidas',()=>{
  const names=Array.from({length:1200},(_,i)=>`tech-${i}`);
  const icons=iconifyItems('simple-icons',names);
  assert.equal(icons.length,1200);
  assert.equal(new Set(icons.map(i=>i.url)).size,1200);
  assert.equal(icons[0].url,'https://api.iconify.design/simple-icons/tech-0.svg');
  assert.equal(iconifyItems('unknown',names).length,0);
  assert.equal(filterIconCatalog(icons,'tech 10').length,131); // normalização do termo digitado
  assert.equal(filterIconCatalog(icons,'tech-1').length,471);
  assert.equal(filterIconCatalog(icons,'tech-1','devicon').length,0);
});
test('v5.12: proxy bloqueia métodos e coleções não autorizados',async()=>{
  const res=await handler(new Request('https://example.netlify.app/.netlify/functions/icon-library?source=unexpected'));
  assert.equal(res.status,400);
  const post=await handler(new Request('https://example.netlify.app/.netlify/functions/icon-library?source=devicon',{method:'POST'}));
  assert.equal(post.status,405);
});

test('v5.12: proxy público transmite coleção válida sem expor recursos arbitrários',async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async(url)=>{
    assert.equal(url,'https://api.iconify.design/collection?prefix=devicon');
    return {ok:true,json:async()=>({uncategorized:Array.from({length:1036},(_,i)=>'brand-'+i)})};
  };
  try{
    const response=await handler(new Request('https://meu-site.netlify.app/.netlify/functions/icon-library?source=devicon'));
    assert.equal(response.status,200);
    const data=await response.json();
    assert.equal(data.count,1036);
    assert.equal(data.names.length,1036);
    assert.equal(response.headers.get('cache-control').includes('s-maxage'),true);
  }finally{globalThis.fetch=originalFetch;}
});
