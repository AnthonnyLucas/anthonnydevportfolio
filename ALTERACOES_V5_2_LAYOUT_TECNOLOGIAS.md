# Atualização v5.2 — Expansão da lista de tecnologias

## Escopo

Esta é uma correção **exclusivamente visual e comportamental da aba Tecnologias** do painel administrativo, derivada da versão 5.1. Não houve alterações nas APIs, nos dados, na autenticação ou nas abas Projetos, Formações e Páginas & Textos.

## O que mudou

- O botão **Ver todas as tecnologias** passa a alternar um estado visual (`tech-list-expanded`).
- Ao expandir, a lista de tecnologias ocupa o espaço vertical livre da **coluna esquerda**, deslocando o gerenciador de categorias para baixo.
- O gerenciador aberto pode utilizar um pouco mais de altura e continua com rolagem própria quando necessário.
- A altura da coluna esquerda permanece vinculada à altura real do formulário **Nova tecnologia** à direita, em telas com largura de pelo menos 931 px.
- No celular, as colunas permanecem empilhadas e a lista expandida recebe espaço adicional sem sobrepor o gerenciador.
- O botão recebe `aria-expanded` e `aria-controls`, facilitando o uso com tecnologias assistivas.
- Quando a pesquisa ou o filtro é alterado, o modo expandido é desativado e os resultados filtrados continuam disponíveis.

## Como testar

1. Publique o projeto na Netlify (ou execute `npm run dev` com as funções configuradas) e entre no painel.
2. Abra **Tecnologias** e observe o alinhamento das colunas.
3. Clique em **Ver todas as tecnologias**. A lista deve ficar mais alta, mostrando mais registros antes de exigir rolagem interna, e **Gerenciar categorias** deve ficar mais abaixo.
4. Confirme que a borda inferior da coluna esquerda não ultrapassa a da coluna **Nova tecnologia**.
5. Abra o gerenciador de categorias, percorra a lista e confirme que ele mantém rolagem interna.
6. Clique em **Mostrar as primeiras 18** para voltar ao modo compacto.
7. Confirme que buscas, filtros, cadastro e edição seguem funcionando.

## Testes locais

- `npm run check` e `npm test` passam.
- Teste visual de layout em Chromium usando HTML/CSS do projeto e **dados simulados** em resoluções 1440×900, 1080×800 e 390×844. Foi validada a expansão e o alinhamento da coluna no desktop. Essa simulação não substitui um teste com a sua conta Netlify.

As demais funcionalidades foram intencionalmente preservadas.
