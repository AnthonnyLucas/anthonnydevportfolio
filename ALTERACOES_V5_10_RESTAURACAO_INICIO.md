# Alterações v5.10 — restauração do Início, atalhos e documentação

## Correção do layout na seção Início

A versão 5.9 introduziu um seletor para colocar as partículas atrás do conteúdo:

```css
.hero>:not(.section-particles),
.content-section>:not(.section-particles),
.admin-wrap>:not(.section-particles) { position:relative; z-index:1; }
```

O seletor atingiu **também** os filhos `.hero-glow` e `.scroll-cue`, que eram posicionados de forma absoluta no layout original. Como `position:relative` passou a prevalecer, eles ocuparam espaço real na grade CSS; o título foi empurrado para a segunda coluna e os elementos seguintes quebraram a composição.

**Correção:** limitar o posicionamento relativo no Hero à `.hero-copy` e à `.hero-art`, preservando `.hero-glow` e `.scroll-cue` como elementos absolutos. As partículas continuam em uma camada independente (`.section-particles`) com `pointer-events:none`, sem afetar a grade.

## Contato

- Inclusão de **GitHub** e **LinkedIn** junto dos links existentes de **E-mail** e **WhatsApp**.
- Os novos links reutilizam as propriedades editáveis `githubUrl` e `linkedinUrl` da seção **Redes sociais** do CMS, usando o mesmo contrato da sidebar.
- Ícones vetoriais e cartões já utilizados no layout para preservar identidade e responsividade.

## Documentação entregue

1. `README.md`: visão geral, objetivos, casos de uso, arquitetura, instalação, deploy e limitações.
2. `CREDITOS_E_REUTILIZACAO.md`: autoria, termos de reutilização com atribuição, exemplo de crédito e cuidados com terceiros.
3. `GUIA_FUNCIONALIDADES_E_TESTES.md`: inventário de funções, APIs, cenários de sucesso/falha, matriz de testes e checklist de aceitação.

## Validações locais

- `npm run check`: sintaxe dos módulos verificada.
- `npm test`: 29 testes aprovados, incluindo as regressões da versão 5.10.
- Prévia estática em Chromium via HTML/CSS injetados: conferência em **1440 × 900**, **1024 × 768** e **390 × 844**, após inserir no Hero uma camada canvas com classe `section-particles`.
- Verificação da posição computada: `.hero-glow` e `.scroll-cue` com `position:absolute`; `.hero-copy` à esquerda da `.hero-art` em desktop; links E-mail, WhatsApp, GitHub e LinkedIn presentes também em mobile.

**Limitação do ambiente:** a navegação automatizada para `http://127.0.0.1` foi bloqueada; por isso as capturas de layout foram realizadas com a estrutura HTML e folhas CSS carregadas diretamente em um documento de teste, **sem execução de serviços Netlify**. A validação das funções em produção, do formulário e da persistência depende de deploy na Netlify.

**Dica pós-deploy:** o CSS público usa `v5-9.css?v=5.10.0` para evitar que a versão anterior permaneça em cache.
