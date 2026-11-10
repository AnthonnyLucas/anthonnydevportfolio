// Catálogo pesquisável de logotipos Devicon + ícone genérico de Assembly.
// Marcas pertencem aos respectivos titulares. O ícone ASM é ilustrativo (Assembly não possui uma marca universal).
const catalogText = `
Android|android
Angular|angular
Ansible|ansible
Apache|apache
Apache Kafka|apachekafka
Apache Spark|apachespark
Arduino|arduino
Assembly|assembly
Astro|astro
AWS|amazonwebservices
Azure|azure
Babel|babel
Bash|bash
Bootstrap|bootstrap
Bulma|bulma
C|c
C++|cplusplus
C#|csharp
Clojure|clojure
Cloudflare|cloudflare
CMake|cmake
Cobol|cobol
CodeIgniter|codeigniter
Composer|composer
CouchDB|couchdb
CSS3|css3
Dart|dart
Debian|debian
Deno|deno
Django|django
Docker|docker
Dotnet|dotnetcore
Drupal|drupal
Elasticsearch|elasticsearch
Electron|electron
Elixir|elixir
Emacs|emacs
Ember|ember
Express|express
FastAPI|fastapi
Fedora|fedora
Figma|figma
Firebase|firebase
Flask|flask
Flutter|flutter
Fortran|fortran
Gatsby|gatsby
GCC|gcc
Git|git
GitHub|github
GitLab|gitlab
Go|go
Google Cloud|googlecloud
Gradle|gradle
Grafana|grafana
GraphQL|graphql
Groovy|groovy
Gulp|gulp
Hadoop|hadoop
Haskell|haskell
HTML5|html5
Hugo|hugo
Illustrator|illustrator
InfluxDB|influxdb
IntelliJ IDEA|intellij
Ionic|ionic
Java|java
JavaScript|javascript
Jenkins|jenkins
Jest|jest
Jira|jira
Joomla|joomla
jQuery|jquery
Julia|julia
Jupyter|jupyter
K3s|k3s
Keras|keras
Kotlin|kotlin
Kubernetes|kubernetes
Laravel|laravel
LaTeX|latex
Less|less
Linux|linux
Lua|lua
MariaDB|mariadb
Matlab|matlab
Maven|maven
Meteor|meteor
Microsoft SQL Server|microsoftsqlserver
MongoDB|mongodb
MySQL|mysql
NestJS|nestjs
Netlify|netlify
Next.js|nextjs
Nginx|nginx
Nim|nim
Node.js|nodejs
NPM|npm
Nuxt|nuxtjs
Objective-C|objectivec
OpenCV|opencv
OpenGL|opengl
OpenStack|openstack
Oracle|oracle
Pandas|pandas
Perl|perl
Photoshop|photoshop
PHP|php
Playwright|playwright
PostgreSQL|postgresql
Postman|postman
PowerShell|powershell
Prometheus|prometheus
PyCharm|pycharm
PyTorch|pytorch
Python|python
R|r
RabbitMQ|rabbitmq
Rails|rails
Raspberry Pi|raspberrypi
React|react
React Native|reactnative
Redis|redis
Redux|redux
Ruby|ruby
Rust|rust
Sass|sass
Scala|scala
Selenium|selenium
Svelte|svelte
Swift|swift
Symfony|symfony
Tailwind CSS|tailwindcss
TensorFlow|tensorflow
Terraform|terraform
Three.js|threejs
Tomcat|tomcat
TypeScript|typescript
Ubuntu|ubuntu
Unity|unity
Unreal Engine|unrealengine
Vagrant|vagrant
Vim|vim
Visual Studio|visualstudio
VS Code|vscode
Vite|vitejs
Vue.js|vuejs
WebAssembly|wasm
Webpack|webpack
Windows|windows8
WordPress|wordpress
Xamarin|xamarin
XML|xml
YAML|yaml
Yarn|yarn
Zig|zig
`;
const localIcons = {
  'Android': 'android',
  'Angular': 'angular',
  'AWS': 'aws',
  'Bootstrap': 'bootstrap',
  'Cloudflare': 'cloudflare',
  'CSS3': 'css3-alt',
  'Docker': 'docker',
  'Drupal': 'drupal',
  'Figma': 'figma',
  'Git': 'git',
  'GitHub': 'github',
  'GitLab': 'gitlab',
  'Google Cloud': 'google',
  'HTML5': 'html5',
  'Java': 'java',
  'JavaScript': 'js',
  'Laravel': 'laravel',
  'Linux': 'linux',
  'Node.js': 'node-js',
  'NPM': 'npm',
  'PHP': 'php',
  'Python': 'python',
  'R': 'r-project',
  'Raspberry Pi': 'raspberry-pi',
  'React': 'react',
  'Rust': 'rust',
  'Sass': 'sass',
  'Swift': 'swift',
  'Symfony': 'symfony',
  'Ubuntu': 'ubuntu',
  'Unity': 'unity',
  'Vue.js': 'vuejs',
  'WordPress': 'wordpress',
  'Yarn': 'yarn',
  'Windows': 'windows',
  'Flutter': 'flutter',
  'Less': 'less',
  'Jira': 'jira',
  'Jenkins': 'jenkins'
};
export const techIconCatalog=catalogText.trim().split('\n').map(line=>{
  const [name,slug]=line.split('|');
  const url=slug==='assembly'?'/assets/tech-logos/assembly.svg':localIcons[name]?`/assets/tech-icon-library/${localIcons[name]}.svg`:`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
  return {name,slug,url};
}).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
// Complemento v5.12: índices oficiais obtidos sob demanda da API pública Iconify.
// O catálogo local (156 entradas, 39 SVGs locais) permanece disponível sem internet.
// As listas de nomes são reais, fornecidas pelas coleções; não inventamos slugs ou logotipos.
export const ICONIFY_COLLECTIONS = Object.freeze([
  {id:'devicon', name:'Devicon', license:'MIT', description:'Linguagens, frameworks, infraestrutura, hardware e ferramentas de desenvolvimento'},
  {id:'logos', name:'SVG Logos', license:'CC0', description:'Marcas e logotipos vetoriais do ecossistema de tecnologia'},
  {id:'simple-icons', name:'Simple Icons', license:'CC0-1.0', description:'Marcas, produtos, plataformas, ferramentas e serviços tecnológicos'}
]);
const CACHE_VERSION='v1';
const TTL=7*24*60*60*1000;
const PAGE_SIZE=48;
const MAX_COLLECTION_ENTRIES=12000;
const validSlug=/^[a-z0-9][a-z0-9._-]{0,110}$/i;
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu,' ').trim();

export function collectionIconNames(payload){
  if(!payload || typeof payload!=='object') return [];
  const names=[...(Array.isArray(payload.uncategorized)?payload.uncategorized:[])];
  if(payload.categories && typeof payload.categories==='object'){
    for(const list of Object.values(payload.categories))if(Array.isArray(list))names.push(...list);
  }
  return [...new Set(names.filter(name=>typeof name==='string' && validSlug.test(name)))].slice(0,MAX_COLLECTION_ENTRIES);
}
export function iconifyItems(prefix,names){
  if(!ICONIFY_COLLECTIONS.some(source=>source.id===prefix))return [];
  if(!Array.isArray(names))return [];
  return [...new Set(names.filter(name=>typeof name==='string'&&validSlug.test(name)))].map(slug=>({
    name:slug.replace(/[-_.]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    slug, provider:prefix,
    url:`https://api.iconify.design/${prefix}/${slug}.svg`,
    searchText:normalize(slug)
  }));
}
export function filterIconCatalog(items,search='',source='all'){
  const words=normalize(search).split(/\s+/).filter(Boolean);
  return items.filter(item=>(source==='all'||(source==='local'?(item.provider||'local')==='local':item.provider===source)) &&
    words.every(w=>(item.searchText||normalize(item.name+' '+item.slug)).includes(w)));
}

// Recupera metadados de coleções (apenas nomes). As imagens não são pré-carregadas.
async function downloadCollection(prefix,{refresh=false}={}){
  const key=`portfolio-icon-index-${CACHE_VERSION}-${prefix}`;
  if(!refresh){
    try{
      const stored=JSON.parse(localStorage.getItem(key)||'null');
      if(stored && Date.now()-stored.at<TTL && Array.isArray(stored.names) && stored.names.length>100){
        return stored.names;
      }
    }catch{}
  }
  const fetchOnce=async(url)=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),11000);
    try{return await fetch(url,{signal:controller.signal});}
    finally{clearTimeout(timeout);}
  };
  let response;
  try {response=await fetchOnce(`https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}`);}catch{}
  // Na produção, o proxy da Netlify evita falhas ocasionais de CORS/adblock.
  // Usa timeout próprio: se a primeira tentativa expirar, a segunda ainda funciona.
  if(!response?.ok)response=await fetchOnce(`/.netlify/functions/icon-library?source=${encodeURIComponent(prefix)}`);
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const json=await response.json();
  // O proxy retorna names[] compacto, enquanto a API oficial retorna categories/uncategorized.
  const names=Array.isArray(json.names)?json.names.filter(n=>typeof n==='string'&&validSlug.test(n)):collectionIconNames(json);
  if(names.length<100)throw new Error('Coleção incompleta');
  try{localStorage.setItem(key,JSON.stringify({at:Date.now(),names}));}catch{}
  return names;
}
export function setupIconCatalog({onSelect}){
  const input=document.querySelector('#tech-icon-search');
  const grid=document.querySelector('#tech-icon-catalog');
  const count=document.querySelector('#tech-icon-count');
  const more=document.querySelector('#tech-icon-more');
  const sourceInput=document.querySelector('#tech-icon-source');
  const status=document.querySelector('#tech-icon-status');
  const retry=document.querySelector('#tech-icon-retry');
  if(!input||!grid||!count||!more)throw new Error('Seletor de ícones não encontrado.');
  let visibleCount=PAGE_SIZE;
  let library=[...techIconCatalog.map(item=>({...item,provider:'local',searchText:normalize(item.name+' '+item.slug)}))];
  let failures=[];
  let loading=false;
  let selectedUrl='';
  const selectionLabel=()=>document.querySelector('#technology-logo-url')?.value||selectedUrl;
  const sourceName=source=>ICONIFY_COLLECTIONS.find(s=>s.id===source)?.name||'Coleção local';

  function render(){
    const query=input.value.trim();
    const selectedSource=sourceInput?.value||'all';
    const found=filterIconCatalog(library,query,selectedSource);
    const visible=found.slice(0,visibleCount);
    grid.replaceChildren();
    for(const item of visible){
      const button=document.createElement('button');
      button.type='button';button.className='catalog-logo-choice';button.title=`${item.name} • ${sourceName(item.provider)}`;
      button.setAttribute('aria-label',`Selecionar logotipo de ${item.name} (${sourceName(item.provider)})`);
      button.setAttribute('aria-pressed',String(item.url===selectionLabel()));
      const fallback=document.createElement('span');fallback.className='catalog-logo-fallback';
      fallback.textContent=item.name.replace(/[^\p{L}\p{N}]+/gu,' ').trim().slice(0,3).toUpperCase();
      const img=document.createElement('img');img.src=item.url;img.alt='';img.loading='lazy';img.decoding='async';
      img.addEventListener('load',()=>{fallback.style.opacity='0';},{once:true});
      img.addEventListener('error',()=>{img.remove();fallback.style.opacity='1';},{once:true});
      const caption=document.createElement('small');caption.textContent=item.name;
      const collection=document.createElement('span');collection.className='catalog-logo-source';collection.textContent=sourceName(item.provider);
      button.append(fallback,img,caption,collection);
      button.addEventListener('click',()=>{selectedUrl=item.url;onSelect(item);render();});
      grid.append(button);
    }
    const remoteCount=library.filter(item=>item.provider!=='local').length;
    count.textContent=`Exibindo ${visible.length} de ${found.length} resultados · ${library.length.toLocaleString('pt-BR')} ícones indexados${loading?' · carregando bibliotecas...':''}.`;
    more.hidden=found.length<=visibleCount;
    more.textContent=`Mostrar mais ${Math.min(PAGE_SIZE,found.length-visibleCount)} logotipos`;
    if(status){
      if(loading)status.textContent=`Carregando Devicon, SVG Logos e Simple Icons. As ${techIconCatalog.length} opções anteriores permanecem disponíveis.`;
      else if(failures.length)status.textContent=`${remoteCount.toLocaleString('pt-BR')} ícones externos carregados. Não foi possível obter: ${failures.map(sourceName).join(', ')}. Tente novamente; o catálogo local continua funcionando.`;
      else status.textContent=`Acervo ampliado disponível: ${library.length.toLocaleString('pt-BR')} opções (incluindo ${techIconCatalog.length} do catálogo anterior).`;
    }
    if(retry)retry.hidden=loading||!failures.length;
  }

  async function load({refresh=false}={}){
    if(loading)return;
    loading=true;failures=[];render();
    const results=await Promise.allSettled(ICONIFY_COLLECTIONS.map(source=>downloadCollection(source.id,{refresh})));
    const lists=[];
    for(let i=0;i<results.length;i++){
      if(results[i].status==='fulfilled')lists.push(...iconifyItems(ICONIFY_COLLECTIONS[i].id,results[i].value));
      else failures.push(ICONIFY_COLLECTIONS[i].id);
    }
    // Deduplicação por ID de coleção, não por nome: marcas com estilos diferentes
    // são opções legítimas para quem deseja escolher um SVG específico.
    const map=new Map();
    for(const item of [...library.filter(item=>item.provider==='local'),...lists])map.set(`${item.provider}:${item.slug}`,item);
    library=[...map.values()];
    loading=false;render();
  }
  input.addEventListener('input',()=>{visibleCount=PAGE_SIZE;render();});
  sourceInput?.addEventListener('change',()=>{visibleCount=PAGE_SIZE;render();});
  more.addEventListener('click',()=>{visibleCount+=PAGE_SIZE;render();});
  document.querySelector('#tech-icon-clear')?.addEventListener('click',()=>{input.value='';if(sourceInput)sourceInput.value='all';visibleCount=PAGE_SIZE;render();});
  retry?.addEventListener('click',()=>load({refresh:true}));
  document.querySelector('#technology-name')?.addEventListener('input',event=>{
    if(event.target.value.trim().length>=2){input.value=event.target.value.trim();visibleCount=PAGE_SIZE;render();}
  });
  render();
  // Não bloqueia a inicialização do dashboard nem os formulários.
  Promise.resolve().then(()=>load()).catch(()=>{loading=false;failures=ICONIFY_COLLECTIONS.map(s=>s.id);render();});
  return {render,load,getTotal:()=>library.length,getFailureSources:()=>[...failures]};
}
