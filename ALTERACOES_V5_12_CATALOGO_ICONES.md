# Versão 5.12 — Catálogo inteligente e expansível de logotipos

## Alterações

- Preserva os 156 itens preexistentes e todos os 39 SVGs locais.
- Adiciona três coleções abertas indexadas sob demanda pela API Iconify: Devicon, SVG Logos e Simple Icons. O total real é apresentado após carregamento; as coleções oferecem milhares de opções no serviço online.
- Adiciona filtro por coleção, busca com normalização de acentos, contador de resultados, paginação progressiva de 48 ícones e opção de tentar novamente em caso de falha.
- Faz cache local dos **nomes e IDs** dos ícones por até sete dias. Nenhum SVG remoto é pré-carregado antes de entrar na página de resultados.
- Adiciona a Netlify Function `icon-library.mjs` como rota de recuperação em caso de indisponibilidade da consulta direta. Essa rota aceita somente nomes fixos de coleções e retorna JSON de metadados.
- Preserva o upload manual de ícones, a seleção por HTTPS e a compatibilidade com tecnologias anteriores armazenadas no Netlify Blobs.

## Como testar

1. Publique o projeto completo na mesma aplicação Netlify; abra `/admin/`, autentique e selecione Tecnologias.
2. Aguarde o contador mostrar mais de 1.000 ícones indexados. Em caso de falha, utilize Tentar novamente.
3. Digite `Python`, selecione o filtro Devicon ou Simple Icons, clique em uma opção e confirme o preenchimento do campo URL do logotipo.
4. Salve uma nova tecnologia e confira seu logotipo no carrossel público após atualizar.
5. Pesquise `Docker`, `Arduino`, `AWS`, `Kubernetes`, `React`, `Assembly`. Se o nome não estiver no acervo externo, utilize o catálogo local, o símbolo de reserva ou o envio próprio.
6. Teste com conexão indisponível: o catálogo de 156 opções deverá permanecer navegável; isso não impede o cadastro manual.
7. Experimente alternar o tema claro/escuro e usar a interface no celular; confira tamanho das miniaturas e filtros.

### Limitação de validação

Os testes neste ambiente verificam um índice **simulado** com mais de seis mil entradas e a integração do navegador. Não foi possível consultar a API Iconify diretamente no ambiente de execução local; o acesso real à rede deve ser confirmado no site publicado. O total online depende das versões das coleções fornecidas pela Iconify.
