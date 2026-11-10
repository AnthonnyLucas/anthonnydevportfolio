# Portfólio Anthonny — atualização 5.0

## Alterações realizadas

1. **Projetos públicos:** catálogo de dois cartões visíveis no desktop, um no celular; setas, arraste e toque; navegação por teclado, contador, categorias dinâmicas e cartões de altura uniforme. A listagem pode crescer sem criar dezenas de linhas na página.
2. **Categorias de projetos:** um projeto pode pertencer a uma ou mais categorias. O painel permite criar e renomear novas áreas e excluí-las quando não houver projetos vinculados. Os filtros públicos são gerados a partir dessas categorias.
3. **Projetos no painel:** busca por título, filtro por categoria, cinco registros iniciais, controle "Ver todos", contador de resultados e rolagem interna. O formulário de projeto contém seleção múltipla de categorias.
4. **Tecnologias no painel:** pesquisa por nome, filtro de tipo, seis resultados iniciais, controle "Ver todas", rolagem interna e manutenção da reordenação na vitrine.
5. **Ícones:** catálogo pesquisável com **156 opções**, usando imagens do Devicon quando disponíveis. Imagens não encontradas recebem um fallback de texto; o usuário pode fornecer uma imagem própria. **Assembly não tem logotipo oficial universal**, então o catálogo inclui um SVG ilustrativo "ASM" armazenado no projeto.
6. **Formações no painel:** pesquisa por nome ou instituição, filtro por área, cinco registros iniciais, controle "Ver todas" e rolagem interna.
7. **Áreas de formação:** cadastro, renomeação e exclusão segura de categorias não utilizadas; os filtros públicos são atualizados automaticamente. Os registros existentes são preservados.
8. **Sidebar:** edite pelo CMS o nome da marca, subtítulo, letra ou símbolo, imagem de marca, rótulos de navegação, descrição de status e até três links externos opcionais. A posição, o fundo translúcido e a estrutura original foram preservados.
9. **Redes sociais:** os links GitHub e LinkedIn agora têm ícones vetoriais discretos com fundo transparente; as URLs são editáveis nos campos gerais do CMS. O acesso administrativo discreto permanece no rodapé público.

## Migração e persistência

- Os arquivos v4 não são modificados; esta versão é uma cópia independente para publicação na mesma aplicação da Netlify.
- A nova função `/.netlify/functions/categories?kind=projects|certificates` mantém catálogos separados para projetos e formações no Netlify Blobs.
- Categorias utilizam **IDs estáveis**. Projetos antigos que possuíam apenas `category` continuam válidos, e formações antigas com apenas `group` continuam válidas. Antes de renomear uma categoria, os registros antigos são vinculados a esses IDs para não perder a associação.
- Excluir uma categoria com projetos ou formações vinculados retorna erro 409; remova a associação antes de excluir.
- Valores e links só são exibidos como texto ou URL validada; nenhuma senha vai no front-end.
- O catálogo de ícones externos depende da conectividade e disponibilidade da CDN. O SVG ASM é local; todas as tecnologias podem usar logotipos enviados pelo painel.

## Como testar no navegador

1. Na raiz do projeto, execute `npm install` e `npm run dev` (Node.js 22.13+).
2. Configure credenciais em variáveis de ambiente para autenticar; siga `CONFIGURAR_LOGIN_NETLIFY.md`.
3. Na aba **Projetos**, crie uma categoria, associe um novo projeto a duas categorias e salve. Teste ambas nos filtros públicos; teste a busca por nome e "Ver todos" no painel.
4. Na aba **Tecnologias**, pesquise pelo nome, selecione um logotipo no catálogo e salve. Teste o catálogo com a busca `Assembly` e a vitrine pública.
5. Na aba **Formações**, crie uma área, atribua-a a uma formação e verifique o filtro público.
6. Em **Páginas & textos → Identidade e rodapé**, edite a marca e os links, salve e atualize o site público.
7. Confira a vitrine e a sidebar no computador e no celular, além de contraste e navegação por teclado.

## Verificações e limitações

- Testes automatizados de APIs e validação de sintaxe são executados com `npm run check` e `npm test`. A checagem estrutural dos controles HTML também é realizada.
- **Não foi possível executar a navegação automatizada visual neste ambiente**, pois o Chromium bloqueou o acesso às páginas locais com `ERR_BLOCKED_BY_ADMINISTRATOR`. Os testes completos no navegador e no ambiente real da Netlify precisam ser confirmados após a publicação.
- A publicação por arraste apenas de `public/` não implanta Functions nem Netlify Blobs. Para todas as funções do painel use deploy via Git ou Netlify CLI, na mesma aplicação Netlify já utilizada para preservar os dados remotos.
