import { initTheme } from './theme-controls.js';
import { initParticles } from './particles.js';
initTheme();
initParticles({ admin: true });
import { setupCmsAdmin } from './cms-admin.js';
import { setupCategoryAdmin } from './category-admin.js';
import { createAdminFeedback } from './admin-feedback.js';
const qs = selector => document.querySelector(selector);
const state = { projects: [], certificates: [], projectShowAll:false, certShowAll:false, imageUrl: '', pendingPreview: null, certImageUrl: '', certPendingPreview: null };
const status = qs('#admin-status');
const {showStatus} = createAdminFeedback({status,toast:qs('#admin-toast')});
const showLogin = () => { qs('#login-panel').hidden = false; qs('#dashboard').hidden = true; };
const showDashboard = () => { qs('#login-panel').hidden = true; qs('#dashboard').hidden = false; };
const request = async (url, options = {}) => {
  let res;
  try { res = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options }); }
  catch { throw new Error('Sem conexão com as funções Netlify. Para testar localmente use npm run dev; na hospedagem, publique todo o projeto pelo Git.'); }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('A API administrativa não está disponível neste endereço. O site está em modo estático ou as funções Netlify não foram publicadas. Confira o guia CONFIGURAR_LOGIN_NETLIFY.md.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) showLogin();
    throw new Error(data.error || `Falha na operação (HTTP ${res.status}).`);
  }
  return data;
};
const cmsAdmin = setupCmsAdmin({request,showStatus});
const categoryManager = setupCategoryAdmin({request,showStatus,onUpdate:()=>{renderList();renderCertList();}});
const categoriesFor = item => Array.isArray(item.categories) && item.categories.length?item.categories:categoryManager.projects.filter(cat=>cat.label===item.category).map(cat=>cat.id);
const preview = url => {
  const area = qs('#image-preview');
  area.replaceChildren();
  if (url) {
    const img = document.createElement('img');
    img.alt = 'Prévia da imagem do projeto';
    img.src = url;
    area.append(img);
  } else {
    const span = document.createElement('span'); span.textContent = 'Nenhuma imagem selecionada'; area.append(span);
  }
};
function releasePreview() {
  if (state.pendingPreview) URL.revokeObjectURL(state.pendingPreview);
  state.pendingPreview = null;
}
function clearForm() {
  qs('#project-form').reset();
  categoryManager.selectProject([]);
  qs('#project-id').value = '';
  qs('#editor-title').textContent = 'Novo projeto';
  state.imageUrl = '';
  releasePreview();
  preview('');
}
function editProject(project) {
  clearForm();
  qs('#project-id').value = project.id;
  qs('#project-title').value = project.title || '';
  categoryManager.selectProject(categoriesFor(project));
  qs('#project-desc').value = project.description || '';
  qs('#project-tags').value = (project.tags || []).join(', ');
  qs('#project-repo').value = project.repository || '';
  qs('#project-demo').value = project.demo || '';
  qs('#project-image-url').value = project.image || '';
  qs('#project-featured').checked = Boolean(project.featured);
  state.imageUrl = project.image || '';
  preview(state.imageUrl);
  qs('#editor-title').textContent = 'Editar projeto';
  qs('#project-title').focus();
  qs('.editor-card').scrollIntoView({ behavior:'smooth', block:'start' });
}
function renderList() {
  qs('#project-count').textContent = String(state.projects.length);
  const list=qs('#admin-project-list');list.replaceChildren();
  const query=qs('#project-search').value.trim().toLocaleLowerCase('pt-BR');
  const category=qs('#project-filter').value;
  const matched=state.projects.filter(p=>p.title.toLocaleLowerCase('pt-BR').includes(query) && (category==='all'||categoriesFor(p).includes(category)));
  const shown=state.projectShowAll?matched:matched.slice(0,5);
  qs('#project-list-summary').textContent=`${shown.length} de ${matched.length} resultados`;
  qs('#project-show-all').hidden=matched.length<=5;
  qs('#project-show-all').textContent=state.projectShowAll?'Mostrar menos':'Ver todos os projetos';
  if (!shown.length) {const box=document.createElement('p');box.className='list-empty';box.textContent='Nenhum projeto encontrado. Ajuste a busca ou a categoria.';list.append(box);return;}
  shown.forEach(project=>{
    const row=document.createElement('article');row.className='admin-list-item';
    const content=document.createElement('div');
    const title=document.createElement('h3');title.textContent=project.title;
    const meta=document.createElement('p');meta.textContent=categoriesFor(project).map(id=>categoryManager.projects.find(c=>c.id===id)?.label).filter(Boolean).join(' · ') + (project.featured?' · Em destaque':'');
    content.append(title,meta);
    const actions=document.createElement('div');actions.className='list-actions';
    const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.addEventListener('click',()=>editProject(project));
    const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='Excluir';
    remove.addEventListener('click',async()=>{
      if(!confirm(`Excluir o projeto “${project.title}”? Essa ação não pode ser desfeita.`))return;
      try {showStatus('Excluindo projeto...');const result=await request('/.netlify/functions/projects',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:project.id})});
        state.projects=result.projects||[];if(qs('#project-id').value===project.id)clearForm();renderList();showStatus('Projeto excluído.','success',{persisted:true});
      }catch(e){showStatus(e.message,'error');}
    });
    actions.append(edit,remove);row.append(content,actions);list.append(row);
  });
}
qs('#project-search').addEventListener('input',()=>{state.projectShowAll=false;renderList();});
qs('#project-filter').addEventListener('change',()=>{state.projectShowAll=false;renderList();});
qs('#project-show-all').addEventListener('click',()=>{state.projectShowAll=!state.projectShowAll;renderList();});
async function refresh() {
  await categoryManager.refresh();
  const [projectsResult, certResult] = await Promise.all([request('/.netlify/functions/projects'), request('/.netlify/functions/certificates')]);
  state.projects = projectsResult.projects || [];
  state.certificates = certResult.certificates || [];
  renderList();
  renderCertList();
  await cmsAdmin.refresh();
}
async function init() {
  try {
    const auth=await request('/.netlify/functions/auth');
    if (auth.authenticated) {showDashboard();try {await refresh();showStatus('Acesso autorizado. Conteúdo, tecnologias, projetos e formações sincronizados.','success');} catch(error) {showStatus('Login válido, mas alguns dados não foram carregados: '+error.message,'error');}}
    else {showLogin(); showStatus(auth.configured ? 'Entre para gerenciar seu portfólio.' : 'O login ainda precisa ser configurado nas variáveis de ambiente da Netlify.',auth.configured ? '' : 'error');}
  } catch (error) {showLogin();showStatus(error.message || 'Não foi possível conectar às funções da Netlify. Para testar o painel, use npm run dev.','error');}
}
qs('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form=e.currentTarget;
  const submit=form.querySelector('button[type="submit"]');
  submit.disabled = true;
  showStatus('Verificando credenciais...');
  try {
    await request('/.netlify/functions/auth', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ email: qs('#login-email').value, password:qs('#login-password').value })});
    qs('#login-password').value = '';
    showDashboard();try {await refresh();showStatus('Login realizado. Gerenciamento de todas as seções disponível.','success');} catch(error) {showStatus('Login realizado, mas não foi possível carregar alguns dados: '+error.message,'error');}
  } catch(err) {showStatus(err.message,'error');}
  finally {submit.disabled=false;}
});
qs('#logout-btn').addEventListener('click',async()=>{
  try {await request('/.netlify/functions/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});}
  catch {/* O cookie também vai expirar automaticamente. */}
  showLogin();clearForm();showStatus('Sessão encerrada.');
});
qs('#new-project').addEventListener('click',()=>{clearForm();qs('#project-title').focus();qs('.editor-card').scrollIntoView({behavior:'smooth',block:'start'});});
qs('#clear-btn').addEventListener('click',clearForm);
qs('#project-image').addEventListener('change', event=>{
  releasePreview();
  const file=event.target.files?.[0];
  if (!file) {preview(state.imageUrl);return;}
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>4*1024*1024) {
    showStatus('Imagem inválida: selecione JPG, PNG, WebP ou GIF com até 4 MB.','error');event.target.value='';return;
  }
  state.pendingPreview = URL.createObjectURL(file);
  preview(state.pendingPreview);
});
qs('#project-image-url').addEventListener('change',event=>{
  if (!qs('#project-image').files?.length) {state.imageUrl=event.target.value.trim();preview(state.imageUrl);}
});
qs('#project-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const save=qs('#save-btn');save.disabled=true;
  showStatus('Salvando projeto...');
  try {
    let image = qs('#project-image-url').value.trim() || state.imageUrl;
    const file = qs('#project-image').files?.[0];
    if (file) {
      showStatus('Enviando imagem para o armazenamento da Netlify...');
      const upload=await fetch('/.netlify/functions/media',{ method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file });
      const info=await upload.json().catch(()=>({}));
      if (!upload.ok) throw new Error(info.error||'Falha no envio da imagem.');
      image=info.url;
    }
    if (image && !(/^\/.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(jpg|png|webp|gif)$/.test(image) || /^\/assets\/project-(solar|aqua|certificates|curves)\.svg$/.test(image))) {
      const url = new URL(image);
      if (!['https:','http:'].includes(url.protocol)) throw new Error('Use uma URL HTTP(S) válida para a imagem.');
    }
    const selectedCategories=categoryManager.selectedProjectIds();
    if(!selectedCategories.length)throw new Error('Selecione ao menos uma categoria para o projeto.');
    const body={ id:qs('#project-id').value||undefined, title:qs('#project-title').value, categories:selectedCategories,
      description:qs('#project-desc').value, tags:qs('#project-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
      image, repository:qs('#project-repo').value, demo:qs('#project-demo').value, featured:qs('#project-featured').checked };
    const data=await request('/.netlify/functions/projects',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body) });
    state.projects=data.projects||[];renderList();clearForm();
    showStatus('Projeto salvo com sucesso! Abra a página pública para visualizar.','success',{persisted:true});
  }catch(err){showStatus(err.message||'Falha ao salvar.','error',{failed:true});}
  finally{save.disabled=false;}
});

// --- Gerenciamento de formações no mesmo painel protegido do site ---
const certField = name => qs(`#certificate-${name}`);
function previewCertImage(url) {
  const panel = qs('#certificate-image-preview');
  panel.replaceChildren();
  if (url) {
    const img=document.createElement('img');img.alt='Prévia da imagem do certificado';img.src=url;panel.append(img);
  } else {const span=document.createElement('span');span.textContent='Nenhuma imagem cadastrada';panel.append(span);}
}
function releaseCertPreview() {
  if (state.certPendingPreview) URL.revokeObjectURL(state.certPendingPreview);
  state.certPendingPreview = null;
}
function resetCertForm() {
  qs('#certificate-form').reset();
  certField('id').value = '';
  qs('#cert-editor-title').textContent = 'Nova formação';
  state.certImageUrl = '';
  releaseCertPreview();
  previewCertImage('');
}
function editCertificate(course) {
  resetCertForm();
  certField('id').value = course.id;
  certField('name').value = course.name || '';
  certField('group').value = course.groupId || categoryManager.certificates.find(c=>c.label===course.group)?.id || ''; 
  certField('org').value = course.org || '';
  certField('hours').value = course.hours || '';
  certField('type').value = course.type || 'Participação';
  certField('desc').value = course.description || '';
  certField('image-url').value = course.image || '';
  state.certImageUrl = course.image || '';
  previewCertImage(state.certImageUrl);
  qs('#cert-editor-title').textContent = 'Editar formação';
  certField('name').focus();
  qs('.cert-editor-card').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderCertList() {
  qs('#certificate-count').textContent=String(state.certificates.length);
  const list=qs('#admin-cert-list');list.replaceChildren();
  const query=qs('#cert-search').value.trim().toLocaleLowerCase('pt-BR');
  const category=qs('#cert-filter').value;
  const matched=state.certificates.filter(item=>(item.name.toLocaleLowerCase('pt-BR').includes(query)||item.org.toLocaleLowerCase('pt-BR').includes(query)) && (category==='all'||item.groupId===category||categoryManager.certificates.find(c=>c.id===category)?.label===item.group));
  const shown=state.certShowAll?matched:matched.slice(0,5);
  qs('#cert-list-summary').textContent=`${shown.length} de ${matched.length} resultados`;
  qs('#cert-show-all').hidden=matched.length<=5;
  qs('#cert-show-all').textContent=state.certShowAll?'Mostrar menos':'Ver todas as formações';
  qs('#cert-show-all').setAttribute('aria-expanded',String(state.certShowAll && matched.length>5));
  qs('#certificates-panel').classList.toggle('cert-list-expanded',state.certShowAll && matched.length>5);
  if(!shown.length){const empty=document.createElement('p');empty.className='list-empty';empty.textContent='Nenhuma formação encontrada.';list.append(empty);return;}
  shown.forEach(course=>{
    const row=document.createElement('article');row.className='admin-list-item';
    const content=document.createElement('div');const title=document.createElement('h3');title.textContent=course.name;
    const meta=document.createElement('p');meta.textContent=`${categoryManager.certificates.find(c=>c.id===course.groupId)?.label || course.group} · ${course.hours}`;
    content.append(title,meta);
    const actions=document.createElement('div');actions.className='list-actions';
    const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.addEventListener('click',()=>editCertificate(course));
    const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='Excluir';
    remove.addEventListener('click',async()=>{
      if(!confirm(`Excluir a formação “${course.name}”?`))return;
      try{showStatus('Excluindo formação...');const result=await request('/.netlify/functions/certificates',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:course.id})});
        state.certificates=result.certificates||[];if(certField('id').value===course.id)resetCertForm();renderCertList();showStatus('Formação excluída.','success',{persisted:true});
      }catch(error){showStatus(error.message,'error');}
    });
    actions.append(edit,remove);row.append(content,actions);list.append(row);
  });
}
qs('#cert-search').addEventListener('input',()=>{state.certShowAll=false;renderCertList();});
qs('#cert-filter').addEventListener('change',()=>{state.certShowAll=false;renderCertList();});
// Medir o formulário ao lado permite expandir a lista até a área realmente
// disponível, em vez de mantê-la presa ao limite de 405px do modo compacto.
const certEditor=qs('.cert-editor-card');
function alignCertColumns(){
  if(window.matchMedia('(min-width: 931px)').matches){
    const height=Math.ceil(certEditor.getBoundingClientRect().height);
    if(height>0)qs('#certificates-panel').style.setProperty('--cert-editor-height',`${height}px`);
  }else qs('#certificates-panel').style.removeProperty('--cert-editor-height');
}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(alignCertColumns).observe(certEditor);
window.addEventListener('resize',alignCertColumns,{passive:true});
qs('#cert-show-all').addEventListener('click',()=>{state.certShowAll=!state.certShowAll;renderCertList();qs('#admin-cert-list').scrollTop=0;alignCertColumns();});
function selectTab(name) {
  const panels={content:'#content-panel',technologies:'#technologies-panel',projects:'#projects-panel',certificates:'#certificates-panel'};
  for(const [key,selector] of Object.entries(panels)) {
    qs(selector).hidden=key!==name;
    const tab=qs(`#tab-${key}`);
    tab.classList.toggle('active',key===name);
    tab.setAttribute('aria-selected',String(key===name));
  }
  if(name==='certificates')requestAnimationFrame(alignCertColumns);
}
for(const name of ['content','technologies','projects','certificates']) {
  qs(`#tab-${name}`).addEventListener('click',()=>selectTab(name));
}
qs('#new-certificate').addEventListener('click',()=>{resetCertForm();certField('name').focus();qs('.cert-editor-card').scrollIntoView({behavior:'smooth',block:'start'});});
qs('#clear-certificate').addEventListener('click',resetCertForm);
certField('image').addEventListener('change',event=>{
  releaseCertPreview();
  const file=event.target.files?.[0];
  if (!file) {previewCertImage(state.certImageUrl);return;}
  if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size>4*1024*1024) {
    showStatus('Use JPG, PNG, WebP ou GIF com até 4 MB.','error');event.target.value='';return;
  }
  state.certPendingPreview=URL.createObjectURL(file);
  previewCertImage(state.certPendingPreview);
});
certField('image-url').addEventListener('change',event=>{
  if (!certField('image').files?.length) {state.certImageUrl=event.target.value.trim();previewCertImage(state.certImageUrl);}
});
qs('#certificate-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const submit=qs('#save-certificate');submit.disabled=true;showStatus('Salvando formação...');
  try {
    let image=certField('image-url').value.trim() || state.certImageUrl;
    const file=certField('image').files?.[0];
    if(file) {
      showStatus('Enviando imagem...');
      const response=await fetch('/.netlify/functions/media',{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file});
      const info=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(info.error||'Falha no envio da imagem.');
      image=info.url;
    }
    if(image && !(/^\/assets\/certificates\/[a-z0-9-]+\.webp$/.test(image) || /^\/\.netlify\/functions\/media\?key=[a-z0-9-]{36}\.(png|jpg|webp|gif)$/.test(image))) {
      const url=new URL(image);
      if(url.protocol!=='https:') throw new Error('Use um link HTTPS para a imagem.');
    }
    const body={id:certField('id').value||undefined,name:certField('name').value,org:certField('org').value,hours:certField('hours').value,
      groupId:certField('group').value,type:certField('type').value,description:certField('desc').value,image};
    const result=await request('/.netlify/functions/certificates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    state.certificates=result.certificates||[];renderCertList();resetCertForm();
    showStatus('Formação salva com sucesso! Atualize a página pública para visualizar.','success',{persisted:true});
  } catch(error){showStatus(error.message || 'Não foi possível salvar a formação.','error',{failed:true});}
  finally{submit.disabled=false;}
});
init();
