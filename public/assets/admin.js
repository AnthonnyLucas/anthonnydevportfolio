import { setupCmsAdmin } from './cms-admin.js';
const qs = selector => document.querySelector(selector);
const state = { projects: [], certificates: [], imageUrl: '', pendingPreview: null, certImageUrl: '', certPendingPreview: null };
const status = qs('#admin-status');
const showStatus = (msg, mode = '') => { status.textContent = msg; status.className = `admin-status ${mode}`; };
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
  qs('#project-category').value = project.category || 'Outros';
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
  const list = qs('#admin-project-list');
  list.replaceChildren();
  if (!state.projects.length) {
    const box = document.createElement('div'); box.className = 'list-empty';
    box.textContent = 'Ainda não há projetos. Clique em “+ Novo projeto” para cadastrar o primeiro.';
    list.append(box); return;
  }
  state.projects.forEach(project => {
    const row = document.createElement('article'); row.className = 'admin-list-item';
    const content = document.createElement('div');
    const title = document.createElement('h3'); title.textContent = project.title;
    const meta = document.createElement('p'); meta.textContent = `${project.category} ${project.featured ? '· Em destaque' : ''}`;
    content.append(title, meta);
    const actions = document.createElement('div'); actions.className='list-actions';
    const edit = document.createElement('button'); edit.type='button'; edit.textContent='Editar';
    edit.addEventListener('click', () => editProject(project));
    const remove = document.createElement('button'); remove.type='button'; remove.className='delete'; remove.textContent='Excluir';
    remove.addEventListener('click', async () => {
      if (!confirm(`Excluir o projeto “${project.title}”? Essa ação não pode ser desfeita.`)) return;
      try {
        showStatus('Excluindo projeto...');
        const result=await request('/.netlify/functions/projects', {method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:project.id})});
        state.projects = result.projects || [];
        if (qs('#project-id').value === project.id) clearForm();
        renderList();showStatus('Projeto excluído. O site público refletirá a mudança na próxima atualização.','success');
      } catch(e) {showStatus(e.message,'error');}
    });
    actions.append(edit,remove);row.append(content,actions);list.append(row);
  });
}
async function refresh() {
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
    const body={ id:qs('#project-id').value||undefined, title:qs('#project-title').value, category:qs('#project-category').value,
      description:qs('#project-desc').value, tags:qs('#project-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
      image, repository:qs('#project-repo').value, demo:qs('#project-demo').value, featured:qs('#project-featured').checked };
    const data=await request('/.netlify/functions/projects',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body) });
    state.projects=data.projects||[];renderList();clearForm();
    showStatus('Projeto publicado! Abra a página pública ou atualize o site para visualizar.','success');
  }catch(err){showStatus(err.message||'Falha ao salvar.','error');}
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
  certField('group').value = course.group || 'Educação & Idiomas';
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
  qs('#certificate-count').textContent = String(state.certificates.length);
  const list=qs('#admin-cert-list');list.replaceChildren();
  if (!state.certificates.length) {
    const blank=document.createElement('p');blank.textContent='Ainda não há formações cadastradas.';list.append(blank);return;
  }
  state.certificates.forEach(course => {
    const row=document.createElement('article');row.className='admin-list-item';
    const content=document.createElement('div');
    const title=document.createElement('h3');title.textContent=course.name;
    const meta=document.createElement('p');meta.textContent=`${course.group} · ${course.hours}`;
    content.append(title,meta);
    const actions=document.createElement('div');actions.className='list-actions';
    const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';
    edit.addEventListener('click',()=>editCertificate(course));
    const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='Excluir';
    remove.addEventListener('click',async()=>{
      if (!confirm(`Excluir a formação “${course.name}”?`)) return;
      try {
        showStatus('Excluindo formação...');
        const result=await request('/.netlify/functions/certificates',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:course.id})});
        state.certificates=result.certificates||[];
        if(certField('id').value===course.id)resetCertForm();
        renderCertList();showStatus('Formação excluída da vitrine.','success');
      } catch(error){showStatus(error.message,'error');}
    });
    actions.append(edit,remove);row.append(content,actions);list.append(row);
  });
}
function selectTab(name) {
  const panels={content:'#content-panel',technologies:'#technologies-panel',projects:'#projects-panel',certificates:'#certificates-panel'};
  for(const [key,selector] of Object.entries(panels)) {
    qs(selector).hidden=key!==name;
    const tab=qs(`#tab-${key}`);
    tab.classList.toggle('active',key===name);
    tab.setAttribute('aria-selected',String(key===name));
  }
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
      group:certField('group').value,type:certField('type').value,description:certField('desc').value,image};
    const result=await request('/.netlify/functions/certificates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    state.certificates=result.certificates||[];renderCertList();resetCertForm();
    showStatus('Formação salva! Atualize a página pública para visualizar.','success');
  } catch(error){showStatus(error.message || 'Não foi possível salvar a formação.','error');}
  finally{submit.disabled=false;}
});
init();
