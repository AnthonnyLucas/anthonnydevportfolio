import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const css = read('public/assets/cert-carousel.css');
const html = read('public/index.html');
const renderer = read('public/assets/cert-carousel.js');
test('v5.11: área de imagens dos certificados acompanha o Light Mode', () => {
  for (const cls of ['cert-visual','cert-no-image','cert-placeholder-caption','cert-abstract','cert-photo','cert-view']) {
    assert.ok(css.includes(`html[data-theme="light"] .${cls}`), `Regra de ${cls} no tema claro`);
  }
  assert.match(css, /html\[data-theme="light"\] \.cert-view:hover/);
  assert.match(css, /html\[data-theme="light"\] \.cert-no-image::after/);
  assert.match(html, /cert-carousel\.css\?v=5\.11\.0/);
});
test('v5.11: Dark Mode, certificados e navegação continuam intactos', () => {
  assert.match(css, /\.cert-visual\{[^}]*linear-gradient\(130deg,#2e3955,#12182b\)/);
  assert.match(css, /\.cert-no-image\{[^}]*#19243a,#0e1729/);
  for (const label of ['cert-card','cert-photo','cert-viewport','cert-no-image','cert-view']) assert.ok(renderer.includes(label));
  assert.match(renderer, /dialog\.showModal\(\)/);
});
