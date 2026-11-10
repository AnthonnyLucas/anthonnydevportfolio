# Versão 5.9 — Temas, partículas e acabamento visual

Esta versão é baseada no portfólio 5.8; mantém as funções Netlify, o CMS e os dados já armazenados pela aplicação.

## Mudanças

1. A janela `connection / hello.ts` em **Contato** acompanha Light/Dark Mode (janela, texto, sintaxe, marcadores, brilho e chip de status).
2. O alternador de tema das páginas pública e administrativa utiliza um botão com sol/lua e indicador deslizante. A preferência é salva em `localStorage` (`portfolio-theme`) e compartilhada pelas duas páginas na mesma origem.
3. A barra de rolagem principal e as listas administrativas têm indicador verde e trilha transparente, com fallback de navegadores.
4. O painel administrativo usa as mesmas variáveis visuais do site nos modos claro e escuro, incluindo formulários, painéis, textos e botões.
5. Uma rede de partículas discretas e conexões é aplicada às seções públicas e ao painel. A implementação usa Canvas 2D local, um único laço de animação limitado a ~25 quadros por segundo, redução de partículas em telas menores e tratamento de `prefers-reduced-motion`.
6. O ícone do Gmail na sidebar é monocromático, com `currentColor`, coerente com os outros ícones. O link continua configurável no CMS.

## Verificação

- `npm run check`: verifica a sintaxe dos arquivos JS da aplicação e das funções.
- `npm test`: testes automatizados, inclusive quatro novos testes para este refinamento.
- Prévia com navegador isolado: comparações de tema da janela de Contato e da tela de login administrativo em 1440 e 390 px, sem erros de JS na prévia.

**Limite da validação:** os testes de navegador foram feitos com HTML/CSS/JS locais e dados de interface de teste. Ainda é necessário publicar no projeto Netlify e confirmar as funções autenticadas e os dados online.

## Como atualizar

Publicar o projeto completo na mesma aplicação Netlify para manter o conteúdo anteriormente salvo. O novo CSS `public/assets/v5-9.css` e os módulos `public/assets/theme-controls.js` e `public/assets/particles.js` devem ser incluídos no deploy. Não é necessário adicionar nenhuma variável nova para tema ou partículas.
