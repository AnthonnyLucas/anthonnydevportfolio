# Versão 5.6 — Setas laterais em vidro e novos contatos

## Escopo

- Tecnologias: botões `tech-prev`/`tech-next` movidos para as extremidades do carrossel, ao centro vertical do palco; contador e barra de progresso permanecem na área inferior.
- Projetos: botões `project-prev`/`project-next` agora flutuam junto às laterais da vitrine, sem alterar a lógica de filtros, arraste ou quantidade de cartões visíveis.
- Formações: botões `cert-prev`/`cert-next` reposicionados nas laterais; contador e visualização de certificados preservados.
- Um único estilo compartilhado em `public/assets/v5-6.css`, com vidro translúcido, contorno discreto, ícones SVG nítidos, foco acessível, hover, opção de movimento reduzido e adaptação para celular.
- Sidebar: acrescentados Gmail e WhatsApp com SVG embutido, mantendo GitHub e LinkedIn existentes. Gmail usa o endereço de contato público configurado em `contactEmail`.
- WhatsApp: novo campo `whatsappUrl` em `public/assets/site-schema.js`, automaticamente editável no grupo **Conteúdo geral** do painel. Informe link de conversa HTTPS de `wa.me`, `api.whatsapp.com` ou `web.whatsapp.com`; até então o ícone fica aparente, mas inativo. Não foram usados números inventados.

## Testes

- `npm run check` e `npm test` na pasta raiz.
- Navegador Chromium em página de teste isolada usando o HTML e CSS completos e os controladores originais, sem acesso direto a localhost: testes em larguras 1440 e 390px validaram posição centralizada, setas laterais, cliques e atualização dos contadores.
- Os testes não substituem a conferência do site implantado e da persistência de alterações em uma conta real Netlify.

## Publicação

Conecte o repositório do projeto à **mesma aplicação Netlify** onde estão os dados persistidos. A pasta publicada segue sendo `public` e as funções continuam em `netlify/functions`. Não faça upload somente da pasta `public` se precisar dos recursos de administração.
