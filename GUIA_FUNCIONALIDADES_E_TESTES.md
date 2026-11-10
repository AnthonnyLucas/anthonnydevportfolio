# Guia de funcionalidades e plano de testes — Portfólio Anthonny Lucas

**Versão-alvo:** 5.10.0  
**Objetivo:** documentar os módulos existentes e fornecer um roteiro reproduzível para validação local e após a publicação na Netlify.

> **Legenda:** **Automatizável localmente** = pode ser verificado com testes de código ou simulações; **Requer Netlify** = depende do ambiente publicado, das credenciais e do armazenamento real; **Visual** = requer inspeção em navegador e diferentes tamanhos de tela. A existência de um roteiro de teste **não significa que ele já tenha sido executado**.

## 1. Ambiente de testes

| Ambiente | Para que serve | Limitação |
|---|---|---|
| Prévia estática (`python -m http.server`) | Inspecionar HTML, CSS, layout, tema, animações, navegação e fallback | Não autentica nem salva no Netlify Blobs |
| Netlify Dev (`npm run dev`) | Exercitar funções locais e a interface completa com variáveis configuradas | Pode depender de conexão/configuração da Netlify e não equivale ao Production |
| Netlify Production (deploy do projeto completo) | Confirmar login, gravação, envio de formulários e comportamento real | Exige acesso ao projeto e às variáveis da conta Netlify |
| `npm test` | API, regras de negócio e verificações estruturais com mocks | Não substitui teste visual nem prova a implantação em produção |

**Preparação:** usar Node.js >=22.13, executar `npm install`, `npm run check` e `npm test`. Para interface, conferir 1440×900, 1024×768, 390×844 e, idealmente, 320×700. Testar nos dois temas e com redução de movimento quando aplicável.

## 2. Funcionalidades da página pública

### FT-01 — Navegação e sidebar

- **Ações:** clicar em Início, Sobre mim, Tecnologias, Projetos, Formações e Contato; navegar por teclado.
- **Esperado:** a página rola até a seção correta e destaca o item ativo. Em telas pequenas, o menu se adapta à largura disponível.
- **Testes:** links corretos, foco visível, ausência de sobreposição com os botões ou a barra superior.
- **Tipo:** Visual / automatizável localmente.

### FT-02 — Hero (Início) e partículas

- **Ações:** abrir a página em várias larguras, alternar tema e rolar.
- **Esperado em desktop:** saudação, título, descrição e chamadas **à esquerda**; janela de código/ilustrações **à direita**; brilho e indicação de rolagem continuam decorativos e não ocupam células da grade.
- **Esperado em mobile:** texto acima da ilustração; sem corte horizontal e sem deslocar o conteúdo para fora da tela.
- **Regressão específica v5.10:** confirmar que `.hero-glow` e `.scroll-cue` continuam com `position:absolute` mesmo com o `<canvas class="section-particles">` inserido no início da seção; a posição dos elementos de texto não muda após a inicialização das partículas.
- **Tipo:** Visual / teste estrutural CSS.

### FT-03 — Sobre mim

- **Ações:** conferir biografia, foto, seus três pilares e efeito de reflexo.
- **Esperado:** imagem nítida, textos legíveis e enquadramento consistente nos temas. Atualizações feitas no painel aparecem após recarregar.
- **Tipo:** Visual / requer Netlify para testar salvamento.

### FT-04 — Vitrine de tecnologias

- **Ações:** aplicar cada filtro, usar setas, arrastar o carrossel e testar o teclado.
- **Esperado:** mostra tecnologias cadastradas, navega sem perder cards e respeita as categorias salvas. Ícone ausente utiliza fallback legível.
- **Tipo:** Visual / integração com dados reais da Netlify.

### FT-05 — Catálogo de projetos

- **Ações:** percorrer o catálogo, filtrar por categoria, abrir links configurados.
- **Esperado:** dois cartões por vez em desktop, um em telas pequenas; projeto com mais de uma categoria aparece em todos os filtros pertinentes. Links inválidos não devem ser apresentados como válidos.
- **Tipo:** Visual / integração com Netlify.

### FT-06 — Formações e certificados

- **Ações:** navegar por setas/arraste, filtrar, abrir imagens de certificados e fechar o modal.
- **Esperado:** exibe dados cadastrados, imagem ampliada e categoria correta, sem publicar documentos marcados como confidenciais por padrão.
- **Tipo:** Visual / integração com Netlify.

### FT-07 — Contato e links sociais

- **Ações:** localizar os atalhos **E-mail, WhatsApp, GitHub e LinkedIn** na seção Contato; clicar em cada um; conferir os mesmos links na sidebar.
- **Esperado:** E-mail usa o endereço de composição/mailto configurado; WhatsApp usa URL permitida; GitHub e LinkedIn abrem os perfis configurados. A seção não mostra o endereço de e-mail como texto obrigatório. Se os dois URLs de perfis forem atualizados em **Páginas & textos → Redes sociais**, os atalhos na sidebar **e** no Contato passam a refletir as URLs novas após recarregar o site.
- **Regressão específica v5.10:** presença de `#public-contact-github` e `#public-contact-linkedin` com `data-url-key="githubUrl"` e `data-url-key="linkedinUrl"`; conferir que o painel conserva as opções de edição existentes.
- **Tipo:** automatizável localmente / requer Netlify para teste de salvamento.

### FT-08 — Formulário de contato

- **Ações:** enviar nome, e-mail, assunto e mensagem válidos; repetir com campos vazios e e-mail incorreto.
- **Esperado:** campos obrigatórios impedem envio inválido; envio válido usa o formulário `contato-portfolio`, com `form-name` e honeypot. Em produção, verificar registro no **Netlify Forms** e a página `/obrigado/`.
- **Tipo:** visual / requer Netlify para confirmar recebimento.
- **Observação:** abrir um link Gmail/WhatsApp não envia uma mensagem automaticamente; o visitante deve confirmar o envio no serviço externo.

### FT-09 — Temas e partículas

- **Ações:** alternar Light/Dark Mode, recarregar e abrir o painel; testar `prefers-reduced-motion`.
- **Esperado:** preferência persistida localmente; janela de código do Contato e barras de rolagem acompanham o tema. Partículas não bloqueiam cliques, não provocam scroll lateral, reduzem movimento conforme preferência e pausam trabalho quando a aba está oculta.
- **Tipo:** Visual / automatizável localmente.

## 3. Funcionalidades do painel administrativo

### ADM-01 — Autenticação e sessão

- **Pré-requisitos:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET` configurados no ambiente do servidor.
- **Teste positivo:** login correto em `/admin/` abre o painel; logout encerra a sessão.
- **Testes negativos:** e-mail ou senha errados retornam falha; páginas estáticas podem abrir, mas gravações sem cookie válido retornam 401; sem configuração, login retorna indicação de indisponibilidade.
- **Segurança:** sessão assinada, cookie `HttpOnly`, `SameSite=Strict`; `Secure` em HTTPS. Duração de 12 horas. Há limitação básica de tentativas de login.
- **Tipo:** testes de API local + requer Netlify.

### ADM-02 — Páginas & textos

- **Ações:** editar títulos, descrições, textos dos botões, informações de identidade e imagem de Sobre mim; alterar os quatro links sociais.
- **Esperado:** painel salva com revisão; a página pública reflete as novas informações após atualização. Uma edição concorrente com revisão antiga é rejeitada, não sobrescrita silenciosamente.
- **Teste de erro:** provocar falha do endpoint; verificar notificação de erro **sem** retorno da tela ao topo.
- **Tipo:** API local / requer Netlify para integração.

### ADM-03 — Tecnologias e categorias

- **Ações:** criar categoria, editar categoria, adicionar tecnologia, selecionar logotipo, pesquisar, filtrar, reordenar e excluir.
- **Esperado:** os filtros e o catálogo usam a mesma categoria persistida; categorias em uso não podem ser excluídas sem reclassificar registros; a coluna de lista não cresce indefinidamente.
- **Casos negativos:** nome/categoria inválidos, cor fora de `#RRGGBB`, URL de imagem inválida, número excessivo de registros e remoção de categoria vinculada.
- **Tipo:** testes de API / visual / Netlify.

### ADM-04 — Projetos e categorias múltiplas

- **Ações:** cadastrar projeto com várias categorias, alterar título, imagem, descrição, tags e URLs; buscar por nome/categoria; excluir.
- **Esperado:** edição persiste, filtros públicos incluem o projeto em todas as áreas associadas e versões antigas com uma categoria continuam visíveis.
- **Casos negativos:** formulário sem título ou descrição, categoria inexistente, exclusão sem sessão.
- **Tipo:** API / interface / Netlify.

### ADM-05 — Formações e imagens

- **Ações:** cadastrar, editar e excluir formação; cadastrar área, filtrar registros; anexar imagem.
- **Esperado:** dados aparecem no catálogo público e persistem depois de atualizar; lista administrativa usa altura controlada. Upload aceita apenas JPG/PNG/WebP/GIF até 4 MB.
- **Casos negativos:** arquivo acima do limite, tipo não suportado, área inválida e ausência de login.
- **Tipo:** API / interface / Netlify.

### ADM-06 — Feedback de salvamento

- **Ações:** salvar uma edição válida e simular uma falha.
- **Esperado:** somente depois da confirmação bem-sucedida do servidor a tela rola até o topo com aviso de sucesso. Em erro, mantém posição e exibe aviso de falha.
- **Tipo:** testes automatizados de feedback / visual.

### ADM-07 — Light/Dark Mode no painel

- **Ações:** trocar tema no site, abrir `/admin/`, alternar tema no painel, atualizar página.
- **Esperado:** cores, campos, avisos, cartões e barras de rolagem legíveis; a preferência de tema é compartilhada no mesmo navegador.
- **Tipo:** Visual.

## 4. APIs e métodos

As funções estão sob `/.netlify/functions/`:

| Recurso | Função | Métodos previstos | Modificações exigem sessão? |
|---|---|---|---|
| Estado de login e sessão | `auth` | `GET`, `POST` (login/logout) | Login usa credenciais; logout verifica origem |
| Textos, identidade e links | `content` | `GET`, `PATCH` | Sim, PATCH |
| Tecnologias e ordem | `technologies` | `GET`, `POST`, `PATCH`, `DELETE` | Sim, escrita |
| Projetos | `projects` | `GET`, `POST`, `DELETE` | Sim, escrita |
| Formações | `certificates` | `GET`, `POST`, `DELETE` | Sim, escrita |
| Categorias | `categories` | `GET`, `POST`, `DELETE` | Sim, escrita |
| Imagens | `media` | `GET`, `POST` | Sim, upload |

O endpoint `categories` usa o parâmetro `kind` (`projects`, `certificates` ou `technologies`). Funções de escrita verificam sessão e origem da requisição. As respostas de erro são JSON com códigos HTTP apropriados. Não testar gravando dados reais de produção sem cópia de segurança.

## 5. Matriz rápida de testes manuais

| ID | Teste | Resultado esperado | Prioridade |
|---|---|---|---|
| T01 | Abrir Início em desktop (1440 px) | Texto à esquerda e código à direita | Crítica |
| T02 | Abrir Início em 390 px | Conteúdo em coluna, sem corte lateral | Crítica |
| T03 | Ativar partículas | Não deslocar glow, título ou scroll-cue | Crítica |
| T04 | Alternar tema no Início e no Contato | Elementos seguem o tema | Alta |
| T05 | Abrir os quatro atalhos do Contato | URLs válidas e rótulos corretos | Crítica |
| T06 | Alterar URL GitHub/LinkedIn no CMS | Sidebar e Contato usam nova URL | Crítica |
| T07 | Navegar nos três carrosséis | Setas, arraste, filtros e contadores corretos | Alta |
| T08 | Criar categoria/tecnologia | Registro disponível no painel e no público | Alta |
| T09 | Projeto com múltiplas categorias | Aparece em todos os filtros relacionados | Alta |
| T10 | Cadastrar formação com imagem | Visualização pública sem imagem quebrada | Alta |
| T11 | Login correto, incorreto e logout | Sessões e erros corretos | Crítica |
| T12 | Salvar conteúdo e simular erro | Sucesso sobe e avisa; erro não sobe | Alta |
| T13 | Submeter formulário em produção | Mensagem registrada no Netlify Forms | Alta |
| T14 | Reduzir movimento no SO | Partículas/transições reduzidas | Média |
| T15 | Usar navegação por teclado e leitor de tela | Botões e links acessíveis | Alta |
| T16 | Recarregar após salvar | Dados persistem sem novo deploy | Crítica |

## 6. Testes automatizados existentes

Executar na raiz:

```bash
npm run check
npm test
```

O projeto inclui testes das APIs e regras de autenticação/categorias, controles do dashboard, filtros e catálogos, temas/partículas, formulários e vínculos de redes sociais. A partir da v5.10, há também uma verificação de **regressão do CSS da seção Início** e da **presença/vinculação dos quatro links de Contato**.

**Importante:** testes de API com `mock-blobs` verificam regras de negócio em memória, não a persistência do ambiente de produção. Simulações de interface em navegador que utilizam HTML/CSS sem o backend também não substituem a integração Netlify real.

## 7. Diagnóstico dos principais erros

- **Página Início cortada/deslocada:** conferir `.hero-glow` e `.scroll-cue` (devem ser posicionados absolutamente) e testar com a camada `.section-particles`. Conferir também o cache do arquivo `/assets/v5-9.css?v=5.10.0`.
- **API retorna HTML ou 404:** o deploy provavelmente incluiu apenas arquivos estáticos ou não publicou funções. Publicar o projeto inteiro com `netlify.toml`.
- **Login falha:** conferir `/.netlify/functions/auth`, variáveis de ambiente, hash e logs das Functions.
- **Conteúdo não persiste:** verificar autorização do endpoint, resposta HTTP, conflitos de revisão e disponibilidade do Netlify Blobs.
- **Link social não abre:** verificar se o valor salvo é uma URL HTTPS válida; E-mail pode usar endereço simples, `mailto:` ou link de composição do Gmail.
- **Formulário não recebe mensagens:** verificar a seção Forms na Netlify e confirmar que o formulário foi detectado no deploy.
- **Imagem não carrega:** verificar tamanho/tipo e URL devolvida pelo endpoint `media`; não incluir arquivos internos/confidenciais.
- **Layout quebra só em produção:** verificar cache de CSS/JS, arquivos publicados e diferenças entre dados persistidos e fallback.

## 8. Checklist de aprovação e publicação

- [ ] `npm run check` sem falhas.
- [ ] `npm test` sem falhas.
- [ ] Início restaurado em desktop e celular, com partículas e temas.
- [ ] Quatro contatos públicos presentes e com URLs corretas.
- [ ] Valores editados no dashboard aparecem na página pública.
- [ ] Conteúdo salvo persiste após atualizar, com funções Netlify ativas.
- [ ] Login, logout, erro de autenticação e revisão concorrente testados.
- [ ] Formulário de contato verificado na aba Forms.
- [ ] Imagens, certificados e links revisados quanto à autorização de publicação.
- [ ] Documentos de autoria e atribuição mantidos no projeto distribuído.

## 9. Histórico e evidências

O registro incremental das alterações fica nos arquivos `ALTERACOES_V*.md`. Para a versão 5.10, consulte `ALTERACOES_V5_10_RESTAURACAO_INICIO.md`. Pré-visualizações em `screens/`, quando incluídas, representam inspeção local e **não** prova de funcionamento na Netlify publicada.
