# Versão 5.13 — Correção da rolagem na página pública

## Problema identificado

Na seção **Formações**, clicar em **Ampliar imagem** acionava um elemento HTML `<dialog>`. Sem uma regra de posicionamento fixa, o navegador abria o modal na posição absoluta do documento e, ao transferir o foco para o botão de fechar, rolava a página até o início. A rolagem suave global tornava o salto ainda mais perceptível. Fechar o modal não recuperava o ponto de leitura.

## Correção

- O visualizador de certificados agora usa `position: fixed !important`, `inset: 0` e `margin: auto` para permanecer centralizado na janela do navegador.
- Mantivemos a abertura e o fechamento com o `<dialog>` nativo, incluindo navegação por teclado, tecla Esc e fundo escurecido.
- O conteúdo longo do modal rola dentro do próprio visualizador (`overflow-y: auto`), sem acionar a rolagem vertical da página.
- Não foi implementada nenhuma rolagem automática no site público. Os links da sidebar continuam levando às seções escolhidas **intencionalmente**.
- O comportamento de confirmação e retorno ao topo no painel administrativo permanece inalterado.

## Como testar

1. Abra o site público, acesse **Formações** e role até um cartão que tenha imagem.
2. Anote a posição da página e clique em **Ampliar imagem**. A visualização deve abrir sem a página subir.
3. Feche pelo botão **✕**, pela tecla **Esc** e clicando fora da imagem. A página deve continuar no ponto anterior.
4. Teste os filtros, as setas do carrossel, os outros carrosséis e o botão de tema: nenhuma dessas ações deve voltar o site ao Início.
5. Teste em Light Mode, Dark Mode e em telas menores.
6. A navegação da sidebar deve continuar rolando propositalmente para a seção selecionada.
7. No painel administrativo, salvar registros deve manter a confirmação e o comportamento de rolagem já existente.

## Validação local

A falha foi reproduzida no Chromium com o código da versão 5.12. Após a correção, a posição vertical permaneceu igual antes, durante e depois da abertura do certificado no teste local isolado com os estilos e o script do projeto. Também foram executados os testes de regressão e a verificação sintática do projeto.

## Publicação

Publique este ZIP em sua aplicação Netlify e recarregue o site com `Ctrl+F5` para evitar o cache do CSS anterior. O comportamento no domínio publicado ainda deve ser verificado após o deploy.
