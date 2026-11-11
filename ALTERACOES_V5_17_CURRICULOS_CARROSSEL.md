# V5.17 — navegação circular e currículos para download

## Navegação circular nos projetos
O botão Próximo retorna ao primeiro conjunto após alcançar o último; Anterior retorna ao último conjunto quando está no primeiro. A grade mantém a quantidade de dois cartões no computador e um em telas menores. A mesma regra vale para as teclas de direção do carrossel.

## Download de currículos
Abaixo da foto, entre o reflexo e a legenda profissional, foi acrescentado o botão **Baixar CV**. O menu oferece duas opções: currículo tradicional e currículo ATS, ambos em PDF. Mantém-se a identidade glassmorphism e os controles de acessibilidade (botão real, aria-expanded, fechamento por Escape e clique fora).

Os PDFs iniciais são cópias de dois documentos previamente fornecidos pelo usuário. **Revise-os antes de publicar**, pois o currículo tradicional pode estar desatualizado e o currículo ATS incluído possui campos de contato em formato de preenchimento como `[TELEFONE]`, `[E-MAIL]`, `[LINKEDIN]`.

### Substituir pelo painel
Em Administração → Páginas e Textos → Sobre mim, altere as URLs dos currículos ou envie novos PDFs (até 8 MB). Os PDFs enviados ficam disponíveis publicamente por meio da função de mídia protegida para upload. O usuário pode substituir os links sem fazer redeploy. PDFs gerados pelo CMS usam Netlify Blobs; os iniciais estão em `public/assets/cv/`.

### Verificações
`npm run check` e `npm test`. Testar também na Netlify o upload, a persistência, o download e as opções do menu após recarregar. O projeto não pode testar sua instância da Netlify sem acesso autorizado.
