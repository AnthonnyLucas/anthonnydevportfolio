import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/admin.js', import.meta.url), 'utf8');
const cmsSource = readFileSync(new URL('../public/assets/cms-admin.js', import.meta.url), 'utf8');
const between = (start, end) => {
  const i=source.indexOf(start),j=source.indexOf(end,i+start.length);
  assert.ok(i>=0 && j>i,`trecho ausente: ${start}`);
  return source.slice(i,j);
};

class FakeElement {
  constructor(tag='div'){
    this.tag=tag; this.children=[]; this.textContent=''; this.value=''; this.hidden=false;
    this.className='';this.listeners={};this.attributes={};this.classList={toggle:()=>{}};
  }
  append(...els){this.children.push(...els);}
  replaceChildren(...els){this.children=[...els];}
  addEventListener(evt,callback){this.listeners[evt]=callback;}
  setAttribute(k,v){this.attributes[k]=v;}
}
const stubDom=()=>{
  const selectors=['#certificate-count','#admin-cert-list','#cert-search','#cert-filter','#cert-list-summary','#cert-show-all','#certificates-panel'];
  const elems=Object.fromEntries(selectors.map(sel=>[sel,new FakeElement()]));
  elems['#cert-filter'].value='all';
  return {elems,qs:sel=>{assert.ok(elems[sel],`DOM inexistente: ${sel}`);return elems[sel];}};
};

test('v5.18: o renderizador de certificados não acessa variável de projeto e exibe registros salvos',()=>{
  const {qs,elems}=stubDom();
  const state={certificates:[
    {id:'cert-1',name:'Inteligência Artificial',org:'Facti',groupId:'ia',hours:'240 horas'},
    {id:'cert-2',name:'Computação em Nuvem',org:'Escola A',groupId:'cloud',hours:'60 horas'}
  ],certShowAll:false};
  const context=vm.createContext({qs,state,document:{createElement:tag=>new FakeElement(tag)},
    categoryManager:{certificates:[{id:'ia',label:'IA'},{id:'cloud',label:'Cloud'}]},
    editCertificate(){},certField(){},resetCertForm(){},request:async()=>({}),showStatus(){}});
  vm.runInContext(between('function renderCertList()',"qs('#cert-search').addEventListener"),context);
  vm.runInContext('renderCertList()',context);
  assert.equal(elems['#certificate-count'].textContent,'2');
  assert.equal(elems['#admin-cert-list'].children.length,2);
  assert.equal(elems['#cert-list-summary'].textContent,'2 de 2 resultados');
  assert.equal(elems['#admin-cert-list'].children[0].children[0].children[0].textContent,'Inteligência Artificial');
  assert.ok(!between('function renderCertList()',"qs('#cert-search').addEventListener").includes('project.technologies'));
});

function refreshHarness({failCategories=false,failCertApi=false,failCertRender=false,cmsErrors=[]}={}){
  const events=[];
  const state={projects:[],certificates:[]};
  const ctx=vm.createContext({state,
    categoryManager:{async refresh(){events.push('categories');if(failCategories)throw new Error('categorias offline');}},
    async request(url){events.push('get:'+url);
      if(url.endsWith('projects'))return {projects:[{title:'Smart Solar Home'}]};
      if(url.endsWith('certificates')){
        if(failCertApi)throw new Error('certificados offline');
        return {certificates:[{name:'Visão Computacional'}]};
      }
      throw new Error('rota não encontrada');
    },
    async refreshProjectTechnologies(){events.push('picker');return null;},
    cmsAdmin:{async refresh(){events.push('cms');return cmsErrors;}},
    renderList(){events.push('projects-render');},
    renderCertList(){events.push('cert-render');if(failCertRender)throw new Error('erro de renderização');}
  });
  vm.runInContext(between('async function refresh()','async function init()'),ctx);
  return {run:()=>vm.runInContext('refresh()',ctx),state,events};
}
test('v5.18: projetos, formações, seletor e CMS carregam juntos',async()=>{
  const h=refreshHarness();
  await h.run();
  assert.equal(h.state.projects[0].title,'Smart Solar Home');
  assert.equal(h.state.certificates[0].name,'Visão Computacional');
  for(const evt of ['categories','picker','cms','projects-render','cert-render'])assert.ok(h.events.includes(evt),evt);
});
test('v5.18: problema na listagem de certificados não oculta o CMS e tecnologias',async()=>{
  const h=refreshHarness({failCertRender:true});
  await assert.rejects(h.run(),/Lista de formações: erro de renderização/);
  assert.equal(h.state.projects.length,1);
  assert.equal(h.state.certificates.length,1);
  for(const evt of ['picker','cms','projects-render'])assert.ok(h.events.includes(evt));
});
test('v5.18: falha da API de certificados não impede outros registros de carregarem',async()=>{
  const h=refreshHarness({failCertApi:true});
  await assert.rejects(h.run(),/Formações: certificados offline/);
  assert.equal(h.state.projects.length,1);
  assert.ok(h.events.includes('cms')&&h.events.includes('projects-render'));
  assert.ok(!h.events.includes('cert-render'));
});
test('v5.18: falha de categorias ou tecnologias é informada sem esconder o resto',async()=>{
  const h=refreshHarness({failCategories:true,cmsErrors:['Tecnologias: indisponíveis']});
  await assert.rejects(h.run(),/Categorias: categorias offline.*Tecnologias: indisponíveis/);
  assert.ok(h.events.includes('projects-render')&&h.events.includes('cert-render'));
});
test('v5.18: o painel solicita JavaScript atualizado e preserva área de tecnologias',()=>{
  const html=readFileSync(new URL('../public/admin/index.html',import.meta.url),'utf8');
  assert.match(html,/admin\.js\?v=5\.18\.0/);
  assert.match(source,/cms-admin\.js\?v=5\.18\.0/);
  assert.match(cmsSource,/Promise\.allSettled/);
  for(const id of ['admin-tech-list','admin-cert-list','admin-project-list'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(source,/renderCertList\(\)/);
});

test('v5.18: endpoints mantêm registros personalizados de Netlify Blobs sem recriar os padrões',async()=>{
  const {reset,getStore}=await import('./mock-blobs.mjs');
  const {default:certEndpoint}=await import('../netlify/functions/certificates.mjs');
  const {default:techEndpoint}=await import('../netlify/functions/technologies.mjs');
  const {default:projEndpoint}=await import('../netlify/functions/projects.mjs');
  reset();
  const savedTechs=Array.from({length:29},(_,i)=>({id:`saved-tech-${i}`,label:`Tecnologia ${i+1}`,cat:'linguagens',icon:'T',color:'#aabbcc',logoUrl:''}));
  const savedCerts=Array.from({length:18},(_,i)=>({id:`saved-course-${i}`,name:`Formação ${i+1}`,org:'Instituição',hours:'30 horas',type:'Curso concluído',description:'Descrição',group:'Inteligência Artificial',groupId:'inteligencia-artificial'}));
  const savedProjects=[{id:'saved-solar',title:'Smart Solar Home',description:'Automação e energia solar',categories:['iot'],category:'IoT',technologyIds:['saved-tech-0'],technologySnapshots:[{id:'saved-tech-0',label:'Tecnologia 1',icon:'T',color:'#aabbcc',logoUrl:''}],tags:[]}];
  await Promise.all([
    getStore('portfolio-technologies').setJSON('technologies',savedTechs),
    getStore('portfolio-certificates').setJSON('certificates',savedCerts),
    getStore('portfolio-projects').setJSON('projects',savedProjects)
  ]);
  const fetchJson=async(fn,name)=>{
    const response=await fn(new Request(`https://portfolio.test/.netlify/functions/${name}`));
    assert.equal(response.status,200);
    return response.json();
  };
  const [techs,certs,projs]=await Promise.all([
    fetchJson(techEndpoint,'technologies'),fetchJson(certEndpoint,'certificates'),fetchJson(projEndpoint,'projects')
  ]);
  assert.equal(techs.technologies.length,29);
  assert.equal(certs.certificates.length,18);
  assert.equal(projs.projects[0].title,'Smart Solar Home');
  assert.equal(projs.projects[0].technologies[0].label,'Tecnologia 1');
  assert.equal((await getStore('portfolio-certificates').get('certificates',{type:'json'})).length,18);
  assert.equal((await getStore('portfolio-technologies').get('technologies',{type:'json'})).length,29);
});
