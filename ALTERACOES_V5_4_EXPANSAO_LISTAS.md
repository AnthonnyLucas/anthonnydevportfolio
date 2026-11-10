# Ajuste pontual — versão 5.4: expansão das listas administrativas

## Escopo (apenas duas alterações)

1. **Tecnologias > Minhas Tecnologias:** ao selecionar “Ver todas as tecnologias”, a primeira lista passa a ocupar o espaço vertical disponível na coluna, sem o antigo limite curto de pixels. O gerenciador de categorias continua como painel separado, com rolagem independente. Quando há mais itens do que o espaço disponível ao lado comporta, a rolagem ocorre dentro da lista.
2. **Formações & Certificados > Minhas formações:** “Ver todas as formações” agora ativa o modo expandido e faz a lista usar a altura do formulário “Nova formação”, em vez de permanecer limitada a ~405 px. “Mostrar menos” restaura o modo compacto.

**Como o ajuste funciona:** as duas áreas são sincronizadas com a altura do formulário à direita em desktop, com `ResizeObserver`. No celular, as colunas são empilhadas e as listas expandidas acompanham o conteúdo, sem uma altura fixa que esconda registros.

**Não foram alterados:** APIs, credenciais, dados, CRUD, filtros, catálogo de ícones, sidebar, projetos e demais áreas do CMS.

## Testes realizados

- `npm run check` — sintaxe: aprovado.
- `npm test` — regressão de API e estrutura: aprovado.
- Renderização isolada em Chromium com dados demonstrativos (25 tecnologias, 18 formações) e CSS real do projeto: a expansão aumentou a primeira lista em desktop e celular. O painel em desktop ficou alinhado à altura do editor vizinho.
- A implantação em uma conta Netlify não foi executada neste ambiente. Faça a validação final no site publicado.
