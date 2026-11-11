# Versão 5.18 — Correção do carregamento do painel administrativo

## Diagnóstico confirmado

Mensagem observada na Netlify: **"Login válido, mas alguns dados não foram carregados: project is not defined"**.

O erro surgiu no pacote **5.15** e foi mantido nos pacotes **5.16 e 5.17**. Foi introduzida uma linha de resumo de tecnologias de **projetos** no interior de `renderCertList()`, em `public/assets/admin.js`. Ao haver formações na lista, a linha acessava a variável `project`, inexistente naquele escopo, lançando `ReferenceError`. Essa exceção interrompia `refresh()` **antes** da chamada a `cmsAdmin.refresh()`, responsável por carregar a listagem de tecnologias. Por isso, formações e tecnologias deixavam de aparecer no painel, apesar das contagens de projetos e formações já estarem disponíveis.

A comparação dos arquivos dentro dos ZIPs 5.14, 5.15, 5.16 e 5.17 não identificou remoção de arquivos na passagem de uma versão para a seguinte. Este é um erro de **execução do frontend**, não uma exclusão comprovada no armazenamento.

## Correções

1. Removida a instrução que referenciava `project.technologies` de dentro de `renderCertList()`; a informação permanece somente no editor/lista de projetos.
2. O carregamento foi isolado por área (`Promise.allSettled` para projetos, formações, seletor de tecnologias e CMS), preservando as seções que puderem ser carregadas mesmo que outra consulta falhe.
3. A lista de tecnologias e os campos de texto não são mais impedidos de carregar por uma falha no renderizador de certificados.
4. Mensagens de falha de carregamento não são substituídas por uma mensagem genérica de sucesso se ainda houver falhas reais.
5. Filtros de projetos e formações toleram registros antigos com títulos/organizações opcionais ausentes, sem quebrar a página inteira.
6. Atualizados `admin.js?v=5.18.0` e `cms-admin.js?v=5.18.0` para reduzir o risco de o navegador usar o script antigo em cache.
7. **Nenhuma alteração destrutiva** nas rotinas de leitura/gravação da Netlify Blobs, nas chaves de armazenamento, nas funções da API ou nas informações dos projetos foi realizada.

## Continuidade das versões anteriores

Preservadas as funcionalidades da versão 5.17: carrossel circular de projetos, botão de baixar currículo tradicional/ATS, tecnologias por projeto sem ícones duplicados, temas claro/escuro, biblioteca de ícones, filtros, navegação por certificados e uploads para Netlify.

## Testes automatizados

Execute na raiz do projeto com Node 22.13+:

```bash
npm run check
npm test
```

Há testes de regressão em `tests/admin-recovery-v518.test.mjs` para:
- Renderizar formações carregadas sem acessar a variável de projeto;
- Abrir projetos, formações, editor de páginas e tecnologias no fluxo inicial;
- Preservar as outras seções se a API de certificados falhar;
- Preservar as outras seções se o renderizador de certificados falhar;
- Mostrar a falha parcial corretamente;
- Confirmar que registros já armazenados de projetos, formações e tecnologias continuam sendo devolvidos pelas APIs (Netlify Blobs simulada).

## Como publicar e conferir com seus dados reais

**É imprescindível publicar dentro do MESMO site da Netlify que contém seu armazenamento atual.** Não crie um site novo: Netlify Blobs pertence ao contexto do site/deploy. Não exclua o armazenamento nem reconfigure variáveis de produção sem necessidade.

1. Faça backup, se disponível, das informações cadastradas e confirme que o repositório GitHub correto está ligado ao site publicado.
2. Publique todo o ZIP 5.18 no **mesmo projeto/repositório**. Aguarde o deploy concluir sem erros.
3. Acesse `/admin/` e faça uma atualização forçada (`Ctrl + F5` no Windows).
4. Entre na aba **Formações & certificados** e confirme os seus registros (ex.: 18 cadastrados), a busca, edição e a visualização.
5. Abra **Tecnologias** e confirme a lista cadastrada, não apenas o catálogo de logotipos.
6. Confira **Projetos**, incluindo as tecnologias vinculadas; teste o carrossel circular no site público e os botões de CV.

### Se algum dado não aparecer depois da correção

Abra separadamente os seguintes endereços em uma aba do navegador (são APIs públicas de leitura do próprio portfólio):

- `https://SEU-SITE.netlify.app/.netlify/functions/certificates`
- `https://SEU-SITE.netlify.app/.netlify/functions/technologies`
- `https://SEU-SITE.netlify.app/.netlify/functions/projects`

Confira os arrays `certificates`, `technologies` e `projects` retornados. Se o array contém seus registros, mas o painel continua vazio, a falha está na visualização/cache e pode ser investigada. Se os arrays não contiverem os registros, verifique **site ID / conta Netlify, configuração de Blobs, deploy, funções e ambiente**. Não preencha e salve dados padrão apenas para “recuperar” itens, pois isso pode sobrescrever o conjunto pretendido.

**Limitação de verificação:** os testes executam localmente com simulação do servidor Netlify Blobs; não acessam sua base de dados de produção. A existência e a integridade dos registros reais precisam ser validadas na Netlify após a atualização.

## Resultado de validação desta entrega

- `npm run check`: aprovado.
- `npm test`: **60 testes aprovados, nenhuma falha**.
- Teste isolado no Chromium com o HTML, CSS e JavaScript reais do administrador e respostas simuladas das APIs: o painel exibiu **5 projetos, 18 formações e 29 tecnologias**; a lista expandida exibiu todas as 18 formações e o console não registrou erros de JavaScript.
- O teste de navegador não acessou o site hospedado nem os registros privados reais, que precisam ser conferidos após o deploy.
