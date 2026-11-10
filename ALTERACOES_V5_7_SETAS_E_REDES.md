# Portfólio v5.7 — Setas externas e links sociais editáveis

## Navegação pública
- Setas **sem moldura, fundo ou vidro sólido**, apenas ícones vetoriais visíveis.
- Tecnologias, Projetos e Formações agora possuem **colunas laterais reservadas**, com botões completamente fora do conteúdo. As áreas dos cartões não ficam cobertas pelas setas.
- Responsividade verificada em 1440, 1024, 390 e 320 px. Arraste, filtros e contadores originais permanecem.
- CSS exclusivo: `public/assets/v5-7.css`. Há versão de cache na inclusão do CSS (`?v=5.7.1`).

## Gmail e WhatsApp no painel
1. Abra **Administração → Páginas & Textos → Redes sociais**.
2. Edite os links **GitHub**, **LinkedIn**, **Gmail** e **WhatsApp**, que aparecem juntos.
3. Para o Gmail, insira o endereço de e-mail, `mailto:seuemail@gmail.com` ou uma URL de composição do Gmail, como `https://mail.google.com/mail/?view=cm&fs=1&to=seuemail@gmail.com`.
4. Para o WhatsApp, informe o link HTTPS, por exemplo `https://wa.me/5581999999999` (apenas exemplo; use o seu número com DDI e DDD).
5. Clique em **Salvar alterações**, atualize o site público e teste os dois ícones. O valor é armazenado no mesmo Netlify Blobs que os demais textos.

Os campos GitHub, LinkedIn e WhatsApp usam as chaves anteriores, preservando seus valores já salvos. Gmail recebe a nova chave `gmailUrl`; por padrão, abre o contato público anterior. Sem WhatsApp configurado, o ícone continua desativado, sem um link fictício.

## Verificação
- `npm run check`: sintaxe JavaScript validada.
- `npm test`: 19 testes automatizados aprovados, incluindo salvamento e validação de links de contato.
- Teste geométrico com Chromium, usando página de teste isolada: os botões não invadem os cartões e permanecem na tela nos tamanhos de 1440, 1024, 390 e 320 px.
- Teste no Chromium dos links sociais: atualização de href de GitHub, LinkedIn, Gmail e WhatsApp aprovada.

O navegador deste ambiente bloqueia endereços locais HTTP; os testes de layout foram feitos com DOM/CSS isolados, não representam um teste fim a fim do site publicado. O deploy na sua Netlify e a autenticação real precisam ser validados na sua conta.
