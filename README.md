# Portfólio Anthonny Lucas — Full Stack, IoT e Inteligência Artificial

**Versão:** 5.16.0  
**Autor:** Anthonny Lucas Santos da Silva  
**Tipo:** aplicação web de portfólio com painel administrativo (CMS)  
**Publicação prevista:** Netlify, com funções de servidor e Netlify Blobs  
**Idioma:** português brasileiro

## 1. Apresentação e objetivo

Esta aplicação foi criada para apresentar a trajetória profissional, os conhecimentos técnicos, os projetos e as formações de Anthonny Lucas em uma interface visualmente interativa. O propósito é facilitar a descoberta do seu trabalho por recrutadores, empresas, parceiros e visitantes, além de permitir que o próprio autor atualize as informações sem editar manualmente o HTML.

O projeto também funciona como uma **base reutilizável de portfólio pessoal**: outra pessoa pode adaptar a identidade visual, os textos, os links, os projetos, as imagens e as categorias ao seu próprio perfil, observadas as condições de atribuição descritas em [`CREDITOS_E_REUTILIZACAO.md`](CREDITOS_E_REUTILIZACAO.md). O nome e os materiais pessoais do autor não devem ser apresentados como se fossem de terceiros.

### Casos de uso

- **Candidaturas e networking:** apresentar especialidades, projetos e links de contato em um endereço único.
- **Vitrine técnica:** destacar ferramentas e linguagens em carrossel 3D com filtros e navegação acessível.
- **Documentação da evolução profissional:** reunir cursos, oficinas e certificados com imagem e descrição.
- **Gestão de conteúdo:** adicionar, corrigir ou remover registros com autenticação, sem alterar código-fonte ou realizar deploy para cada atualização.
- **Demonstração de habilidades web:** oferecer um exemplo de front-end responsivo integrado a funções serverless e armazenamento persistente.

## 2. Recursos disponíveis

| Área | Visitante | Administrador |
|---|---|---|
| **Início** | Apresentação, especialidades, links e janela de código animada | Edita textos, títulos e chamadas |
| **Sobre mim** | Biografia, fotografia e pilares profissionais | Edita textos, imagem e enquadramento |
| **Tecnologias** | Carrossel 3D, filtros por área, arraste, setas e teclado | Cadastra, altera, exclui, reordena, filtra e categoriza tecnologias; seleciona logotipos |
| **Projetos** | Catálogo horizontal com dois cartões no desktop, filtros por categoria, tecnologias e ferramentas destacadas em cada projeto e links opcionais | Cadastra, edita e exclui projetos; utiliza múltiplas categorias e escolhe várias tecnologias já cadastradas; adiciona imagens e links |
| **Formações** | Vitrine de certificados com filtros, navegação e visualização de imagens | Edita cursos, instituições, horas, categorias, imagens e descrições |
| **Contato** | Atalhos E-mail, WhatsApp, GitHub e LinkedIn; formulário | Ajusta os links em Páginas & textos → Redes sociais; edita textos |
| **Aparência** | Light Mode / Dark Mode, barras de rolagem e partículas animadas | Usa os dois temas também no dashboard |
| **Identidade** | Sidebar com marca, navegação e links sociais | Ajusta título, subtítulo, logotipo, status, links e textos do rodapé |

Na versão **5.11**, a área visual dos certificados também alterna entre fundos claros e escuros, preservando as imagens originais, os filtros e o carrossel.

Os quatro links da seção **Contato** usam os mesmos campos de configuração da sidebar. A versão 5.10 corrige o layout quebrado da página Início introduzido pela camada de partículas: o título voltou ao primeiro bloco da grade, e a ilustração ao segundo. A seção Contato passou a oferecer também GitHub e LinkedIn, mantendo E-mail e WhatsApp.

### Conteúdo inicial e limitações editoriais

O código contém **dados iniciais demonstrativos**, disponíveis sem Netlify Blobs: 25 tecnologias, um conjunto inicial de projetos e 18 formações. Alguns projetos têm ilustrações conceituais, não capturas de implementações verificadas. Antes de divulgar o site como currículo ou prova de trabalho, revise o texto de cada registro e substitua imagens ilustrativas por evidências próprias quando couber. Materiais identificados como internos ou confidenciais não devem ser publicados sem permissão.

## 3. Arquitetura e tecnologias

A aplicação mantém uma arquitetura estática com JavaScript modular e funções serverless, sem framework de interface obrigatório.

```text
public/
  index.html                 Site público
  admin/index.html           Dashboard administrativo
  obrigado/index.html        Confirmação do formulário
  assets/
    style.css, v5*.css       Layout, temas e acabamento visual
    main.js                  Inicialização do site público
    admin.js                 Inicialização do dashboard
    cms-admin.js             Editor de conteúdos e tecnologias
    project-tech-picker.js   Seletor múltiplo de tecnologias para projetos
    content-client.js        Aplicação de textos/links configuráveis
    site-schema.js           Contrato dos campos editáveis
    *-carousel.js            Navegação das vitrines
    particles.js             Rede visual de partículas
    tech-icon-catalog.js     Catálogo de logotipos
    data.js                  Conteúdo inicial/fallback
netlify/functions/
  auth.mjs                   Autenticação e sessão
  content.mjs                Textos e links do site
  technologies.mjs           Tecnologias
  projects.mjs               Projetos
  certificates.mjs           Formações
  categories.mjs             Catálogos de categorias
  media.mjs                  Upload e leitura de imagens
  lib/                       Autorização, armazenamento e categorias
scripts/
  gerar-credenciais.mjs      Gerador local do hash da senha e segredo
tests/                      Testes automatizados e simulações do servidor
netlify.toml                  Configuração de deploy e cabeçalhos
```

**Tecnologias principais:** HTML5, CSS3, JavaScript ES Modules, Node.js (funções da Netlify), Netlify Functions, Netlify Blobs e Netlify Forms. Carrosséis, seleção de temas e animações são implementados com CSS/JavaScript, sem dependência de React ou de outro framework para montar as páginas.

### Fluxo de conteúdo

1. O navegador apresenta a versão inicial da página a partir de `public/`.
2. O site solicita conteúdo, projetos, tecnologias, certificados e categorias aos endpoints `/.netlify/functions/...`.
3. Se houver dados persistidos em **Netlify Blobs**, eles substituem o conteúdo inicial; se o serviço não estiver disponível na prévia estática, o site mantém os dados locais de fallback.
4. O painel administrativo autentica o usuário no servidor; alterações de dados exigem uma sessão válida.
5. Depois de salvar, o site público recupera as informações atualizadas ao ser recarregado. **Salvar dados de conteúdo não exige novo deploy**; alterar arquivos da aplicação exige publicá-los novamente.

## 4. Preparação para executar

**Pré-requisitos:** Node.js **22.13 ou superior**, npm e uma conta Netlify para utilizar autenticação, upload e persistência reais. O Git é recomendado para publicação contínua.

Na pasta raiz (onde estão `package.json` e `netlify.toml`), execute:

```bash
npm install
npm run dev
```

Com o ambiente Netlify Dev iniciado, abra `http://localhost:8888/`. O painel fica em `http://localhost:8888/admin/`.

### Prévia sem backend

Para visualizar **somente o site público**, use `PREVISUALIZAR_SITE.bat` no Windows com Python instalado, ou:

```bash
python3 -m http.server 8000 --directory public
```

Nessa modalidade, entre em `http://localhost:8000/`. Não existe servidor de autenticação/Blobs; o login e a gravação de conteúdo não funcionarão. Não use essa prévia para testar o dashboard.

## 5. Configurar o acesso administrativo

Acesse a pasta raiz em um terminal e execute:

```bash
node scripts/gerar-credenciais.mjs
```

Use uma **senha forte e exclusiva**. O gerador produz os valores necessários sem colocar a senha em texto puro no código:

- `ADMIN_EMAIL`: endereço de login do administrador.
- `ADMIN_PASSWORD_HASH`: hash da senha (scrypt).
- `SESSION_SECRET`: segredo para assinatura das sessões (não compartilhar).

Configure essas três variáveis em **Netlify → Project configuration → Environment variables**, garantindo disponibilidade para Functions no ambiente Production; depois faça novo deploy. O painel fica em `/admin/` ou no cadeado discreto do rodapé do site.

**Importante:** ocultar o cadeado não é segurança; a proteção depende da sessão verificada no servidor. Não coloque credenciais nos arquivos `public/`, em repositórios públicos ou dentro deste ZIP. Veja [`CONFIGURAR_LOGIN_NETLIFY.md`](CONFIGURAR_LOGIN_NETLIFY.md) para problemas comuns de login e publicação.

## 6. Publicação na Netlify

1. Crie um repositório Git com o **projeto inteiro**, preservando `netlify.toml`, `package.json`, `public/` e `netlify/functions/`.
2. Na Netlify, importe o repositório. `netlify.toml` define `publish = "public"` e a pasta de funções.
3. Configure as variáveis secretas descritas acima e execute o deploy.
4. Acesse o site público e confirme que os endpoints `/.netlify/functions/auth` e `/.netlify/functions/content` retornam JSON; a página de login não deve retornar HTML como resposta de uma API.
5. Em **Forms**, configure detecção de formulários e notificações, quando necessário. Realize um envio de teste antes de considerar o formulário operacional.
6. Se estiver **atualizando o mesmo site** na Netlify, preserve a configuração e o contexto de dados armazenados; não troque de site sem planejar migração de Blobs.

**Atenção:** arrastar apenas a pasta `public` para um host estático não publica as funções necessárias para administração. Para uma instalação completa, use o Git integrado à Netlify ou o Netlify CLI.

## 7. Fluxo básico do administrador

1. Entre em `/admin/` com as credenciais configuradas no servidor.
2. Abra **Páginas & textos** para alterar hero, biografia, títulos, links, textos de contato e identificação da sidebar. Os links de redes sociais na seção Contato seguem as mesmas URLs cadastradas para a sidebar.
3. Abra **Tecnologias** para localizar por nome/categoria, usar o catálogo de logotipos e cadastrar áreas e ferramentas; a lista possui rolagem interna.
4. Abra **Projetos** para adicionar registros, associar várias categorias, anexar uma imagem e informar links de demonstração ou repositório, se existirem.
5. Abra **Formações e certificados** para cadastrar e editar formações, categorias e imagens.
6. Salve e aguarde a confirmação positiva do servidor; somente então a interface retorna ao topo. Em caso de erro, a página mantém sua posição e exibe o aviso correspondente.
7. Abra o site público em outra aba e recarregue para verificar o resultado.

Os campos de texto são tratados como texto, não como HTML executável. Campos de imagem e links possuem validações específicas no servidor. Uploads aceitam JPG, PNG, WebP e GIF com até **4 MB** por arquivo.

## 8. Acessibilidade e desempenho

- Navegação com teclado para carrosséis e botões onde implementado.
- Layout adaptado para desktop e celular.
- Preferência de tema compartilhada entre portfólio e painel, armazenada localmente no navegador.
- Partículas desenhadas em `<canvas>` atrás do conteúdo, sem capturar cliques; respeitam `prefers-reduced-motion` e reduzem processamento em abas ocultas.
- Contraste entre texto e painéis ajustado para Light Mode e Dark Mode.
- Ícones sociais identificados por rótulos acessíveis.
- O formulário de contato tem campos obrigatórios e mecanismo honeypot.

## 9. Testes e verificação de qualidade

```bash
npm run check
npm test
```

- `npm run check`: verifica a sintaxe de módulos JavaScript e funções Node.
- `npm test`: executa a suíte de testes incluída no projeto. Alguns testes usam um armazenamento **simulado**, sem a Netlify real.
- Para verificar a interface, teste a seção Início em 1440 px, 1024 px e 390 px, tanto em modo claro como escuro. Em telas largas, o conteúdo deve ficar **à esquerda**, a ilustração **à direita** e nenhum texto pode ser cortado na lateral. Repita os testes para os quatro atalhos de Contato.

Consulte o documento completo [`GUIA_FUNCIONALIDADES_E_TESTES.md`](GUIA_FUNCIONALIDADES_E_TESTES.md) para os procedimentos, cenários de falha, expectativas e resultados que ainda dependem da Netlify publicada.

## 10. Reutilização, créditos e conteúdo de terceiros

Os termos de reutilização do código e o formato de atribuição estão em [`CREDITOS_E_REUTILIZACAO.md`](CREDITOS_E_REUTILIZACAO.md). O projeto foi desenvolvido para ser adaptável, mas **a autorização de reutilizar o código não transfere direitos sobre fotografias, certificados, logotipos, fontes ou serviços de terceiros**. Consulte também [`ICONES_CREDITOS.md`](ICONES_CREDITOS.md).

**Autor:** Anthonny Lucas Santos da Silva.  
**Portfólio de referência:** https://projetop-anthonny.netlify.app/

## 11. Documentos adicionais

- [`GUIA_FUNCIONALIDADES_E_TESTES.md`](GUIA_FUNCIONALIDADES_E_TESTES.md) — inventário funcional e plano de teste manual/automatizado.
- [`CREDITOS_E_REUTILIZACAO.md`](CREDITOS_E_REUTILIZACAO.md) — créditos e condições para reutilização.
- [`CONFIGURAR_LOGIN_NETLIFY.md`](CONFIGURAR_LOGIN_NETLIFY.md) — autenticação e diagnóstico.
- [`ICONES_CREDITOS.md`](ICONES_CREDITOS.md) — referências do catálogo de ícones.
- `ALTERACOES_V*.md` — registro das evoluções anteriores do projeto.

> **Estado de validação da versão 5.10:** foi verificada a estrutura HTML/CSS corrigida, a sintaxe dos módulos e os testes automatizados locais. A publicação, a autenticação real, a persistência e o recebimento de formulários devem ser conferidos no ambiente Netlify do responsável pelo site.


## Atualização v5.12 — Biblioteca ampliada de tecnologias

O painel **Tecnologias → Catálogo de logotipos** carrega sob demanda um índice de nomes de Devicon, SVG Logos e Simple Icons via Iconify, mantendo as 156 opções anteriores como reserva. Escolha a biblioteca no filtro, pesquise pelo nome e clique no símbolo para preenchimento do formulário. O campo de URL e o upload manual continuam disponíveis.

Ao navegar com internet, o acervo oferece milhares de símbolos e logotipos. Para evitar lentidão, a interface renderiza somente 48 opções por vez e carrega imagens sob demanda; os índices de nomes ficam armazenados por sete dias no navegador. Se houver falha da API externa, a interface sinaliza o problema e mostra o botão para tentar novamente.

A Netlify Function `icon-library.mjs` oferece uma recuperação pelo próprio domínio, limitada às três coleções permitidas. A função requer acesso à internet para obter os metadados. Confira **`ICONES_CREDITOS.md`** e **`ALTERACOES_V5_12_CATALOGO_ICONES.md`** para fontes, licenças, dependências e roteiro de testes.


## Atualização v5.13 — Rolagem preservada na vitrine pública

A janela de **Ampliar imagem** em **Formações** permanece fixa na área visível e não desloca o site para o Início. Fechar a imagem, pressionar Esc ou alterar o filtro preserva o ponto atual de leitura. A mudança não afeta a navegação proposital da sidebar nem o fluxo de confirmação ao salvar no painel administrativo.

O CSS dos certificados recebeu uma nova versão de URL para atualizar o cache após o deploy. Consulte [`ALTERACOES_V5_13_ROLAGEM_PUBLICA.md`](ALTERACOES_V5_13_ROLAGEM_PUBLICA.md) para a explicação e a lista de verificações.


## Atualização v5.14 — Tecnologias vinculadas a cada projeto

No painel **Projetos**, o antigo campo de tecnologias digitadas com vírgulas foi substituído por um seletor pesquisável de múltipla escolha. A lista é carregada da seção **Tecnologias** já cadastradas do seu perfil — e **não** da biblioteca de milhares de logotipos. Para usar Angular, IoT, IA ou outra ferramenta em um projeto, primeiro cadastre a tecnologia na seção Tecnologias (caso ainda não exista) e selecione-a ao criar ou editar o projeto.

O site público agora exibe a seção **Tecnologias e ferramentas** dentro do cartão específico do projeto, com etiquetas realçadas e logotipos cadastrados quando disponíveis. As **categorias** continuam independentes (ex.: Energia Solar, Automação Residencial, Internet das Coisas) e não são automaticamente consideradas ferramentas. O mesmo registro de tecnologia pode ser associado a vários projetos.

A associação é feita com IDs persistentes, então renomear a tecnologia reflete nos projetos vinculados. Uma exclusão futura não elimina o resumo histórico salvo no projeto. Registros antigos com nomes de tecnologias em `tags` são reconhecidos quando o nome corresponder a uma tecnologia existente, e os outros marcadores permanecem preservados como tópicos. A seleção nova não depende de digitação livre.

**API:** `POST /.netlify/functions/projects` aceita `technologyIds` (até 30 IDs únicos); `GET` retorna `technologyIds`, `technologies` (registros públicos resolvidos) e `topics` (marcadores antigos sem nomes de tecnologias). Novos IDs são validados no catálogo persistido pelo servidor. Consulte `ALTERACOES_V5_14_TECNOLOGIAS_POR_PROJETO.md`.


## Atualização v5.15 — Exibição das tecnologias dentro dos projetos

A v5.15 corrige o carregamento dos módulos públicos e torna a leitura dos IDs das tecnologias vinculadas mais resiliente, trazendo etiquetas vitrificadas com cores individuais para cada cartão de projeto. Consulte [`ALTERACOES_V5_15_EXIBICAO_TECNOLOGIAS_PROJETOS.md`](./ALTERACOES_V5_15_EXIBICAO_TECNOLOGIAS_PROJETOS.md) para testes e procedimentos de publicação.

## Atualização v5.16 — Etiquetas compactas das tecnologias nos projetos

As tecnologias vinculadas a cada projeto agora são exibidas somente pelo **nome**, sem círculo, ícone ou sigla repetida. As etiquetas mantêm aparência vitrificada e usam a mesma escala compacta dos marcadores de categoria, como IoT. O cadastro e a seleção múltipla no painel continuam inalterados. Consulte [`ALTERACOES_V5_16_ETIQUETAS_PROJETOS.md`](./ALTERACOES_V5_16_ETIQUETAS_PROJETOS.md).
