# Portfólio — versão 4.0 (CMS + UI/UX)

## O que foi implementado

Esta versão foi feita sobre o conteúdo do `ProjetoP.rar`, preservando a identidade visual, a navegação, o carrossel 3D de tecnologias, a vitrine de formações e o editor anterior de projetos/certificados.

### Sidebar da página pública

- Efeito **glassmorphism** com fundo translúcido, desfoque, saturação, bordas iluminadas e delicada textura de profundidade.
- Tipografia refinada nos links, maior contraste, estados de foco e destaque da seção ativa.
- Ajustes específicos para telas menores, mantendo barra de navegação horizontal.
- **Marca superior preservada** (nome, símbolo e subtítulo do portfólio).

### Sobre mim

- Fotografia em moldura editorial de bordas suaves, iluminação e reflexo espelhado discreto.
- Ajuste de enquadramento vertical (0–100%) no painel.
- Substituição da fotografia por arquivo JPG, PNG, WebP ou GIF de até 4 MB, ou link HTTPS.
- Exibição de imagem de reserva se a fotografia remota ficar indisponível.

### Painel administrativo

- **Páginas & textos**: editor de Início, Sobre mim, Tecnologias, Projetos, Formações, Contato e Identidade/Rodapé, com prévia e publicação controlada.
- **Tecnologias**: adicionar, editar, excluir, ordenar, escolher categoria, texto/ícone de reserva, cor, URL ou upload de logotipo. A vitrine pública continua com setas, gesto de arrastar, teclado e filtros.
- **Projetos**: editor existente preservado.
- **Formações & certificados**: editor existente preservado.
- **Repor textos originais**: recupera no formulário os textos de referência da seção selecionada; somente publica se clicar em Salvar.

### Arquitetura de publicação

- Funções públicas `GET /.netlify/functions/content` e `GET /.netlify/functions/technologies` carregam os dados publicados; sem funções os dados originais continuam como apresentação de referência.
- Gravações protegidas por login e conferência de origem nas funções da Netlify (`PATCH content`, `POST/PATCH/DELETE technologies`).
- Dados persistidos em Netlify Blobs separados: `portfolio-site-content` e `portfolio-technologies`.
- Textos exibidos como `textContent` (não HTML arbitrário); links e imagens são validados. A edição de conteúdo usa número de revisão para evitar sobrescritas silenciosas entre sessões.
- Suporte a temas claro/escuro, preferências de movimento reduzido e acessibilidade da navegação.

## Como testar depois do deploy

1. Publique **a pasta inteira** com `netlify.toml`, `public`, `netlify/functions` e `package.json` por Git/CLI. Não publique só `public` se quiser o painel.
2. Configure na Netlify `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET` (ver `CONFIGURAR_LOGIN_NETLIFY.md`). Nenhuma senha real está presente no projeto.
3. Entre no site, clique no pequeno cadeado já existente no rodapé ou acesse `/admin/`.
4. Abra **Páginas & textos → Início**, edite um texto de teste e clique em **Salvar alterações**. Recarregue a página pública e confira a atualização.
5. Em **Sobre mim**, atualize a foto e o enquadramento, salve e atualize o site.
6. Em **Tecnologias**, crie uma ferramenta de teste, confirme sua presença no carrossel, edite, reorganize e exclua.
7. Confirme que **Projetos** e **Formações** continuam com os registros e imagens anteriores.

## Testes realizados neste ambiente

- `npm run check`: análise sintática dos arquivos JS, funções e utilitários.
- `npm run test`: operações de leitura, autenticação, edição, revisões, ordenação e exclusão em armazenamento simulado.
- Testes de interface executados com navegador Chromium e dados de API simulados: páginas de administração, formulários, abas, salvamento, cadastro de tecnologia e filtros públicos.
- Conferência visual estática em resoluções desktop e móvel.

**Limite de validação:** não fiz deploy na sua conta Netlify e, portanto, as funções, uploads e cookies ainda precisam de teste de ponta a ponta na infraestrutura publicada. Os dados da Netlify Blobs já existentes só aparecem quando o projeto é implantado na **mesma conta/site** que os armazenou.

## Cuidados

- **Nunca** escreva a senha real em código-fonte, arquivos HTML, `.env.example` preenchido ou no repositório Git.
- A senha anteriormente fornecida é fraca; use uma nova senha exclusiva antes de expor o painel publicamente.
- O login não funciona abrindo o HTML com duplo clique ou usando o servidor Python de prévia estática; use `netlify dev` ou o deploy completo.
- Arquivos marcados como confidenciais devem permanecer fora da vitrine pública sem autorização.
