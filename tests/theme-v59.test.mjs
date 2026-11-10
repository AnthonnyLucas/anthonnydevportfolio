import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const publicHtml=read('public/index.html');
const adminHtml=read('public/admin/index.html');
const publicJs=read('public/assets/main.js');
const adminJs=read('public/assets/admin.js');
const css=read('public/assets/v5-9.css');
const theme=read('public/assets/theme-controls.js');
const particles=read('public/assets/particles.js');
test('v5.9: botão de tema padronizado nas duas interfaces, com preferência compartilhada',()=>{
  for(const html of [publicHtml,adminHtml]){
    assert.match(html,/id="theme-toggle" class="theme-switch"/);
    assert.match(html,/v5-9\.css\?v=5\.10\.0/);
    assert.match(html,/theme-icon-sun/);
    assert.match(html,/theme-icon-moon/);
  }
  assert.match(publicJs,/initTheme\(\)/);
  assert.match(adminJs,/initTheme\(\)/);
  assert.match(theme,/portfolio-theme/);
  assert.match(theme,/portfolio:themechange/);
});
test('v5.9: janela Contato adapta sintaxe e painel ao modo claro',()=>{
  for(const cls of ['contact-code-window','contact-code-head','contact-code-body','contact-art-chip','contact-code-status'])assert.ok(css.includes(`html[data-theme="light"] .${cls}`),cls);
  assert.doesNotMatch(css,/html\[data-theme="light"\] \.contact-code-window\{background:linear-gradient\([^}]*#131f36/);
});
test('v5.9: scrollbars transparentes, partículas com redução de movimento',()=>{
  assert.match(css,/scrollbar-color:var\(--scroll-accent\) transparent/);
  assert.match(css,/scrollbar-track\{background:transparent!important/);
  assert.match(particles,/prefers-reduced-motion: reduce/);
  assert.match(particles,/document\.hidden/);
  assert.match(css,/\.section-particles\{[^}]*pointer-events:none/);
  assert.match(publicJs,/initParticles\(\)/);
  assert.match(adminJs,/initParticles\(\{ admin: true \}\)/);
});
test('v5.9: Gmail monocromático e sem cores da marca na sidebar',()=>{
  const link=publicHtml.match(/<a id="sidebar-gmail"[\s\S]*?<\/a>/)?.[0];
  assert.ok(link);
  assert.match(link,/stroke="currentColor"/);
  assert.doesNotMatch(link,/#4285F4|#34A853|#EA4335|#FBBC04/);
});
