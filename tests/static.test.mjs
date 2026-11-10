import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const read=path=>readFileSync(resolve(path),'utf8');
function htmlIds(path){
 const html=read(path);return [...html.matchAll(/\bid="([^"\s]+)"/g)].map(m=>m[1]);
}
test('public and admin pages have unique control IDs and module assets',()=>{
 for (const path of ['public/index.html','public/admin/index.html']){
   const ids=htmlIds(path);
   assert.equal(ids.length,new Set(ids).size,`Duplicate HTML id in ${path}`);
   const html=read(path);
   for(const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)){
     assert.ok(existsSync(resolve('public'+m[1])),`${m[1]} missing`);
   }
 }
});
test('public project showcase, admin category controls, searchable catalogs and sidebar',()=>{
 const publicHTML=read('public/index.html');const admin=read('public/admin/index.html');
 for (const id of ['project-viewport','project-grid','project-filters','project-prev','project-next','sidebar-brand-icon','sidebar-custom-links'])assert.ok(publicHTML.includes(`id="${id}"`),id);
 for (const id of ['project-category-picker','project-category-add','project-category-list','cert-category-add','cert-category-list','project-search','project-filter','cert-search','cert-filter','tech-search','tech-filter','tech-icon-catalog','tech-show-all','project-show-all','cert-show-all'])assert.ok(admin.includes(`id="${id}"`),id);
 assert.match(publicHTML,/sidebar-social-icon/);
 const styles=read('public/assets/v5.css');assert.match(styles,/calc\(\(100% - 20px\)\/2\)/);assert.match(styles,/\.admin-scroll-list/);
});
test('all relative imports resolve to included files',()=>{
 for(const file of ['public/assets/main.js','public/assets/admin.js','public/assets/cms-admin.js','public/assets/project-carousel.js','public/assets/tech-icon-catalog.js','public/assets/category-admin.js','public/assets/cert-carousel.js','netlify/functions/projects.mjs','netlify/functions/categories.mjs','netlify/functions/certificates.mjs']){
  const text=read(file);
  for(const m of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g))assert.ok(existsSync(resolve(dirname(file),m[1])),`${file} -> ${m[1]}`);
 }
});

test('technologies panel has category CRUD controls, searchable logos, and aligned independent scrolling',()=>{
  const admin=readFileSync(new URL('../public/admin/index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('../public/assets/v5.css',import.meta.url),'utf8');
  const cms=readFileSync(new URL('../public/assets/cms-admin.js',import.meta.url),'utf8');
  const catalog=readFileSync(new URL('../public/assets/tech-icon-catalog.js',import.meta.url),'utf8');
  for(const id of ['tech-search','tech-filter','technology-category-name','technology-category-add','technology-category-list','tech-category-shortcut','tech-icon-search','tech-icon-catalog','tech-icon-more'])assert.ok(admin.includes(`id="${id}"`),`missing ${id}`);
  assert.ok(css.includes('--tech-editor-height'));
  assert.ok(cms.includes("Promise.allSettled"));
  assert.ok(catalog.includes('localIcons'));
});


test('v5.2: Ver todas as tecnologias expande somente a lista e preserva a altura do editor',()=>{
  const css=read('public/assets/v5.css');
  const js=read('public/assets/cms-admin.js');
  const html=read('public/admin/index.html');
  assert.match(css,/v5\.2 — Só Tecnologias/);
  assert.match(css,/#technologies-panel\.tech-list-expanded #admin-tech-list/);
  assert.match(css,/height: var\(--tech-editor-height, 1100px\)/);
  assert.match(css,/#technologies-panel\.tech-list-expanded \.tech-category-manager\[open\]/);
  assert.match(js,/classList\.toggle\('tech-list-expanded',expanded\)/);
  assert.match(js,/setAttribute\('aria-expanded',String\(expanded\)\)/);
  assert.match(html,/id="tech-show-all"[^>]+aria-controls="admin-tech-list"/);
});


test('v5.6 uses floating side navigation across all showcases and editable sidebar contacts', async()=>{
 const html=read('public/index.html');
 const css=read('public/assets/v5-6.css');
 const schema=await import('../public/assets/site-schema.js');
 for(const id of ['tech-prev','tech-next','project-prev','project-next','cert-prev','cert-next','sidebar-gmail','sidebar-whatsapp']){
  assert.ok(html.includes(`id="${id}"`),id);
  assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
 }
 for(const cls of ['tech-carousel-navigation glass-carousel-nav','project-nav glass-carousel-nav','cert-nav glass-carousel-nav'])assert.ok(html.includes(cls),cls);
 for(const selector of ['.glass-carousel-nav','.glass-nav-button','.sidebar-social-icon-pending'])assert.ok(css.includes(selector),selector);
 assert.equal(schema.contentDefaults.whatsappUrl,'');
 assert.equal(schema.contentFields.find(f=>f.key==='whatsappUrl')?.group,'geral');
 const client=read('public/assets/content-client.js');
 assert.ok(client.includes("#sidebar-whatsapp"));
 assert.ok(client.includes("#sidebar-gmail"));
});
