// Seletor de múltiplas tecnologias cadastradas. Não utiliza o catálogo de ícones.
export function createProjectTechPicker({root,search,status}) {
  let catalog=[],selected=new Set(),historical=new Map();
  const normalize=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const selectedIds=()=>[...selected];
  const records=()=>{
    const available=new Map(catalog.map(t=>[t.id,t]));
    return [...catalog,...[...historical.values()].filter(t=>!available.has(t.id))];
  };
  function render(focusId=''){
    const query=normalize(search.value.trim());
    const options=records().filter(t=>normalize(t.label).includes(query));
    root.replaceChildren();
    for(const item of options){
      const checked=selected.has(item.id);
      const label=document.createElement('label');label.className='project-tech-check'+(checked?' is-selected':'');
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=item.id;checkbox.checked=checked;
      checkbox.addEventListener('change',()=>{
        if(checkbox.checked){if(selected.size>=30){checkbox.checked=false;return;}selected.add(item.id);}
        else selected.delete(item.id);
        render(item.id);
      });
      const text=document.createElement('span');text.textContent=item.label;
      label.append(checkbox,text);
      if(!catalog.some(t=>t.id===item.id)){
        const detail=document.createElement('small');detail.textContent='Histórica';label.append(detail);
      }
      root.append(label);
    }
    if(!options.length){const empty=document.createElement('p');empty.className='project-tech-empty';empty.textContent=catalog.length?'Nenhuma tecnologia encontrada.':'Nenhuma tecnologia cadastrada ou não foi possível carregar a lista.';root.append(empty);}
    status.textContent=`${selected.size} selecionada(s) · ${catalog.length} cadastrada(s)`;
    if(focusId) for(const input of root.querySelectorAll('input'))if(input.value===focusId){input.focus({preventScroll:true});break;}
  }
  search.addEventListener('input',render);
  return {
    setCatalog(items){catalog=Array.isArray(items)?items.filter(t=>t && typeof t.id==='string' && typeof t.label==='string'):[];render();},
    setSelected(ids,technologies=[]){selected=new Set(Array.isArray(ids)?ids:[]);historical=new Map((Array.isArray(technologies)?technologies:[]).filter(t=>t && t.id && !catalog.some(current=>current.id===t.id)).map(t=>[t.id,t]));search.value='';render();},
    selectedIds,render
  };
}
