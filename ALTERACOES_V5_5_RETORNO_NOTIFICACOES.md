# Versão 5.5 — Botão de retorno e confirmação de salvamento

- Botão **Voltar ao site** recebeu tratamento de botão (contorno verde, fundo suave, ícone SVG, estados hover e foco por teclado).
- Notificação flutuante no topo ao confirmar operações persistidas (textos, tecnologias, projetos, formações, categorias e ordenação). Fecha em sete segundos ou ao pressionar ×.
- A página sobe suavemente ao topo somente após a API confirmar sucesso na alteração.
- Quando ocorre uma falha, a notificação explica que a informação não foi salva, preservando a posição da página e os campos preenchidos.
- Operações preparatórias como selecionar um logotipo, carregar a página, enviar imagens antes de concluir o registro e fazer login não provocam rolagem de sucesso.
- Adaptado para navegadores que solicitam movimento reduzido e para telas pequenas.

## Validação

`npm run check` e `npm test` executam os testes de sintaxe e 15 testes automatizados, incluindo regras de sucesso/erro para notificações. O aviso e os estilos foram também verificados em navegador automatizado usando uma página HTML isolada. O acesso local à aplicação inteira foi bloqueado pelo navegador do ambiente de teste, portanto a confirmação na hospedagem Netlify ainda é necessária.
