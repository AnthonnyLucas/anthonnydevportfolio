// Categorias de projetos e formações: identificadores estáveis, nomes editáveis.
const $=s=>document.querySelector(s);
export function setupCategoryAdmin({request,showStatus,onUpdate=()=>{}}){
  const state={projects:[],certificates:[]};
  const create=(tag,cls='',value='')=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value)el.textContent=value;return el;};
  const selectedProjectIds=()=>[...$('#project-category-picker').querySelectorAll('input:checked')].map(box=>box.value);
  function addOptions(select,options,allLabel){
    const prior=select.value;select.replaceChildren();
    if(allLabel){const item=create('option','',allLabel);item.value='all';select.append(item);}
    for(const cat of options){const item=create('option','',cat.label);item.value=cat.id;select.append(item);}
    select.value=[...select.options].some(item=>item.value===prior)?prior:allLabel?'all':options[0]?.id||'';
  }
  function renderPicker(selection=selectedProjectIds()){
    const container=$('#project-category-picker');container.replaceChildren();
    for(const category of state.projects){
      const label=create('label','category-check');
      const input=create('input');input.type='checkbox';input.value=category.id;input.checked=selection.includes(category.id);
      label.append(input,create('span','',category.label));container.append(label);
    }
  }
  function renderManager(kind){
    const list=$(kind==='projects'?'#project-category-list':'#cert-category-list');
    list.replaceChildren();
    for(const item of state[kind]){
      const row=create('div','category-manage-row');
      row.append(create('span','',item.label));
      const actions=create('div','list-actions');
      const edit=create('button','','Renomear');edit.type='button';
      edit.addEventListener('click',async()=>{
        const value=prompt('Novo nome da categoria:',item.label);
        if(value===null||value.trim()===item.label)return;
        await mutate(kind,'POST',{id:item.id,label:value});
      });
      const del=create('button','delete','Excluir');del.type='button';
      del.addEventListener('click',async()=>{
        if(!confirm(`Excluir a categoria “${item.label}”? Categorias com projetos ou cursos vinculados não podem ser excluídas.`))return;
        await mutate(kind,'DELETE',{id:item.id});
      });
      actions.append(edit,del);row.append(actions);list.append(row);
    }
  }
  function render(){
    const selection=selectedProjectIds();
    renderPicker(selection);
    addOptions($('#project-filter'),state.projects,'Todas as categorias');
    addOptions($('#cert-filter'),state.certificates,'Todas as áreas');
    addOptions($('#certificate-group'),state.certificates,null);
    renderManager('projects');renderManager('certificates');
    onUpdate();
  }
  async function mutate(kind,method,data){
    try{
      const result=await request(`/.netlify/functions/categories?kind=${kind}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      state[kind]=result.categories||[];render();
      showStatus('Categorias atualizadas no site público.','success',{persisted:true});
      return true;
    }catch(error){showStatus(error.message,'error',{failed:true});return false;}
  }
  for(const [kind,prefix] of [['projects','project'],['certificates','cert']]){
    const input=$(`#${prefix}-category-name`);
    $(`#${prefix}-category-add`).addEventListener('click',()=>{if(input.value.trim()){mutate(kind,'POST',{label:input.value.trim()}).then(success=>{if(success)input.value='';});}});
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();$(`#${prefix}-category-add`).click();}});
  }
  return {
    get projects(){return state.projects;},get certificates(){return state.certificates;},
    selectedProjectIds,selectProject(ids){renderPicker(Array.isArray(ids)?ids:[]);},
    async refresh(){
      const [p,c]=await Promise.all(['projects','certificates'].map(kind=>request(`/.netlify/functions/categories?kind=${kind}`)));
      state.projects=p.categories||[];state.certificates=c.categories||[];
      render();
    }
  };
}
