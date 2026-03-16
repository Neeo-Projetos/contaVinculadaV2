# Padrão de Telas e Componentes - Sistema ContaVinculada

Este documento define os padrões visuais e funcionais para o desenvolvimento de novas telas no sistema, garantindo consistência e experiência premium.

## 1. Telas de Listagem (Ex: `index.vue`)

### Estrutura Visual (Top-Down)
1. **Cabeçalho**: Utilizar `AppCabecalhoPagina` com título, subtítulo e ícone representativo.
2. **Barra de Filtros Principal**:
   - Lado Esquerdo: `AppInputAutocomplete` para busca por nome/texto e `AppSelecaoStatus`.
   - Lado Direito: Alternador de visão (Lista/Cards) e botões de `Exibição` e `Filtros Avançados`.
3. **Barra de Ações**: Linha dedicada para botões de ação principal (ex: "Novo Registro", "Pesquisar").
4. **Conteúdo**: `AppContainerListagem` que gerencia automaticamente a troca entre tabela e grid de cards.

### Componentes de Listagem
- **Tabela**:
  - Colunas devem respeitar o objeto `colunas` (visibilidade dinâmica).
  - O campo principal (Nome) deve ser um `NuxtLink` para a tela de edição.
  - Status deve usar o componente `AppAtivo`.
  - Ações rápidas (como Histórico) devem ser ícones centralizados (ex: `fa6-solid:history`).
- **Cards**:
  - Utilizar `AppCardListagem` injetado no slot `#cards`.
  - Devem refletir as mesmas informações da tabela através da prop `:detalhes`.
- **Modais**:
  - `AppModalExibicao`: Para controlar visibilidade de colunas.
  - `AppModalFiltroAvancado`: Para filtros secundários.
  - `AppModalHistorico`: Para exibir logs de alterações.
  - **Importante**: Todos os modais devem usar `<Teleport to="body">` e `<Transition>`.

---

## 2. Telas de Cadastro e Edição (Ex: `cadastro.vue`)

### Estrutura Visual
1. **Navegação**: `AppBarraNavegacao` no topo servindo como breadcrumb.
2. **Container**: `AppCartaoFormulario` englobando todo o conteúdo.
3. **Feedback**: `AppSobreposicaoCarregamento` dentro do cartão para indicar processamento.
4. **Organização**: Dividir campos em `AppFormularioSecao` para melhor leitura.
5. **Rodapé**: `AppRodapeFormulario` contendo as ações:
   - `Voltar`: Botão à esquerda.
   - `Excluir`: Botão de alerta à esquerda (somente em edição).
   - `Limpar / Novo`: Botão à direita.
   - `Gravar`: Botão de ação primária à direita.

### Componentes de Formulário
- `AppInputTexto`: Para textos genéricos.
- `AppInputCpf`: Com máscara automática.
- `AppInputEmail`: Com validação de formato.
- `AppSelect`: Para escolhas em listas (deve suportar objetos com `codigo` e `descricao`).

---

## 3. Padrões de Lógica (Composables)

### Listagem (`use...Listagem.ts`)
- Gerenciar estados de: `filtros`, `paginação`, `visão ativa` e `modais`.
- Utilizar `colunasTemp` para o modal de exibição para permitir "Cancelar" alterações.
- Implementar busca de sugestões para o `AppInputAutocomplete`.

### Formulário (`use...Formulario.ts`)
- Utilizar `reactive` para o objeto `form`.
- Definir interfaces TypeScript para o `form` para evitar erros de tipagem em campos mixtos (ex: `projeto: string | number`).
- Centralizar chamadas de API (`recuperar`, `gravar`, `excluir`).

---

## 4. Design System e UX
- **Iconografia**: Utilizar a biblioteca `fa7-solid` ou similar via componente `<Icon />`.
- **Feedback Visual**: Botões de ação devem ter ícones e estados de `carregando`.
- **Acessibilidade**: Labels em maiúsculas, textos auxiliares em cinza claro, e contrastes adequados para o modo Dark.
