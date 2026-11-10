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
export const techIconCatalog=catalogText.trim().split('\n').map(line=>{
  const [name,slug]=line.split('|');
  const url=slug==='assembly'?'/assets/tech-logos/assembly.svg':`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
  return {name,slug,url};
}).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
export function setupIconCatalog({onSelect}){
  const input=document.querySelector('#tech-icon-search');
  const grid=document.querySelector('#tech-icon-catalog');
  const count=document.querySelector('#tech-icon-count');
  const selectionLabel=()=>document.querySelector('#technology-logo-url')?.value||'';
  function render(){
    const search=input.value.trim().toLocaleLowerCase('pt-BR');
    const found=techIconCatalog.filter(item=>item.name.toLocaleLowerCase('pt-BR').includes(search)||item.slug.includes(search));
    grid.replaceChildren();
    const visible=found.slice(0,48);
    for(const item of visible){
      const button=document.createElement('button');button.type='button';button.className='catalog-logo-choice';button.title=item.name;
      button.setAttribute('aria-label',`Selecionar logotipo de ${item.name}`);
      button.setAttribute('aria-pressed',String(item.url===selectionLabel()));
      const img=document.createElement('img');img.src=item.url;img.alt='';img.loading='lazy';img.decoding='async';
      img.addEventListener('error',()=>{img.remove();const fallback=document.createElement('span');fallback.className='catalog-logo-fallback';fallback.textContent=item.name.slice(0,3).toUpperCase();button.prepend(fallback);},{once:true});
      const caption=document.createElement('small');caption.textContent=item.name;
      button.append(img,caption);button.addEventListener('click',()=>{onSelect(item);render();});grid.append(button);
    }
    count.textContent=`${found.length} logotipo(s) encontrado(s) de ${techIconCatalog.length} opções. ${found.length>48?'Refine a busca para ver os demais.':''}`;
  }
  input.addEventListener('input',render);
  document.querySelector('#tech-icon-clear').addEventListener('click',()=>{input.value='';render();});
  document.querySelector('#technology-name').addEventListener('input',event=>{
    if(event.target.value.trim().length>=2){input.value=event.target.value.trim();render();}
  });
  render();return {render};
}
