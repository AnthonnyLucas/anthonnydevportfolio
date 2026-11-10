import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAdminFeedback} from '../public/assets/admin-feedback.js';

function fixture(){
  let scrolls=0, scheduled=0;
  const status={textContent:'',className:''};
  const fields={
    '[data-toast-title]':{textContent:''},
    '[data-toast-message]':{textContent:''},
    '[data-toast-close]':{addEventListener(event,cb){this.callback=cb;}}
  };
  const attrs={};const classes=new Set();
  const toast={hidden:true,
    querySelector(selector){return fields[selector];},
    setAttribute(name,value){attrs[name]=value;},
    classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}
  };
  const {showStatus,dismiss}=createAdminFeedback({status,toast,
    scrollToTop:()=>{scrolls++;},
    schedule:(callback,ms)=>{assert.equal(ms,7000);scheduled++;return scheduled;},
    cancel:()=>{}
  });
  return {status,toast,fields,attrs,classes,showStatus,dismiss,get scrolls(){return scrolls;}};
}

test('save confirmation scrolls to top and shows success popup',()=>{
  const app=fixture();
  app.showStatus('Projeto salvo com sucesso!','success',{persisted:true});
  assert.equal(app.scrolls,1);
  assert.equal(app.toast.hidden,false);
  assert.equal(app.fields['[data-toast-title]'].textContent,'Informações salvas com sucesso!');
  assert.match(app.fields['[data-toast-message]'].textContent,/Projeto salvo/);
  assert.equal(app.attrs['role'],'status');
});

test('failed save shows error popup without moving the page',()=>{
  const app=fixture();
  app.showStatus('Erro HTTP 500','error',{failed:true});
  assert.equal(app.scrolls,0);
  assert.equal(app.toast.hidden,false);
  assert.equal(app.fields['[data-toast-title]'].textContent,'Informação não foi salva');
  assert.equal(app.attrs.role,'alert');
  assert.equal(app.classes.has('is-error'),true);
});

test('login and unsaved local selections do not scroll or claim persistence',()=>{
  const app=fixture();
  app.showStatus('Acesso autorizado.','success');
  app.showStatus('Logotipo selecionado.','success');
  app.showStatus('Enviando imagem...');
  assert.equal(app.scrolls,0);
  assert.equal(app.toast.hidden,true);
  app.showStatus('Falha de rede','error');
  assert.equal(app.scrolls,0);
  assert.equal(app.toast.hidden,false);
  app.fields['[data-toast-close]'].callback();
  assert.equal(app.toast.hidden,true);
});

test('all explicit save flows use persisted confirmation',async()=>{
  const js=(await Promise.all(['admin.js','cms-admin.js','category-admin.js'].map(name=>readFile(new URL(`../public/assets/${name}`,import.meta.url),'utf8')))).join('\n');
  for(const phrase of ['Conteúdo salvo com sucesso','Tecnologia salva com sucesso','Projeto salvo com sucesso','Formação salva com sucesso','Categorias atualizadas no site público']) {
    assert.ok(js.includes(phrase),`missing save flow ${phrase}`);
  }
  const marked=[...js.matchAll(/showStatus\([^\n]*'success',\{persisted:true\}\)/g)];
  assert.ok(marked.length>=10,`expected >=10 completed mutation feedbacks; got ${marked.length}`);
  const html=await readFile(new URL('../public/admin/index.html',import.meta.url),'utf8');
  assert.match(html,/class="back-link admin-back-button"/);
  assert.match(html,/id="admin-toast"/);
});
