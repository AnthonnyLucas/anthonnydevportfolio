> **Atualização v5.1 — Aba Tecnologias:** leia `ALTERACOES_V5_1_TECNOLOGIAS.md` para detalhes de correções, testes e novas categorias. Os SVGs de marcas locais têm seus créditos em `ICONES_CREDITOS.md`.

> **Atualização v5.0:** consulte [ALTERACOES_V5.md](ALTERACOES_V5.md) para catálogo de projetos, categorias múltiplas, listas pesquisáveis, ícones e sidebar editável. As mudanças da versão anterior estão em [ALTERACOES_V4.md](ALTERACOES_V4.md).

# Portfólio profissional — preparado para Netlify

Versão 5.0, construída a partir do projeto atualizado `ProjetoP.rar` (HTML/CSS/JavaScript). O nome do site continua sendo **Portfólio**. Mantém a identidade profissional e adiciona uma interface responsiva com animações, carrossel tridimensional de tecnologias com filtros, vitrine horizontal de projetos com dois cartões, categorias dinâmicas e múltiplas, vitrine de 18 formações com filtros e imagens, sidebar com acabamento de vidro e gerenciamento de todo o conteúdo pelo painel administrativo. As listas de projetos, tecnologias e formações possuem busca, filtro, rolagem interna e visualização completa sem alongar a página.

## Estrutura

- `public/index.html`: site público, compatível com publicação estática.
- `public/admin/index.html`: formulário de login e painel para editar textos, imagens, tecnologias, projetos e certificados.
- `public/assets/`: CSS, JavaScript e recursos da interface. Inclui `tech-carousel.js`, `tech-carousel.css` e a pasta `tech-logos` com ícones SVG locais de reserva, além de `cert-carousel.js`, `cert-carousel.css` e imagens disponíveis dos certificados.
- `netlify/functions/auth.mjs`: autenticação por e-mail e senha com cookie `HttpOnly` assinado.
- `netlify/functions/projects.mjs`: listagem pública e inclusão/edição/exclusão autenticada de projetos com múltiplas categorias.
- `netlify/functions/categories.mjs`: cadastro de categorias para projetos e formações, com identificadores estáveis, migração de dados anteriores e proteção contra exclusão de categorias em uso.
- `public/assets/project-carousel.js`: vitrine de dois projetos com filtros, setas e arraste.
- `public/assets/category-admin.js` e `tech-icon-catalog.js`: editor de categorias e catálogo pesquisável de logotipos.
- `netlify/functions/certificates.mjs`: lista pública e edição autenticada das formações e de suas imagens.
- `netlify/functions/content.mjs` e `netlify/functions/technologies.mjs`: CMS de seções e catálogo editável com escrita autenticada.
- `public/assets/site-schema.js` e `public/assets/cms-admin.js`: campos permitidos e interface do editor.
- `netlify/functions/media.mjs`: upload de imagens até 4 MB e entrega das imagens armazenadas.
- `netlify/functions/lib/security.mjs`: validação e segurança.
- `netlify.toml`: configurações da Netlify (publicação, funções, cabeçalhos de proteção).

## Publicar na Netlify: passo a passo

**Recomendado: conectar um repositório GitHub** para que a Netlify execute a instalação das dependências e publique automaticamente os arquivos do site e as funções.

1. No computador, extraia este ZIP e entre na pasta extraída (aquela onde estão `package.json` e `netlify.toml`).
2. Suba **o conteúdo dessa pasta** para um repositório GitHub privado (ou público, sem qualquer arquivo `.env`).
3. Entre em https://app.netlify.com/ e escolha **Add new project → Import an existing project**; conecte o repositório.
4. Use a raiz do projeto como base; o `netlify.toml` já define a pasta de publicação `public`, o comando de build e a pasta das funções. Não selecione `public` como diretório base.
5. Faça o primeiro deploy. O site público já funcionará; o painel mostrará que ainda faltam credenciais.
6. Para ativar o painel, configure no site da Netlify, em **Project configuration → Environment variables**, as variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET`. Escolha escopo **Functions** ou **All** e ambiente **Production**; faça novo deploy após configurar.
7. Gere valores seguros localmente, na raiz do projeto, com `node scripts/gerar-credenciais.mjs`. Este script pede o e-mail e a senha, produz o hash e um segredo; **não salva a senha em arquivos**. Utilize o e-mail administrativo de sua escolha e defina uma senha longa e exclusiva. O gerador alerta sobre senhas fracas. **É altamente recomendado substituí-la por uma senha longa e exclusiva antes de tornar o painel público.** Nunca inclua senhas ou valores reais de configuração no repositório.
8. Acesse `https://SEU-SITE.netlify.app/admin/` (ou clique no pequeno cadeado no rodapé do portfólio). Entre com o e-mail e senha definidos; nas abas **Páginas & textos**, **Tecnologias**, **Projetos** e **Formações e certificados**, edite o conteúdo do portfólio. O visitante verá as atualizações após recarregar o site.
9. Na aba **Forms** da Netlify, habilite **Form detection**, se necessário, e republique para ativar o formulário de contato. As mensagens aparecerão no painel de formulários da Netlify. Configure notificações, se desejar recebê-las por e-mail.

**Importante:** upload por simples arrastar a pasta `public` no Netlify Drop é suficiente para visualizar o site, mas **não** instala nem publica as funções necessárias ao painel. Para o painel completo, use o deploy conectado ao Git ou o Netlify CLI. Os dados dos projetos, das formações e suas imagens ficam em `Netlify Blobs` site-wide, preservados entre deploys da mesma aplicação.

## Testar localmente

Requisitos: Node.js 22.13+ e npm.

```bash
npm install
npm run dev
```

Abra `http://localhost:8888/`. Para testar o login local, adicione as variáveis ao ambiente do terminal antes de iniciar (`netlify dev` também suporta ambiente local configurado), **não** deixe credenciais dentro de arquivos que vão para o Git. Um servidor simples de HTML não executará as funções; nesse caso, a galeria exibirá os quatro projetos iniciais e o painel não poderá autenticar.

Verificações de sintaxe:

```bash
npm run check
npm run test
```

## Cuidados e funcionalidades

- O cadeado é **discreto, não é um mecanismo de segurança**. As ações de gravação exigem autenticação no servidor.
- A senha fica protegida por hash `scrypt` (não texto puro) em variáveis da Netlify; o cookie de sessão é assinado, `HttpOnly`, `SameSite=Strict` e `Secure` em HTTPS.
- As requisições de gravação são verificadas pela origem, autenticação e validação dos dados.
- Imagens aceitas: JPG, PNG, WebP e GIF, até 4 MB. Não inclua PDF com CPF ou informações sigilosas em links públicos.
- O painel suporta criar, editar e excluir projetos. **Exclusão de projetos não apaga automaticamente imagens já carregadas**; para limpeza de imagens órfãs, use o painel de Netlify Blobs ou implemente um gerenciador de mídia posteriormente.
- O arquivo de formações já inclui **18 atividades** compiladas dos certificados disponibilizados. Como os documentos do Startup Way têm marcação interna/confidencial, o site inclui apenas informações públicas resumidas, **não publica o PDF**.
- A galeria inicia com quatro estudos/propostas conhecidos das conversas sobre seu portfólio (Smart Solar Home, AQUA, Automação de Certificados e Curvas Paramétricas). São descrições iniciais e **ilustrações conceituais, não capturas de tela**. Revise cada item no painel antes da publicação definitiva. O painel permite alterar ou remover todos; nenhum link fictício foi criado. A versão original continha cards com placeholders e links `#`.
- Botões de tecnologias e categorias, modo claro/escuro, animações suaves com suporte a `prefers-reduced-motion`, navegação por teclado e formulário de contato acessível.
- A sessão expira após 12 horas. Uma mudança de `SESSION_SECRET` invalida sessões anteriores. Falhas de login têm limite básico de tentativas; para exposição pública com alto risco, recomenda-se complementar com autenticação gerenciada e proteção de borda.
- Ainda falta configurar as variáveis de autenticação **diretamente no ambiente da Netlify**, além de revisar seus projetos reais, seus links, sua foto de perfil e os textos antes de publicar.

## Referências oficiais

- Netlify Functions: https://docs.netlify.com/build/functions/get-started/
- Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Netlify Forms: https://docs.netlify.com/manage/forms/setup/
- Deploy com repositório Git: https://docs.netlify.com/deploy/create-deploys/

## Pré-visualização rápida sem instalar dependências

- No Windows, execute `PREVISUALIZAR_SITE.bat`. É necessário ter Python instalado (comando `py` ou `python`). O navegador abrirá o site público em `http://localhost:8000`.
- Em macOS/Linux, estando na raiz do projeto, execute `python3 -m http.server 8000 --directory public` e abra `http://localhost:8000`.
- O modo de prévia estática **não executa funções de autenticação, não permite salvar novos projetos e não recebe formulários**; para esses recursos, faça o deploy completo na Netlify ou use `npm run dev`.

### Conferência antes da publicação

Revise os quatro projetos iniciais: os títulos foram recuperados de trabalhos discutidos anteriormente, mas não havia código ou capturas de tela desses projetos no ZIP original. Substitua detalhes e imagens conceituais por materiais próprios se desejar documentar implementações reais. Verifique também o e-mail de contato e os links do LinkedIn e do GitHub.

## Revisão visual pendente de novos conteúdos — seção Tecnologias

A grade estática com 25 competências foi substituída por uma **vitrine 3D estilo coverflow**, com cartão central em destaque e laterais em perspectiva. Navegação via setas, clique nas cartas vizinhas, arrastar com mouse ou dedo e teclado (←/→, Home/End). Os filtros por área continuam funcionando. Refração suave, bordas iluminadas e reflexo discreto sob os ícones preservam contraste e legibilidade em claro/escuro. Há fallback local SVG para as marcas obtidas de um CDN, evitando ícones quebrados quando o dispositivo está offline. Usuários com preferência por movimento reduzido recebem transições praticamente instantâneas.

O carrossel faz parte deste pacote atualizado. Estas alterações **ainda não foram implantadas na Netlify**. O acesso discreto pelo pequeno cadeado no canto inferior direito do rodapé foi preservado sem alterações. O código contém a lógica de autenticação e edição, mas o login só estará ativo após a configuração das três variáveis de ambiente na Netlify.

## Vitrine de formações — atualização v3

- Os cartões usam o visual já existente, mas agora há **2 cursos visíveis no desktop e 1 no celular**. Navegue com setas, arraste ou deslize, e escolha uma categoria.
- Os 18 cursos possuem instituição, categoria, carga horária, natureza (curso concluído, participação, oficina etc.) e descrição breve.
- Imagens reais dos certificados **Catalisa ICT Jr., Introdução ao Desenvolvimento Web, Fibras Ópticas e Wazuh** foram adicionadas com base nos documentos compartilhados. Os demais têm placeholders profissionais até que a imagem seja cadastrada.
- O documento do **Startup Way é marcado como Confidencial / Informação Interna**; sua imagem não acompanha a versão pública. Antes de publicá-la manualmente, verifique autorização de divulgação.
- Para editar uma imagem depois de publicar, abra o painel → **Formações e certificados** → **Editar** → escolha o arquivo JPG/PNG/WebP/GIF até 4 MB → **Salvar formação**. Atualize a página pública.
- O upload de imagens pelo painel requer **Netlify Functions + Netlify Blobs** ativos no projeto publicado; abrir um arquivo HTML localmente não ativa o servidor.

## Diagnóstico de erro no login

Se aparecer “operação inválida” ou falha no login, consulte `CONFIGURAR_LOGIN_NETLIFY.md`. O endereço `/.netlify/functions/auth` deve retornar **JSON**, não HTML ou 404. Quando `configured` é `false`, configure as três variáveis da Netlify; quando `configured` é `true` mas o login falha com 401, revise e-mail e senha usados para gerar o hash. Não há login offline válido em um site estático simples.


## Layout de Tecnologias — v5.2

O botão **Ver todas as tecnologias** amplia a lista na coluna esquerda do painel administrativo, aproveitando a altura do formulário à direita sem excedê-la. Consulte `ALTERACOES_V5_2_LAYOUT_TECNOLOGIAS.md` para detalhes e testes.


## Ajuste v5.4 — Listas expansíveis no painel
Ao clicar em “Ver todas as tecnologias” ou “Ver todas as formações”, as listas superiores ocupam o espaço disponível em vez de ficarem presas à altura compacta anterior. Para detalhes, veja `ALTERACOES_V5_4_EXPANSAO_LISTAS.md`.


### Atualização 5.5 — Retorno e notificações
- Botão **Voltar ao site** com contorno, destaque e foco acessível.
- Depois de qualquer alteração persistida no servidor (textos, categorias, tecnologias, projetos e formações), o painel volta suavemente ao topo e exibe um aviso de sucesso.
- Se houver erro, a página permanece na posição atual e mostra um aviso de falha; os dados não são anunciados como salvos.
- Mensagens temporárias como “Enviando imagem” e login não provocam rolagem automática.
