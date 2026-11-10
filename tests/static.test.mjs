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
