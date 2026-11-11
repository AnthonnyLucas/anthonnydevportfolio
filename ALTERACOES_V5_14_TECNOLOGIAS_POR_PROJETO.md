# Versão 5.14 — Tecnologias e ferramentas por projeto

**Base:** v5.13. **Escopo:** painel administrativo (Projetos) e cartões da galeria pública.

## Alteração solicitada

A lista de tecnologias de um projeto deve ser escolhida dentre as tecnologias efetivamente cadastradas na área Tecnologias. Projetos distintos utilizam seleções independentes; ferramentas destacam-se no cartão do projeto, e não apenas na vitrine geral de habilidades.

## Implementação

1. Campo livre separado por vírgulas substituído por seletor com pesquisa e múltiplos checkboxes, com limite de 30 associações por projeto.
2. Seletor sincronizado com `/.netlify/functions/technologies` ao autenticar e ao abrir a aba Projetos. Seleções salvas são restauradas ao editar.
3. Projetos gravam `technologyIds` com validação no servidor. A resposta pública resolve os registros de tecnologia na lista persistente; alterações futuras no nome e no logotipo passam a aparecer nos projetos existentes.
4. O projeto também mantém `technologySnapshots`, para conservar o histórico se um item do catálogo for removido.
5. `GET` preserva compatibilidade com projetos legados: nomes em `tags` iguais aos nomes das tecnologias cadastradas são reconhecidos; os demais continuam como `topics`, sem duplicatas visuais.
6. O cartão da galeria pública possui o título **Tecnologias e ferramentas**, chips com contraste adequado nos dois temas e logos opcionais. Categorias continuam em badges independentes no topo.
7. Mantidos dados de projetos, descrições, imagens, categorias múltiplas, links, carrossel, temas e comportamento de rolagem corrigido na v5.13.

## Como usar

- Entre em `/admin/`, abra **Tecnologias**, cadastre as ferramentas desejadas e salve.
- Abra **Projetos**, crie um novo projeto ou edite um existente, pesquise as tecnologias e marque várias caixas.
- Salve o projeto e atualize a página pública. As tecnologias aparecem apenas no cartão do projeto associado.
- **Exemplo:** para exibir IoT e IA no Projeto AQUA, os dois nomes precisam existir entre as tecnologias cadastradas; depois selecione ambos ao editar o AQUA. Nada é marcado automaticamente só porque está em uma categoria.

## Validação

- `npm run check` — aprovado localmente na geração do pacote.
- `npm test` — 42 testes aprovados, incluindo os testes da v5.14 para CRUD, IDs, associações independentes, mudanças de nome, preservação histórica, migração de marcadores e estrutura das duas interfaces.
- Navegador local automatizado: **não concluído**. O ambiente de teste bloqueou a navegação por política administrativa (`ERR_BLOCKED_BY_ADMINISTRATOR`). Não afirmar validação visual em Chromium.
- Netlify publicada: **a validar pelo proprietário** após deploy, especialmente a autenticação real e a persistência no Blobs.
