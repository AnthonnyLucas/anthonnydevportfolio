# v5.8 — Contato

- Adicionados os links fornecidos de **Gmail** e **WhatsApp** à sidebar e aos atalhos nomeados E-mail/WhatsApp da seção Contato.
- O endereço pessoal deixa de ser mostrado como texto na área pública. O campo `contactEmail` permanece editável para fallback de e-mail.
- A seção Redes sociais do CMS continua permitindo alterar `gmailUrl` e `whatsappUrl`.
- Atualização compatível com conteúdo salvo anteriormente: links padrão antigos são atualizados, mantendo links personalizados diferentes. A migração no Netlify Blobs é consolidada ao próximo salvamento.
- Formulário Netlify Forms mantido com nome, e-mail, assunto, mensagem, campo honeypot e página de agradecimento. A ativação do serviço Netlify Forms na conta ainda é necessária.
- Efeito glassmorphism no formulário e novos atalhos de contato.
- A antiga estrela giratória foi substituída por um painel ilustrativo de código, criado em HTML/CSS e animado suavemente (respeita preferência por movimento reduzido).
- Novo arquivo `public/assets/v5-8.css`; arquivos de fontes e certificados preservados.

## Testar após deploy

1. Acesse a seção Contato: aparecem somente os atalhos **E-mail** e **WhatsApp** (sem expor o endereço).
2. O atalho E-mail abre a janela de composição do Gmail, preenchendo o destinatário; **não envia automaticamente**.
3. O atalho WhatsApp abre a conversa pelo link especificado.
4. Edite os links em Admin > Páginas & Textos > Redes sociais e salve; confirme a alteração da sidebar e seção pública.
5. Envie um formulário de teste somente depois de ativar o Netlify Forms (Site configuration / Forms).
6. Verifique desktop, tablet, celular e modo claro/escuro.
