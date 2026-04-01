# Guia de Padronização "Ouro" - Sistema ContaVinculada

Este documento é a referência arquitetural definitiva para a criação de TUDO no sistema. Ele documenta não apenas as lógicas visuais, mas **os blueprints exatos dos Composables e manipulação de estado**. **Toda IA ou humano deve seguir este manual rigorosamente, copiando as estruturas detalhadas aqui ao invés de codificar soluções nativas Vue/Nuxt**.

> [!IMPORTANT]
> Os módulos de **Funcionário** (`app/pages/cadastro/funcionario/`) e **Projeto** (`app/pages/cadastro/projeto/`) são os **Padrões Ouro**. 
> - **Funcionário**: Referência para cadastros simples (única tela).
> - **Projeto**: Referência para cadastros complexos (múltiplas etapas/steps).

---

## 0. Regras de Ouro (Invioláveis e Restritas)

1. **Separação Estrita View/Controller**: O `.vue` é **estritamente View**. Todas as propriedades reativas de form, variáveis de *loading*, *notificações/alertas* e funções async/fetch devem ser injetadas a partir de um `use[Modulo]Formulario` ou `use[Modulo]Listagem`. Nenhum fetch avulso no vue.
2. **Zero Auto-Load Funcional**: Listagens começam vazias. A chamada de API para buscar lista só ocorre no clique de "Pesquisar" ou submissão de filtro explícita pelo usuário.
   - **Gatilho Autocomplete**: Ao escolher um item na lista de autocomplete, o disparo da busca (`filtrar()`) deve ser automático.
3. **Filtros e Status Inicial**: Todo filtro de listagem deve iniciar com o campo `Status` (ativoParam) marcado como **"1" (Ativos)**.
4. **Data Fetching Assíncrono Restrito**: Nunca use `useFetch` ou `useAsyncData` (isomórficos) para persistência e listagens. Use **SEMPRE o `$fetch` manual dentro de blocos `try/catch/finally`** manipulando *flags* de loading (ex: `carregandoTela.value = true`).
   - **Retorno de API**: APIs de listagem devem retornar os dados em um objeto com a chave `results` (ex: `{ status: 'success', results: [...] }`) para compatibilidade com o padrão de paginação.
5. **Sequência de Ações (Slot #acoes)**: No topo das listagens, a sequência visual obrigatória dos botões é: `[Relatório (excel)]` -> `[Exibição (desktop/config)]` -> `[Novo (plus + variacao-acao)]`.
6. **Suporte a Layout Dinâmico**: O sistema suporta dois modos de navegação (`barraLateral` e `barraSuperior`). Use o composable `useInterfaceSettings` para reagir ao layout atual se necessário.
6. **Navegação Distinta**: 
   - **Listagens (`index.vue`)**: Sem barra de navegação no topo. Usam apenas `AppCabecalhoPagina`.
   - **Cadastros (`cadastro.vue`)**: Uso OBRIGATÓRIO de `AppBarraNavegacao` (Simples) ou `AppTrilhaNavegacao` (Complexos) no topo.
7. **Inativação Lógica**: Nunca crie fluxos de "Delete" físico. Sempre "Inativar" o registro (`ativo = 0` ou `false`).
8. **Theme CSS & Layout**: Tudo requer suporte via classes `dark:`. Formulários usam sempre matriz em Grid responsiva (`grid grid-cols-1 md:grid-cols-12 gap-6 items-start`). O uso de `items-start` é obrigatório para garantir que as mensagens de erro abaixo dos inputs não desalinhem o topo dos campos na mesma linha.
9. **Estilos Embutidos vs Externos**: 
   - **Componentes (`components/`)**: Devem ser auto-contidos. O CSS deve estar dentro do arquivo `.vue` usando `<style scoped>`.
   - **Páginas (`pages/`)**: Devem manter seus estilos em arquivos `.css` externos (vinculados via `<style scoped src="./estilo.css">`) para manter o arquivo `.vue` limpo e focado na estrutura.



---

## 1. Blueprint da Camada de View (O Arquivo `.vue`)

### 1.1 View de Listagem (`index.vue`)
Use o componente wrapper definitivo:
1. **`AppFiltro`**: Centraliza o título, breadcrumbs, ações de topo (botões Novo/Relatório) e a lógica de filtros (Autocomplete + Select + Busca).
2. **`AppContainerListagem`**: Injetado dentro do slot padrão do `AppFiltro`.
   - Extraia a reatividade de `use[A]Listagem()` com *destructuring*.
   - **Obrigatório**: Vincule as ações via eventos nativos (`@view`, `@edit`, `@history`, `@delete-success`) e passe a prop `endpointDelete` e `nomeTela` para automação do CRUD.
   - Use `#cabecalho-tabela`, `#linhas-tabela` e `#cards`. Condicionais atadas via `v-if="colunas.nomeColuna"`.

### 1.2 View de Cadastro Simples vs Multi-Etapas
- **Simples (`funcionario/cadastro.vue`)**: Ideal para fluxos curtos. Usa `AppBarraNavegacao` -> `AppCartaoFormulario` -> `AppSobreposicaoCarregamento` -> `<form @submit.prevent="gravarRegistro">` -> `AppFormularioSecao` -> `<AppRodapeFormulario>`.
- **Complexo (`projeto/cadastro.vue`)**: Quando o volume de campos exige carga cognitiva dividida. Usa `AppTrilhaNavegacao` e o componente chave `AppPassosFormulario`. A submissão bloqueia avanço: `<form @submit.prevent="passoAtual === x ? gravarRegistro() : avancarPasso()">`.

### 1.3 Validação Visual e Mensagens de Erro
- Os campos nunca são nativos HTML. Use `AppInputTexto`, `AppInputCnpj`, `AppSelect`, etc.
- **Implementação Visual de Erro**: O framework utiliza a prop `:erro` para exibir mensagens de validação diretamente abaixo do campo, sem deformar o layout.
- **Obrigatoriedade**: Use a prop `required` para exibir o asterisco vermelho `*`.
- **Alinhamento Resiliente**: O container pai (Grid) deve usar `items-start` para que o surgimento da mensagem de erro em um campo não desalinhe os outros campos da mesma linha.

```vue
<AppInputTexto 
  v-model="form.email" 
  label="E-mail"
  required
  :erro="erros.email" 
/>
```

**Dica Técnica**: O uso de `AppNotificacao` via `dispararAlerta()` deve acompanhar a validação para erros globais ou impeditivos de busca/gravação.


---

## 2. Componentes de Interface UI/UX Padrões do Sistema

| Componente | Contexto Ouro e Uso Obrigatório |
| :--- | :--- |
| `AppFiltro` | **Essencial p/ Listagens**. Wrapper que unifica Header, Breadcrumbs, Busca e Modos de Visão. |
| `AppContainerListagem` | Container de dados com suporte nativo a Tabela/Cards, Paginação e Deleção. |
| `AppBarraSuperior` | Cabeçalho global. Gerencia perfil, logout e navegação (no modo `barraSuperior`). |
| `AppBarraLateral` | Menu retrátil. Possui busca rápida de menu e sistema de favoritos. |
| `AppInputAutocomplete` | Busca principal no header de telas de Listagem (via AppFiltro). |
| `AppInputCpf` / `Cnpj` / `Cep` | Inputs mascarados e validados por regras de negócio nativas. |
| `AppSelect` | Listas de seleção (Sempre passe props `itemValue="codigo"` e `itemLabel="descricao"`). |
| `AppBotao` | Use variações engessadas: `acao` (azul), `primario` (verde/gravar), `perigo` (vermelho/inativar). |
| `AppSobreposicaoCarregamento` | Layer de opacidade durante qualquer `$fetch` crítico p/ a UI. |
| `AppAtivo` | Exibe pills do sistema com o status "Ativo/Inativo" usando cores padronizadas. |
| `AppNotificacao` | **Padrão para Alertas**. Substitui o alert() nativo e modais de erro. Use `useAppNotificacao().dispararAlerta()`. |
| `AppCampoObrigatorio` | Card de aviso Âmbar para sinalizar campos que devem ser preenchidos. |



> [!IMPORTANT]
> **Formatação Estrita de Combos (Projetos)**: É OBRIGATÓRIO exibir os projetos no formato `APELIDO - DESCRIÇÃO` (ex: `NTL - Neoo`). No fetching (`/api/cadastro/projeto/ativos`), use `.map()` para criar a propriedade virtual `nomeExibicao: \`\${p.apelido} - \${p.descricao}\`` e vincule-a ao `itemLabel` do `AppSelect`.

---

## 3. Blueprint Rigoroso dos Composables

A lógica vital reside aqui (`app/composables/cadastro/[modulo]/...`). Estas variáveis DEVERÃO existir.

### 3.1 Composable de Listagem (`use...Listagem.ts`)
- **Paginação Global via Função Auxiliar**: Nunca escreva paginação lógica manual. Utilize **`usePaginacaoFrontEnd(listaCompleta, visaoAtual)`**.
- **Debounce de Autocomplete**: Sugestões exigem length > 2 e `setTimeout()` para evitar spam de Requests.
- **Modais Avançados (Booleans)**: Controles nativos como `modalFiltroAvancadoAberto`, `modalExibicaoAberto` e a property `colunasVisiveis`.

### 3.2 Composable de Formulário (`use...Formulario.ts`)
1. **Identificadores Iniciais**: Resgate via `const registroId = useRoute().query.id as string`.
2. **Interface TS Forte**: Defina tipos rígidos, ex: `interface ModuloForm { codigo: string | number, ... }`.
3. **Reatividade e Edição**: `const form = reactive<ModuloForm>({ codigo: registroId || '0', ... })`.
4. **Tratamento de Erros via Objeto**: `const erros = reactive<Record<string, string>>({ campo: '' })` para armazenar mensagens de erro individuais.
5. **Notificações Seguras**: Nunca acesse o nativo `alert()`. Invoque `dispararAlerta(titulo, msg, tipo)` do `useAppNotificacao`.
6. **Integração CRUD**: Funções `carregarDados()`, `gravarRegistro()` e `excluirRegistro()` manipulando métodos `$fetch`.

### 3.3 Composable de Interface (`useInterfaceSettings.ts`)
- Gerencia `tema`, `daltonismo`, `escalaFonte`, `reduzirMovimento`, `altoContraste` e `layout`.
- Persistência automática via `useLocalStorage`.

---

## 4. Camada de Servidor Backend (API em `/server/api/`)

A via de comunicação final usa endpoints Nuxt:
1. `listagem.post.ts`: Extraia filtros e devolva a query no limite necessário.
2. `recupera.get.ts`: Retorna JSON puro do registro (`?codigo=x`).
3. `gravar.post.ts`: Recebe `form`. **Obrigatório**: Converter Arrays (Grids) para XML raw se necessário para a SP.
4. `excluir.post.ts`: Procedimento de Inativar (`update set ativo = 0`).
5. `autocomplete.get.ts`: Fast fetch com propriedades enxutas para combos visuais (ID, Apelido).

### 4.1 Utilitários Universais (`server/utils/comum.ts`)
Qualquer conversão de entrada de Form para formato do BD:
- Máscaras: `comum.validaCPF`, `comum.validaCNPJ`.
- Datas: `comum.formatarDataSql` converte DD/MM/YYYY p/ `YYYY-MM-DD`.
- Valores Monetários: `comum.validaValorRecupera` devolve valores do server em String formatada.

---

## 5. Diferença entre Formulário Simples vs Complexo (O "Porquê")

| Característica | Padrão Simples (Ex: Funcionário) | Padrão Complexo (Ex: Projeto) |
| :--- | :--- | :--- |
| **Passos** | Não possui (`AppPassosFormulario`). Fica tudo em tela única. | Possui 3 passos ou mais dividindo o formulário. |
| **Design Intent** | Foco primário na Velocidade. Público mais Operacional. | Foco primário na Carga Cognitiva. Quebra blocos de contrato vs financeiro. |
| **Arquitetura** | Usa apenas Header padrão e um botão Salvar ao final. | Valida a etapa (erros.has) ANTES de autorizar "Avançar". |

---

## 6. Fluxo de Implementação I.A. (Passo a Passo)

Para criar uma nova base para uma tela:
1. **Verifique a Complexidade**: Defina o Tipo (única fase ou steps).
2. **Criar Server APIs**: Gere as bases (`listagem, recupera, gravar, excluir`); use utils de SQL se possível.
3. **Criar Blueprint dos Composables**: Prepare a Interface `IModulo`, o hook `usePaginacaoFrontEnd` e injete os loads de botões e alertas customizados.
4. **Construir a Interface (.vue)**: Copie os templates Grid Tailwind e conecte cada `<AppInput*>` com suas respectivas variáveis reativas e validações (`animate-shake`) e `<AppModal>` informativos/sucesso.
5. **Blindagem final**: Execute auditoria do "Zero Auto-Load".

---

## 7. O Segredo da "Clonagem Perfeita" (Ecossistema Modular)

**LEI ABSOLUTA: Você deve SEMPRE usar as telas e Composables de 'Funcionário' ou 'Projeto' como "molde arquitetural" de base. Abra os arquivos originais deles, entenda os padrões e extraia as estruturas (Grid, Nomenclaturas, funções e wrappers de UX). Adapte essas fundações de ponta a ponta para o contexto da sua nova entidade.**

Ao criar uma nova tela de listagem:
1. **Wrapper `AppFiltro`**: Configure o título, ícone e breadcrumbs.
2. **Ações**: Use o slot `#acoes` para os botões de controle lateral.
3. **Container**: Use `AppContainerListagem` com os eventos `@edit`, `@view` e `endpointDelete` preenchidos.
4. **Slots de Dados**: Mantenha a simetria entre a visualização de **Tabela** e **Cards**.
5. **Composables**: Siga o padrão de retorno de flags de loading, listagens e paginação via `usePaginacaoFrontEnd`.

