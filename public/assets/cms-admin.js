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

  // Gerenciamento isolado de tecnologias: categorias dinâmicas, busca combinada,
  // catálogo pesquisável e lista com rolagem. Não interfere nos outros editores.
  const defaultTechCategories=[
    {id:'linguagens',label:'Linguagens'},
    {id:'frameworks',label:'Frameworks'},
    {id:'infra',label:'Infra & DevOps'},
    {id:'iot',label:'IoT & Dados'}
  ];
  state.techCategories=[...defaultTechCategories];
  state.techLoadError='';
  const t=(suffix)=>$(`#technology-${suffix}`);
  const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const categoryLabel=id=>state.techCategories.find(c=>c.id===id)?.label||id;
  const techManager=$('#technology-category-manager');
  const techEditor=$('.tech-editor-card');
  function alignTechColumns(){
    // O editor determina a altura disponível para a lista à esquerda.
    if(window.matchMedia('(min-width: 931px)').matches){
      const h=Math.ceil(techEditor.getBoundingClientRect().height);
      if(h>0)$('#technologies-panel').style.setProperty('--tech-editor-height',`${h}px`);
    } else $('#technologies-panel').style.removeProperty('--tech-editor-height');
  }
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(alignTechColumns).observe(techEditor);
  window.addEventListener('resize',alignTechColumns,{passive:true});

  const techPreview=url=>{
    const panel=$('#technology-image-preview');panel.replaceChildren();
    if(safePreview(url) || url==='/assets/tech-logos/assembly.svg' || /^\/assets\/tech-icon-library\/[a-z0-9-]+\.svg$/.test(url) || (url?.startsWith('blob:') && url===state.techImageObjectUrl)){
      const img=create('img');img.src=url;img.alt='Prévia do logotipo selecionado';
      img.addEventListener('error',()=>{panel.replaceChildren(create('span','','Logotipo indisponível. Escolha outro ou use o símbolo de reserva.'));},{once:true});
      panel.append(img);
    }else panel.append(create('span','','Selecione um logotipo ou informe um símbolo de reserva.'));
  };
  const iconCatalog=setupIconCatalog({onSelect:item=>{
    t('logo-url').value=item.url;state.techLogo=item.url;
    t('icon').value=item.name==='Assembly'?'ASM':item.name.slice(0,3).toUpperCase();
    techPreview(item.url);
    showStatus(`Logotipo de ${item.name} selecionado. Clique em Salvar tecnologia para publicar.`,'success');
  }});
  function renderTechCategoryControls(){
    const edit=t('category'),filter=$('#tech-filter');
    const chosenEdit=edit.value,chosenFilter=filter.value;
    edit.replaceChildren();filter.replaceChildren();
    const all=create('option','','Todas as áreas');all.value='all';filter.append(all);
    for(const c of state.techCategories){
      const e=create('option','',c.label);e.value=c.id;edit.append(e);
      const f=create('option','',c.label);f.value=c.id;filter.append(f);
    }
    if(state.techCategories.some(c=>c.id===chosenEdit))edit.value=chosenEdit;
    if(state.techCategories.some(c=>c.id===chosenFilter))filter.value=chosenFilter;
    else filter.value='all';
  }
  async function saveTechCategory(payload){
    const result=await request('/.netlify/functions/categories?kind=technologies',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
    });
    state.techCategories=result.categories||state.techCategories;
    renderTechCategoryControls();renderTechCategoryManager();renderTechList();
  }
  function renderTechCategoryManager(){
    const list=$('#technology-category-list');list.replaceChildren();
    for(const cat of state.techCategories){
      const row=create('div','category-manage-row');
      const title=create('span','',cat.label);
      const actions=create('div','list-actions');
      const rename=create('button','','Renomear');rename.type='button';
      rename.addEventListener('click',()=>{
        const field=create('input');field.maxLength=55;field.value=cat.label;field.setAttribute('aria-label',`Novo nome de ${cat.label}`);
        const save=create('button','','Salvar');save.type='button';
        const cancel=create('button','','Cancelar');cancel.type='button';
        row.replaceChildren(field);const controls=create('div','list-actions');controls.append(save,cancel);row.append(controls);field.focus();field.select();
        const commit=async()=>{
          const label=field.value.trim();if(!label||label===cat.label){renderTechCategoryManager();return;}
          save.disabled=true;
          try {await saveTechCategory({id:cat.id,label});showStatus('Categoria renomeada. Filtros sincronizados.','success');}
          catch(error){showStatus(error.message||'Falha ao renomear categoria.','error');save.disabled=false;}
        };
        save.addEventListener('click',commit);
        field.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape')renderTechCategoryManager();});
        cancel.addEventListener('click',renderTechCategoryManager);
      });
      const remove=create('button','delete','Excluir');remove.type='button';
      const used=state.technologies.some(item=>item.cat===cat.id);
      remove.disabled=used;remove.title=used?'Há tecnologias nesta categoria. Reclassifique-as antes de excluir.':'Excluir categoria';
      remove.addEventListener('click',async()=>{
        if(!confirm(`Excluir a categoria “${cat.label}”?`))return;
        try{
          const result=await request('/.netlify/functions/categories?kind=technologies',{
            method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:cat.id})
          });
          state.techCategories=result.categories||state.techCategories;
          renderTechCategoryControls();renderTechCategoryManager();renderTechList();showStatus('Categoria excluída.','success');
        }catch(error){showStatus(error.message||'Falha ao excluir categoria.','error');}
      });
      actions.append(rename,remove);row.append(title,actions);list.append(row);
    }
  }
  $('#technology-category-add').addEventListener('click',async()=>{
    const field=$('#technology-category-name'),label=field.value.trim();
    if(label.length<2){showStatus('Informe uma categoria com pelo menos dois caracteres.','error');field.focus();return;}
    const button=$('#technology-category-add');button.disabled=true;
    try{
      await saveTechCategory({label});field.value='';
      const chosen=state.techCategories.find(c=>normalizeSearch(c.label)===normalizeSearch(label));
      if(chosen)t('category').value=chosen.id;
      showStatus(`Categoria “${label}” criada e disponível no formulário.`,'success');
    }catch(error){showStatus(error.message||'Não foi possível criar a categoria.','error');}
    finally{button.disabled=false;}
  });
  $('#technology-category-name').addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();$('#technology-category-add').click();}
  });
  $('#tech-category-shortcut').addEventListener('click',()=>{
    techManager.open=true;techManager.scrollIntoView({behavior:'smooth',block:'nearest'});
    $('#technology-category-name').focus();
  });
  const clearTech=()=>{
    $('#technology-form').reset();t('id').value='';t('color').value='#b7ff79';
    $('#tech-editor-title').textContent='Nova tecnologia';state.techLogo='';
    releaseImage('techImageObjectUrl');techPreview('');iconCatalog.render();
  };
  function editTech(item){
    clearTech();t('id').value=item.id;t('name').value=item.label;
    t('category').value=item.cat;
    t('icon').value=item.icon||'';t('color').value=item.color||'#b7ff79';
    t('logo-url').value=item.logoUrl||'';state.techLogo=item.logoUrl||'';
    techPreview(state.techLogo);iconCatalog.render();
    $('#tech-editor-title').textContent='Editar tecnologia';t('name').focus();
    techEditor.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function renderTechList(){
    const list=$('#admin-tech-list');list.replaceChildren();
    const query=normalizeSearch($('#tech-search').value);
    const category=$('#tech-filter').value;
    const matches=state.technologies.filter(item=>normalizeSearch(item.label).includes(query) && (category==='all'||item.cat===category));
    // Pesquisas sempre mostram todos os resultados, sem um corte escondido.
    const limit=18;
    const all=state.techShowAll||Boolean(query)||category!=='all';
    const shown=all?matches:matches.slice(0,limit);
    $('#tech-list-summary').textContent=state.techLoadError||`${shown.length} de ${matches.length} tecnologia(s) · ${state.technologies.length} cadastradas`;
    const canExpand=matches.length>limit&&!query&&category==='all';
    const expanded=canExpand&&state.techShowAll;
    $('#tech-show-all').hidden=!canExpand;
    $('#tech-show-all').textContent=expanded?'Mostrar as primeiras 18':'Ver todas as tecnologias';
    $('#tech-show-all').setAttribute('aria-expanded',String(expanded));
    $('#technologies-panel').classList.toggle('tech-list-expanded',expanded);
    if(!matches.length){
      list.append(create('p','list-empty',state.techLoadError || (query||category!=='all'?'Nenhuma tecnologia corresponde à pesquisa.':'Nenhuma tecnologia cadastrada.')));
      return;
    }
    shown.forEach(item=>{
      const i=state.technologies.findIndex(row=>row.id===item.id);
      const row=create('article','admin-list-item');
      const content=create('div');content.append(create('h3','',item.label));
      const badge=create('span','tech-item-badge',categoryLabel(item.cat));content.append(badge);
      const buttons=create('div','list-actions tech-item-actions');
      for(const [label,offset,title] of [['↑',-1,'Mover para cima'],['↓',1,'Mover para baixo']]){
        const btn=create('button','',label);btn.type='button';btn.title=title;
        btn.disabled=i+offset<0||i+offset>=state.technologies.length;
        btn.addEventListener('click',async()=>{
          const ids=state.technologies.map(row=>row.id);
          [ids[i],ids[i+offset]]=[ids[i+offset],ids[i]];
          try{
            const result=await request('/.netlify/functions/technologies',{
              method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})
            });
            state.technologies=result.technologies||[];renderTechList();showStatus('Ordem da vitrine atualizada.','success');
          }catch(error){showStatus(error.message||'Erro ao reordenar.','error');}
        });buttons.append(btn);
      }
      const edit=create('button','','Editar');edit.type='button';edit.addEventListener('click',()=>editTech(item));
      const del=create('button','delete','Excluir');del.type='button';del.addEventListener('click',async()=>{
        if(!confirm(`Excluir “${item.label}” da vitrine?`))return;
        try{
          const result=await request('/.netlify/functions/technologies',{
            method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})
          });
          state.technologies=result.technologies||[];
          renderTechList();renderTechCategoryManager();
          if(t('id').value===item.id)clearTech();showStatus('Tecnologia removida.','success');
        }catch(error){showStatus(error.message||'Erro ao excluir tecnologia.','error');}
      });
      buttons.append(edit,del);row.append(content,buttons);list.append(row);
    });
  }
  $('#tech-search').addEventListener('input',()=>{state.techShowAll=false;renderTechList();});
  $('#tech-filter').addEventListener('change',()=>{state.techShowAll=false;renderTechList();});
  $('#tech-show-all').addEventListener('click',()=>{state.techShowAll=!state.techShowAll;renderTechList();$('#admin-tech-list').scrollTop=0;});
  t('logo').addEventListener('change',()=>{
    releaseImage('techImageObjectUrl');const file=t('logo').files?.[0];
    if(!file){techPreview(state.techLogo);return;}
    if(!TYPES.includes(file.type)||file.size>MAX_IMAGE){showStatus('Imagem inválida (máximo 4 MB).','error');t('logo').value='';return;}
    state.techImageObjectUrl=URL.createObjectURL(file);techPreview(state.techImageObjectUrl);
  });
  t('logo-url').addEventListener('change',()=>{
    if(!t('logo').files?.length){state.techLogo=t('logo-url').value.trim();techPreview(state.techLogo);iconCatalog.render();}
  });
  $('#new-technology').addEventListener('click',()=>{clearTech();t('name').focus();techEditor.scrollIntoView({behavior:'smooth',block:'nearest'});});
  $('#clear-technology').addEventListener('click',clearTech);
  $('#technology-form').addEventListener('submit',async e=>{
    e.preventDefault();const btn=$('#save-technology');btn.disabled=true;
    try{
      let logoUrl=t('logo-url').value.trim()||state.techLogo;
      const file=t('logo').files?.[0];if(file){showStatus('Enviando logotipo...');logoUrl=await upload(file);}
      const body={id:t('id').value||undefined,label:t('name').value,cat:t('category').value,icon:t('icon').value,color:t('color').value,logoUrl};
      const result=await request('/.netlify/functions/technologies',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
      });
      state.technologies=result.technologies||[];state.techLoadError='';
      renderTechList();renderTechCategoryManager();clearTech();
      showStatus('Tecnologia salva e disponível na vitrine pública.','success');
    }catch(error){showStatus(error.message||'Erro ao salvar tecnologia.','error');}
    finally{btn.disabled=false;}
  });
  renderContentGroup();
  return {
    async refresh(){
      // Uma falha no conteúdo ou nas categorias não desabilita a busca de tecnologias.
      const results=await Promise.allSettled([
        request('/.netlify/functions/content'),
        request('/.netlify/functions/technologies'),
        request('/.netlify/functions/categories?kind=technologies')
      ]);
      if(results[0].status==='fulfilled'){
        const content=results[0].value;
        state.content={...contentDefaults,...content.content};state.revision=content.revision||0;
        renderContentGroup();
      }
      if(results[1].status==='fulfilled'){
        state.technologies=results[1].value.technologies||[];state.techLoadError='';
      }else{
        state.techLoadError='Não foi possível carregar as tecnologias. Confira a API da Netlify.';
      }
      if(results[2].status==='fulfilled')state.techCategories=results[2].value.categories||defaultTechCategories;
      renderTechCategoryControls();renderTechCategoryManager();renderTechList();iconCatalog.render();
      alignTechColumns();
      const errors=results.map((r,i)=>r.status==='rejected'?['Conteúdo','Tecnologias','Categorias de tecnologias'][i]+': '+r.reason.message:null).filter(Boolean);
      if(errors.length)showStatus('Falha no carregamento: '+errors.join(' | '),'error');
    }
  };
}
