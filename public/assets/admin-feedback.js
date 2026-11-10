// Feedback centralizado de alterações persistidas no servidor.
// A página só volta ao topo depois de uma resposta bem-sucedida da API.
export function createAdminFeedback({status, toast, scrollToTop = () => {
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduce?'instant':'smooth'});
}, schedule = (callback, ms) => setTimeout(callback, ms), cancel = id => clearTimeout(id)}) {
  const title=toast.querySelector('[data-toast-title]');
  const description=toast.querySelector('[data-toast-message]');
  const close=toast.querySelector('[data-toast-close]');
  let timer=null;
  function dismiss(){toast.hidden=true;if(timer!==null){cancel(timer);timer=null;}}
  close.addEventListener('click',dismiss);
  function announce(message, error=false, failed=false){
    if(timer!==null){cancel(timer);timer=null;}
    title.textContent=error?(failed?'Informação não foi salva':'Operação não concluída'):'Informações salvas com sucesso!';
    description.textContent=message;
    toast.classList.toggle('is-error',error);
    toast.setAttribute('role',error?'alert':'status');
    toast.setAttribute('aria-live',error?'assertive':'polite');
    toast.hidden=false;
    timer=schedule(dismiss,7000);
  }
  function showStatus(message,mode='',options={}){
    status.textContent=message;
    status.className=`admin-status ${mode}`;
    if(options.persisted && mode==='success'){
      // Só retornar ao topo APÓS a confirmação positiva da operação remota.
      scrollToTop();
      announce(message,false,false);
    }else if(mode==='error'){
      // Erros não deslocam o usuário, preservando os campos que ele estava editando.
      announce(message,true,Boolean(options.failed));
    }
  }
  return {showStatus,dismiss};
}
