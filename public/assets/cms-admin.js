import { setupIconCatalog } from './tech-icon-catalog.js';
import { contentDefaults, contentFields, contentGroups } from './site-schema.js';
const $=selector=>document.querySelector(selector);
const create=(tag,cls='',text='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const MAX_IMAGE=4*1024*1024;
const TYPES=['image/jpeg','image/png','image/webp','image/gif'];
const safePreview=url => typeof url==='string' && (/^https:\/\//i.test(url) || /^\/\.netlify\/functions\/media\?key=[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(url));
export function setupCmsAdmin({request,showStatus}) {
  const state={content:{...contentDefaults},revision:0,group:'inicio',technologies:[],techShowAll:false,imageObjectUrl:'',techImageObjectUrl:'',techLogo:''};
  const groupButtons=$('#content-group-buttons'),fields=$('#content-fields');
  const contentForm=$('#content-form');
  const fieldsInGroup=()=>contentFields.filter(f=>f.group===state.group);
  const fieldInput=key=>document.getElementById(`cms-field-${key}`);
  const groupName=()=>contentGroups.find(g=>g.id===state.group);
  function releaseImage(key) {if(state[key])URL.revokeObjectURL(state[key]);state[key]='';}
  function inputValue(field){return fieldInput(field.key)?.value?.trim()??'';}
  function diffContent(){
    const patch={};
    for(const spec of fieldsInGroup()){
      const value=inputValue(spec);
      if(value !== (state.content[spec.key] ?? spec.defaultValue))patch[spec.key]=value;
    }
    return patch;
  }
  function showCmsPreview(){
    const output=$('#content-live-preview');output.replaceChildren();
    const name=groupName();output.append(create('h3','',`Prévia: ${name?.name || 'Seção'}`));
    const current=fieldsInGroup().filter(field=>['text','textarea'].includes(field.type)).slice(0,4);
    for(const spec of current) {
      const line=create('div','cms-preview-entry');line.append(create('small','',spec.label),create('p','',inputValue(spec)));output.append(line);
    }
    if(state.group==='sobre') {
      const src=fieldInput('aboutImage')?.value.trim();
      if(safePreview(src)) {
        const im=create('img','cms-photo-preview');im.src=src;im.alt='Prévia da fotografia';
        im.style.objectPosition=`center ${fieldInput('aboutImagePosition')?.value || 50}%`;
        im.onerror=()=>im.remove();output.append(im);
      }
    }
    const dirty=Object.keys(diffContent()).length;
    const indicator=create('p','cms-dirty-status', dirty ? `${dirty} campo(s) com alterações ainda não salvas.`:'Sem alterações pendentes.');
    output.append(indicator);
  }
  function renderGroupButtons(){
    groupButtons.replaceChildren();
    for(const group of contentGroups){
      const btn=create('button',`cms-nav-button${state.group===group.id?' active':''}`,group.name);
      btn.type='button';btn.setAttribute('aria-pressed',String(state.group===group.id));
      btn.addEventListener('click',()=>{
        if(group.id===state.group)return;
        if(Object.keys(diffContent()).length && !confirm('Há alterações não salvas. Descartá-las e abrir outra área?'))return;
        state.group=group.id;renderContentGroup();
      });
      groupButtons.append(btn);
    }
  }
  function renderContentGroup(){
    releaseImage('imageObjectUrl');
    renderGroupButtons();
    const group=groupName();
    $('#cms-editor-title').textContent=group?.name || '';
    $('#cms-editor-description').textContent=group?.description || '';
    fields.replaceChildren();
    for(const spec of fieldsInGroup()){
      const box=create('div','cms-field');
      const label=create('label','',spec.label);label.htmlFor=`cms-field-${spec.key}`;box.append(label);
      let input;
      if(spec.type==='textarea'){input=create('textarea');input.rows=4;}
      else {input=create('input');input.type=spec.type==='email'?'email':spec.type==='url'?'url':spec.type==='range'?'range':'text';}
      input.id=`cms-field-${spec.key}`;input.maxLength=spec.max;
      input.value=state.content[spec.key]??spec.defaultValue;
      if(spec.type==='range'){input.min='0';input.max='100';input.step='1';input.removeAttribute('maxlength');}
      input.addEventListener('input',showCmsPreview);
      box.append(input);
      if(spec.type==='image') {
        const note=create('small','form-hint','Ou envie uma nova imagem JPG, PNG, WebP ou GIF (máx. 4 MB).');
        const file=create('input');file.type='file';file.id=`cms-upload-${spec.key}`;file.accept=TYPES.join(',');
        file.addEventListener('change',()=>{
          releaseImage('imageObjectUrl');
          const chosen=file.files?.[0];if(!chosen)return;
          if(!TYPES.includes(chosen.type)||chosen.size>MAX_IMAGE){showStatus('Imagem inválida. Utilize JPG, PNG, WebP ou GIF até 4 MB.','error');file.value='';return;}
          state.imageObjectUrl=URL.createObjectURL(chosen);
          const im=$('#content-live-preview img.cms-photo-preview');
          if(im) im.src=state.imageObjectUrl;
          else {showCmsPreview();const photo=$('#content-live-preview img.cms-photo-preview');if(photo)photo.src=state.imageObjectUrl;}
        });
        box.append(note,file);
      }
      fields.append(box);
    }
    showCmsPreview();
  }
  async function upload(file){
    if(!TYPES.includes(file.type)||file.size>MAX_IMAGE)throw new Error('Use JPG, PNG, WebP ou GIF com até 4 MB.');
    const result=await request('/.netlify/functions/media',{method:'POST',headers:{'Content-Type':file.type},body:file});
    if(!safePreview(result.url))throw new Error('A API não retornou uma imagem válida.');
    return result.url;
  }
  contentForm.addEventListener('submit',async e=>{
    e.preventDefault();const button=$('#save-content');button.disabled=true;
    try {
      const patch=diffContent();
      for (const imageKey of ['aboutImage','sidebarBrandImage']) {
        const file=$(`#cms-upload-${imageKey}`)?.files?.[0];
        if(file){showStatus('Enviando imagem...');patch[imageKey]=await upload(file);}
      }
      if(!Object.keys(patch).length){showStatus('Nenhuma alteração para salvar.');return;}
      showStatus('Salvando os textos e as imagens no servidor...');
      const result=await request('/.netlify/functions/content',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:state.revision,patch})});
      state.content=result.content;state.revision=result.revision;
      renderContentGroup();showStatus('Conteúdo salvo! O site público mostrará as mudanças após recarregar.','success');
    }catch(error){showStatus(error.message||'Erro ao salvar conteúdo.','error');}
    finally{button.disabled=false;}
  });
  $('#restore-content').addEventListener('click',()=>{renderContentGroup();showStatus('Edições locais descartadas.');});
  $('#defaults-content').addEventListener('click',()=>{
    if(!confirm('Preencher esta seção com os textos originais do projeto? Nada será publicado até clicar em Salvar alterações.'))return;
    releaseImage('imageObjectUrl');
    for(const spec of fieldsInGroup())fieldInput(spec.key).value=spec.defaultValue;
    const file=$('#cms-upload-aboutImage');if(file)file.value='';
    showCmsPreview();
    showStatus('Textos de referência preenchidos. Revise e clique em Salvar alterações para publicá-los.');
  });

  // Editor do catálogo tecnológico: inclusão/edição/exclusão/ordenação protegidos na API.
  const t=(suffix)=>$(`#technology-${suffix}`);
  const techPreview=(url) => {
    const panel=$('#technology-image-preview');panel.replaceChildren();
    if(safePreview(url) || url==='/assets/tech-logos/assembly.svg') {const img=create('img');img.src=url;img.alt='Prévia do ícone';panel.append(img);}
    else panel.append(create('span','', 'Será usado o símbolo de reserva ou o logotipo Devicon.'));
  };
  const iconCatalog=setupIconCatalog({onSelect:item=>{t('logo-url').value=item.url;state.techLogo=item.url;t('icon').value=item.name==='Assembly'?'ASM':item.name.slice(0,3).toUpperCase();techPreview(item.url);}});
  const clearTech=()=>{
    $('#technology-form').reset();t('id').value='';t('color').value='#b7ff79';
    $('#tech-editor-title').textContent='Nova tecnologia';state.techLogo='';releaseImage('techImageObjectUrl');techPreview('');iconCatalog.render();
  };
  function editTech(item){
    clearTech();t('id').value=item.id;t('name').value=item.label;t('category').value=item.cat;
    t('icon').value=item.icon||'';t('color').value=item.color||'#b7ff79';
    t('logo-url').value=item.logoUrl||'';state.techLogo=item.logoUrl||'';techPreview(state.techLogo);
    iconCatalog.render();$('#tech-editor-title').textContent='Editar tecnologia';t('name').focus();$('.tech-editor-card').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderTechList(){
    const list=$('#admin-tech-list');list.replaceChildren();
    const query=$('#tech-search').value.trim().toLocaleLowerCase('pt-BR');
    const category=$('#tech-filter').value;
    const matches=state.technologies.filter(t=>t.label.toLocaleLowerCase('pt-BR').includes(query) && (category==='all'||t.cat===category));
    const shown=state.techShowAll?matches:matches.slice(0,6);
    $('#tech-list-summary').textContent=`${shown.length} de ${matches.length} resultados`;
    $('#tech-show-all').hidden=matches.length<=6;
    $('#tech-show-all').textContent=state.techShowAll?'Mostrar menos':'Ver todas as tecnologias';
    if(!matches.length){list.append(create('p','list-empty','Nenhuma tecnologia nesta vitrine.'));return;}
    shown.forEach(item=>{
      const i=state.technologies.findIndex(t=>t.id===item.id);
      const row=create('article','admin-list-item');
      const content=create('div');content.append(create('h3','',item.label),create('p','',`${item.cat} · ${i+1}/${state.technologies.length}`));
      const buttons=create('div','list-actions tech-item-actions');
      for (const [label,action,title] of [['↑','up','Mover para cima'],['↓','down','Mover para baixo']]){
        const btn=create('button','',label);btn.type='button';btn.title=title;btn.disabled=action==='up'?i===0:i===state.technologies.length-1;
        btn.addEventListener('click',async()=>{
          const ids=state.technologies.map(t=>t.id);const other=i+(action==='up'?-1:1);
          [ids[i],ids[other]]=[ids[other],ids[i]];
          try {const result=await request('/.netlify/functions/technologies',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})});state.technologies=result.technologies;renderTechList();showStatus('Ordem da vitrine atualizada.','success');}
          catch(err){showStatus(err.message,'error');}
        });buttons.append(btn);
      }
      const edit=create('button','','Editar');edit.type='button';edit.addEventListener('click',()=>editTech(item));
      const del=create('button','delete','Excluir');del.type='button';del.addEventListener('click',async()=>{
        if(!confirm(`Excluir “${item.label}” da vitrine?`))return;
        try {const result=await request('/.netlify/functions/technologies',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})});state.technologies=result.technologies;renderTechList();if(t('id').value===item.id)clearTech();showStatus('Tecnologia removida.','success');}
        catch(err){showStatus(err.message,'error');}
      });buttons.append(edit,del);row.append(content,buttons);list.append(row);
    });
  }
  $('#tech-search').addEventListener('input',()=>{state.techShowAll=false;renderTechList();});
  $('#tech-filter').addEventListener('change',()=>{state.techShowAll=false;renderTechList();});
  $('#tech-show-all').addEventListener('click',()=>{state.techShowAll=!state.techShowAll;renderTechList();});
  t('logo').addEventListener('change',()=>{
    releaseImage('techImageObjectUrl');
    const file=t('logo').files?.[0];if(!file){techPreview(state.techLogo);return;}
    if(!TYPES.includes(file.type)||file.size>MAX_IMAGE){showStatus('Imagem inválida (máximo 4 MB).','error');t('logo').value='';return;}
    state.techImageObjectUrl=URL.createObjectURL(file);techPreview(state.techImageObjectUrl);
  });
  t('logo-url').addEventListener('change',()=>{if(!t('logo').files?.length){state.techLogo=t('logo-url').value.trim();techPreview(state.techLogo);}});
  $('#new-technology').addEventListener('click',()=>{clearTech();t('name').focus();$('.tech-editor-card').scrollIntoView({behavior:'smooth',block:'start'});});
  $('#clear-technology').addEventListener('click',clearTech);
  $('#technology-form').addEventListener('submit',async e=>{
    e.preventDefault();const btn=$('#save-technology');btn.disabled=true;
    try {
      let logoUrl=t('logo-url').value.trim()||state.techLogo;
      const file=t('logo').files?.[0];if(file){showStatus('Enviando logotipo...');logoUrl=await upload(file);}
      const body={id:t('id').value||undefined,label:t('name').value,cat:t('category').value,icon:t('icon').value,color:t('color').value,logoUrl};
      const result=await request('/.netlify/functions/technologies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      state.technologies=result.technologies;renderTechList();clearTech();showStatus('Tecnologia salva e disponível na vitrine pública.','success');
    }catch(error){showStatus(error.message||'Erro ao salvar tecnologia.','error');}
    finally{btn.disabled=false;}
  });
  renderContentGroup();
  return {
    async refresh(){
      const [content,tech]=await Promise.all([request('/.netlify/functions/content'),request('/.netlify/functions/technologies')]);
      state.content={...contentDefaults,...content.content};state.revision=content.revision||0;
      state.technologies=tech.technologies||[];
      renderContentGroup();renderTechList();
    }
  };
}
