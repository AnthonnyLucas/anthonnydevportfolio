# Ativar o login administrativo na Netlify

O ícone do cadeado **não foi alterado**: permanece pequeno e discreto no canto inferior direito do rodapé. O painel fica em `/admin/`.

**E-mail administrativo definido:** `teste@gmail.com`. A senha foi informada na conversa e **não é distribuída dentro deste ZIP**. A autenticação exige variáveis secretas no servidor.

1. Extraia o ZIP e abra um terminal na pasta do projeto (onde está `package.json`).
2. Execute `node scripts/gerar-credenciais.mjs`. Pressione Enter para manter o e-mail indicado ou digite outro e-mail. Quando solicitado, informe a senha administrativa que escolheu. O script exibirá um aviso caso ela seja fraca.
3. Copie os três valores gerados: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET`.
4. No painel da Netlify, abra o seu projeto → **Project configuration → Environment variables**. Adicione as variáveis ao ambiente **Production**, com escopo para **Functions** ou **All**; valores de hash e segredo devem ser privados.
5. Publique o projeto pelo Git (não apenas enviando a pasta `public`) e faça novo deploy depois de inserir as variáveis.
6. Acesse `https://SEU-SITE.netlify.app/admin/` ou clique no cadeado discreto no rodapé. Use seu e-mail e a senha original, **não o hash**.
7. No dashboard, é possível inserir, editar e excluir projetos e enviar imagens. Os dados são salvos no Netlify Blobs e aparecem no site público.

**Segurança:** a senha escolhida nesta conversa é curta e inteiramente numérica, portanto **não é recomendada para um painel exposto na internet**. Troque-a por uma senha exclusiva de, preferencialmente, 16 caracteres ou mais antes de publicar. Para mudar depois, execute novamente o gerador e atualize o hash e o segredo de sessão nas variáveis. Não salve senhas em HTML, JavaScript, `.env` no ZIP ou repositórios.

**Importante:** não é possível efetuar o deploy do seu site nem inserir variáveis de ambiente na sua conta Netlify a partir destes arquivos. O ZIP contém o código do painel e do login, mas a ativação da conta depende das etapas acima.

## Resolver “operação inválida”

A mensagem anterior era genérica e podia aparecer quando o navegador recebia HTML ou 404 no lugar de uma resposta da API. A interface desta versão foi ajustada para informar melhor a origem do problema.

1. Na Netlify, abra o endereço `https://SEU-SITE.netlify.app/.netlify/functions/auth` no navegador.
   - **JSON com `configured: false`**: falta configurar uma ou mais variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (32 caracteres ou mais).
   - **JSON com `configured: true` e `authenticated: false`**: funções e configuração carregaram; entre em `/admin/` com o e-mail e a senha digitada no gerador, não com o hash.
   - **Erro 404, página HTML ou resposta diferente de JSON**: as Netlify Functions não foram publicadas. Faça deploy do projeto inteiro usando **Git conectado à Netlify**, e não só da pasta `public`.
   - **Erro 500**: consulte o painel da Netlify em **Logs → Functions** e confirme se o armazenamento **Netlify Blobs** está operacional.
2. Não use somente `PREVISUALIZAR_SITE.bat` ou `python -m http.server` para validar o login: esses métodos servem apenas HTML/CSS/JS.
3. Para testar no computador, instale Node.js 22.13+, execute `npm install` na pasta raiz e configure as variáveis apenas no seu ambiente local ou em `.env` ignorado pelo Git; inicie com `npm run dev` e visite `http://localhost:8888/admin/`. O Netlify CLI pode solicitar login na sua conta durante o primeiro uso.
4. Após configurar variáveis na Netlify, faça um **novo deploy** e recarregue a página, preferencialmente numa janela anônima para evitar cache e cookies antigos.
5. No painel, abra **Formações e certificados** para editar as imagens e textos. A galeria pública atualizará ao recarregar a página.

**Nota de segurança:** o e-mail está definido no arquivo de exemplo, mas nenhuma senha real ou hash específico foi incluído no ZIP. Não compartilhe os valores das variáveis. A senha numérica citada na conversa é fraca: use uma nova senha exclusiva ao gerar as variáveis.
