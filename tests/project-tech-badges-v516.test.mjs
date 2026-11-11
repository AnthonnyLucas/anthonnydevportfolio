import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const content = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('v5.16: projetos exibem somente o nome de cada tecnologia, sem ícone ou sigla repetida', () => {
  const js = content('public/assets/project-carousel.js');
  assert.match(js,/pill\.append\(el\('span','project-tech-name',tech\.label\)\)/);
  assert.doesNotMatch(js,/project-tech-(icon|glyph|logo)/);
  assert.doesNotMatch(js,/pill\.append\(badge/);
  assert.match(js,/resolveProjectTechnologies\(project,technologyCatalog\)/);
});
test('v5.16: etiquetas usam dimensões compactas semelhantes à categoria IoT', () => {
  const css = content('public/assets/v5-15.css');
  const badge = css.match(/#project-grid \.project-tech-pill\{([^}]+)\}/)?.[1] || '';
  assert.match(badge,/padding:5px 10px/);
  assert.match(badge,/font:700 10px var\(--display\)/);
  assert.match(badge,/min-height:0/);
  assert.match(badge,/--tech-accent/);
  assert.match(badge,/backdrop-filter:blur/);
  assert.doesNotMatch(css,/project-tech-(icon|glyph|logo)/);
  const categories = content('public/assets/v5.css');
  assert.match(categories,/project-category\{[^}]*padding:5px 10px/);
});
test('v5.16: os arquivos públicos usam identificador novo para evitar cache antigo', () => {
  assert.match(content('public/assets/main.js'),/project-carousel\.js\?v=5\.16\.0/);
  assert.match(content('public/index.html'),/main\.js\?v=5\.16\.0/);
  assert.match(content('public/index.html'),/v5-15\.css\?v=5\.16\.0/);
});
