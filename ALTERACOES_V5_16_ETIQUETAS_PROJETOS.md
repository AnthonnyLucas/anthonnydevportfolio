# Versão 5.16 — Etiquetas de tecnologias nos projetos

## Objetivo
Corrigir exclusivamente a apresentação de tecnologias vinculadas aos cartões da seção pública Projetos.

## Alterações
- Remoção de todas as imagens, círculos, siglas e ícones antes do nome da tecnologia. Não há mais duplicação (ex.: PHP e PHP).
- Etiquetas compactas com os mesmos valores de tipografia (10px) e padding (5px 10px) das categorias, como IoT.
- Mantido o fundo translúcido com borda sutil na cor cadastrada da ferramenta; light/dark preservados.
- Mantidos os vínculos individuais, filtros, categorias, carrossel, descrições e sistema administrativo.
- Incremento dos parâmetros de versão dos scripts e CSS afetados para evitar caches de arquivos anteriores.

## Teste de aceitação
1. Publique na Netlify utilizando o mesmo site e o armazenamento atual.
2. Em Projetos, identifique um cartão associado a PHP, HTML & CSS, Docker ou Java.
3. Confirme que cada ferramenta aparece apenas como uma pequena etiqueta com seu **nome**, sem logotipo nem círculo.
4. Compare visualmente a altura e o espaçamento com a etiqueta de categoria IoT.
5. Verifique em Light e Dark, desktop e celular, sem alterações no painel de administração.

## Limites
A correção foi realizada em uma cópia do ZIP v5.15, sem alterar registros salvos no Netlify Blobs. A aparência no ambiente publicado ainda deve ser confirmada após deploy.
