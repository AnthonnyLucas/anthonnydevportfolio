import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveProjectTechnologies} from '../public/assets/project-technology-view.js';
import projectEndpoint from '../netlify/functions/projects.mjs';
import techEndpoint from '../netlify/functions/technologies.mjs';
import {getStore,reset} from './mock-blobs.mjs';
const contents=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const get=async(fn,path)=>{
  const r=await fn(new Request('https://portfolio.test/.netlify/functions/'+path));
  return {status:r.status,body:await r.json()};
};
test('v5.15: tecnologias visíveis no projeto selecionado mesmo com resposta antiga apenas por IDs',()=>{
  const library=[
    {id:'java',label:'Java',icon:'☕',color:'#E76F37',logoUrl:''},
    {id:'python',label:'Python',icon:'Py',color:'#3676AB',logoUrl:''},
    {id:'angular',label:'Angular',icon:'A',color:'#EF637A',logoUrl:''}
  ];
  assert.deepEqual(resolveProjectTechnologies({technologyIds:['java','python']},library).map(t=>t.label),['Java','Python']);
  assert.equal(resolveProjectTechnologies({technologyIds:['java']},library)[0].color,'#E76F37');
  assert.deepEqual(resolveProjectTechnologies({technologyIds:['angular']},library).map(t=>t.label),['Angular']);
  assert.deepEqual(resolveProjectTechnologies({technologyIds:[],tags:['Java'],technologies:[{id:'java',label:'Java'}]},library),[], 'lista vazia explícita não volta a inventar ferramentas');
  assert.deepEqual(resolveProjectTechnologies({tags:['Java','Python']},library),[], 'categorias/tags não adicionam tecnologias sem vínculo');
  assert.deepEqual(resolveProjectTechnologies({technologyIds:['java','java']},library).map(t=>t.label),['Java']);
  const historic={technologyIds:['gone'],technologySnapshots:[{id:'gone',label:'Tecnologia desativada',icon:'T',color:'#123456'}]};
  assert.deepEqual(resolveProjectTechnologies(historic,library).map(t=>t.label),['Tecnologia desativada']);
  assert.deepEqual(resolveProjectTechnologies({technologies:['Java','Python']},library).map(t=>t.label),['Java','Python']);
});
test('v5.15: retorno real de projetos se vincula ao catálogo e usa as cores salvas',async()=>{
  reset();
  const result=await get(techEndpoint,'technologies');
  const java=result.body.technologies.find(t=>t.label==='Java');
  await getStore('portfolio-projects').setJSON('projects',[{id:'id-aqua',title:'Projeto AQUA',description:'Exemplo',category:'IoT',categories:['iot'],technologyIds:[java.id],technologySnapshots:[java]}]);
  const projects=await get(projectEndpoint,'projects');
  assert.equal(projects.status,200);
  assert.equal(projects.body.projects[0].technologies[0].label,'Java');
  const resolved=resolveProjectTechnologies(projects.body.projects[0],result.body.technologies);
  assert.deepEqual(resolved.map(t=>t.label),['Java']);
  assert.equal(resolved[0].color,'#E76F37');
});
test('v5.15: proteção contra JavaScript em cache e aparência colorida em dark/light',()=>{
  const main=contents('public/assets/main.js');
  const publicHtml=contents('public/index.html');
  const adminHtml=contents('public/admin/index.html');
  const card=contents('public/assets/project-carousel.js');
  const css=contents('public/assets/v5-15.css');
  assert.match(main,/project-carousel\.js\?v=5\.15\.0/);
  assert.match(publicHtml,/main\.js\?v=5\.15\.0/);
  assert.match(adminHtml,/admin\.js\?v=5\.15\.0/);
  assert.match(publicHtml,/v5-15\.css\?v=5\.15\.0/);
  assert.match(card,/resolveProjectTechnologies\(project,technologyCatalog\)/);
  assert.match(card,/\/\.netlify\/functions\/technologies/);
  assert.match(card,/--tech-accent/);
  assert.match(css,/backdrop-filter:blur/);
  assert.match(css,/html\[data-theme="light"\]/);
  assert.match(css,/project-tech-name/);
  assert.match(contents('public/assets/admin.js'),/Ferramentas vinculadas:/);
});
