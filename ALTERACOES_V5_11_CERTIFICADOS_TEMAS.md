# Alteração v5.11 — Imagens dos certificados com tema claro/escuro

## Escopo

Correção visual pontual na seção pública **Formações**. O fundo azul-escuro da área da imagem permanecia fixo mesmo com o Light Mode ativado.

## O que foi alterado

- `public/assets/cert-carousel.css`: regras específicas para `html[data-theme="light"]` nos elementos `.cert-visual`, `.cert-no-image`, borda interna, ícone e legenda do placeholder, miniatura e botão **Ampliar imagem**.
- `public/index.html`: parâmetro `?v=5.11.0` no CSS da galeria para atualização de cache no navegador.
- Incluído teste de regressão do tema dos certificados.

## O que não mudou

- Dark Mode original e imagens dos certificados.
- Dados das formações, filtros, navegação por setas, arraste, modal de ampliação e painel administrativo.
- Sistema de autenticação, armazenamento e links do portfólio.

## Como validar depois da publicação na Netlify

1. Entre em **Formações** com o **Light Mode** ativado: os fundos das miniaturas (incluindo “Imagem a adicionar”) devem ser claros.
2. Clique no botão de tema e volte ao **Dark Mode**: os fundos devem voltar ao azul-escuro.
3. Amplie um certificado, percorra os cartões com as setas e teste o filtro de categorias.
4. Repita no celular.
5. Se a imagem ainda mantiver o fundo antigo, faça recarregamento completo e confirme que `cert-carousel.css?v=5.11.0` foi implantado.

A conferência com Chromium foi feita em um exemplo isolado usando os mesmos estilos; a aplicação publicada deve ser validada na conta Netlify.
