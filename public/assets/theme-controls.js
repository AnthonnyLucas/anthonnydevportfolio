// Tema compartilhado entre a vitrine pública e o painel administrativo.
const KEY = 'portfolio-theme';
const valid = value => value === 'light' || value === 'dark';
function getSaved() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function save(value) {
  try { localStorage.setItem(KEY,value); } catch { /* Navegação privada sem storage. */ }
}
export function initTheme() {
  const root=document.documentElement;
  const toggle=document.getElementById('theme-toggle');
  const saved=getSaved();
  const preferred=window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light':'dark';
  const initial=valid(saved)?saved:preferred;
  const render=(mode)=>{
    root.dataset.theme=mode;
    if(toggle){
      const next=mode==='dark'?'claro':'escuro';
      toggle.setAttribute('aria-label',`Ativar modo ${next}`);
      toggle.setAttribute('title',`Ativar modo ${next}`);
      toggle.setAttribute('aria-pressed',String(mode==='light'));
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode==='light'?'#f5f7fa':'#0b1020');
    window.dispatchEvent(new CustomEvent('portfolio:themechange',{detail:{theme:mode}}));
  };
  render(initial);
  toggle?.addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    save(next); render(next);
  });
  // Sincroniza abas do site e do painel abertas simultaneamente.
  window.addEventListener('storage',evt=>{if(evt.key===KEY && valid(evt.newValue))render(evt.newValue);});
}
