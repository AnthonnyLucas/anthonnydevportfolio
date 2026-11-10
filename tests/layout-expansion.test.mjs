import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync('public/assets/v5.css','utf8');
const admin=readFileSync('public/assets/admin.js','utf8');
const markup=readFileSync('public/admin/index.html','utf8');

test('v5.4: both expandable lists override fixed compact heights',()=>{
  assert.match(css, /#technologies-panel\.tech-list-expanded > \.admin-list #admin-tech-list\s*\{[^}]*max-height: none/s);
  assert.match(css, /#certificates-panel\.cert-list-expanded > \.admin-list #admin-cert-list\s*\{[^}]*max-height: none/s);
  assert.match(admin, /classList\.toggle\('cert-list-expanded'/);
  assert.match(admin, /ResizeObserver\(alignCertColumns\)/);
  assert.match(markup, /id="cert-show-all"[^>]*aria-controls="admin-cert-list"/);
});
