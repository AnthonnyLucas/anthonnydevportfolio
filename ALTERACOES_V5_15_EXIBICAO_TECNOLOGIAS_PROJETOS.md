# Portfólio Anthonny Lucas — v5.15.0

## Correção: tecnologias selecionadas no admin não eram exibidas no projeto público

**Diagnóstico local:** o código v5.14 gerava as etiquetas de tecnologias somente quando recebia a lista `project.technologies`. O código principal era atualizado com versão na URL, mas importava o módulo `project-carousel.js` sem versionamento. Como `/assets/*` usa cache por até uma hora, uma versão anterior desse módulo podia continuar carregada mesmo após um novo deploy. Esta é uma causa provável identificada no projeto, mas não foi possível acessar a API da implantação publicada para confirmar se ocorreu nesse navegador específico.

## Mudanças aplicadas

1. Cache busting do script principal, do módulo de carrossel, do normalizador de tecnologias, do seletor do admin e da nova folha CSS com a versão v5.15.0.
2. O carrossel agora consulta **em paralelo** os projetos, as categorias e o catálogo de tecnologias; quando o backend retorna IDs associados, os rótulos são resolvidos pelo catálogo atual e têm como reservas os registros e snapshots individuais do projeto. Falha no catálogo não impede mostrar nomes presentes no projeto.
3. Os marcadores aparecem **dentro de cada cartão de projeto**, sem reutilizar tecnologias de outros projetos nem interpretar categorias e tags como ferramentas selecionadas.
4. Ordem visual: título → categoria → ferramentas vinculadas → descrição → tags de assuntos → links opcionais. O estilo vitrificado usa a cor cadastrada da tecnologia, seu ícone/logotipo (ou símbolo de reserva), bordas e fundo leves, incluindo as variantes claro e escuro.
5. Na lista de administração, os projetos com ferramentas vinculadas passam a exibir um resumo do que o servidor retornou. Ao salvar, o painel confere a quantidade de ferramentas confirmadas pela API e alerta quando não corresponde à seleção enviada.
6. O carrossel, os filtros, as funções de edição, os dados históricos e o armazenamento Netlify Blobs continuam preservados. Este ZIP **não redefine nem apaga** os dados salvos na Netlify.

## Verificações

- `npm run check` — verificações sintáticas.
- `npm test` — 45 testes automatizados aprovados, incluindo associação por ID, preservação, cores, regressões e carregamento dos arquivos versionados.
- Chromium local isolado com respostas simuladas: verificou etiquetas Java e Python no projeto específico, ausência delas em outro projeto, Dark Mode, Light Mode e largura mobile.
- A Netlify publicada não foi acessível neste ambiente; o teste de integração com os seus dados reais deve ocorrer depois do deploy.

## Publicação e conferência

1. Publique os arquivos da v5.15.0 na **mesma conta e mesmo site Netlify** usados atualmente; não crie um site Netlify novo, porque o armazenamento pertence ao site correspondente.
2. Abra o portfólio, atualize com `Ctrl + F5` e navegue até Projetos. As ferramentas já vinculadas devem aparecer em cada cartão; não é necessário recadastrá-las se o vínculo estiver salvo.
3. Caso algum cartão continue sem ferramentas, no painel admin abra o projeto: o resumo na lista deverá exibir os nomes vindos da API. Confira também o endpoint público `https://SEU-SITE.netlify.app/.netlify/functions/projects` e procure `technologyIds` e `technologies` no registro do projeto (é uma URL de diagnóstico, não uma página para editar). Se ambos estiverem vazios, os vínculos **não foram persistidos naquele site**; selecione novamente e salve no próprio painel. Se eles vierem preenchidos mas a vitrine não mostrar, abra o console do navegador, verifique erros do módulo e confirme que a página carregou `/assets/project-carousel.js?v=5.15.0`.
4. Faça os testes nas versões desktop/mobile e em Light/Dark Mode.

> As tecnologias de exemplo usadas nos testes locais não foram cadastradas automaticamente nos projetos reais.
