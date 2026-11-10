import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('v5.13: visualizador do certificado fica fixo no viewport, sem puxar a rolagem para o topo', () => {
  const css = read('public/assets/cert-carousel.css');
  const modal = css.match(/\.cert-dialog\s*\{([^}]+)\}/)?.[1];
  assert.ok(modal, 'estilo do modal precisa existir');
  assert.match(modal, /position\s*:\s*fixed\s*!important\s*;/);
  assert.match(modal, /inset\s*:\s*0\s*;/);
  assert.match(modal, /margin\s*:\s*auto\s*;/);
  assert.match(modal, /max-height\s*:\s*92vh\s*;/);
});

test('v5.13: ampliar e fechar continuam botões locais, sem navegar para âncoras', () => {
  const script = read('public/assets/cert-carousel.js');
  const html = read('public/index.html');
  assert.match(script, /view\.type\s*=\s*'button'/);
  assert.match(script, /dialog\.showModal\(\)/);
  assert.match(script, /dialog\.close\(\)/);
  assert.match(html, /id="cert-dialog-close"[^>]*type="button"/);
  assert.match(html, /\/assets\/cert-carousel\.css\?v=5\.13\.0/);
  assert.doesNotMatch(script, /(?:window\.)?location\s*=|location\.href\s*=/);
});

test('v5.13: retorno automático ao topo continua restrito ao admin', () => {
  const publicScript = read('public/assets/main.js');
  const admin = read('public/assets/admin-feedback.js');
  assert.doesNotMatch(publicScript, /scrollToTop|scrollTo\(\{\s*top\s*:/);
  assert.match(admin, /scrollToTop/);
});
