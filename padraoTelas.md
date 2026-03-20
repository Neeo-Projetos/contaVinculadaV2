# Guia de Padronização "Ouro" - Sistema ContaVinculada

Este documento é a referência arquitetural definitiva para a criação de TUDO no sistema. Ele documenta não apenas as lógicas visuais, mas **os blueprints exatos dos Composables e manipulação de estado**. **Toda IA ou humano deve seguir este manual rigorosamente, copiando as estruturas detalhadas aqui ao invés de codificar soluções nativas Vue/Nuxt**.

> [!IMPORTANT]
> Os módulos de **Funcionário** (`app/pages/cadastro/funcionario/`) e **Projeto** (`app/pages/cadastro/projeto/`) são os **Padrões Ouro**. 
> - **Funcionário**: Referência para cadastros simples (única tela).
> - **Projeto**: Referência para cadastros complexos (múltiplas etapas/steps).

---

## 0. Regras de Ouro (Invioláveis e Restritas)

1. **Separação Estrita View/Controller**: O `.vue` é **estritamente View**. Todas as propriedades reativas de form, variáveis de *loading*, *modais de alerta* e funções async/fetch devem ser injetadas a partir de um `use[Modulo]Formulario` ou `use[Modulo]Listagem`. Nenhum fetch avulso no vue.
2. **Zero Auto-Load Funcional**: Listagens começam vazias. A chamada de API para buscar lista só ocorre no clique de "Pesquisar" ou submissão de filtro explícita pelo usuário.
3. **Data Fetching Assíncrono Restrito**: Nunca use `useFetch` ou `useAsyncData` (isomórficos) para persistência e listagens. Use **SEMPRE o `$fetch` manual dentro de blocos `try/catch/finally`** manipulando *flags* de loading (ex: `carregandoTela.value = true`).
4. **Navegação Distinta**: 
   - **Listagens (`index.vue`)**: Sem barra de navegação no topo. Usam apenas `AppCabecalhoPagina`.
   - **Cadastros (`cadastro.vue`)**: Uso OBRIGATÓRIO de `AppBarraNavegacao` (Simples) ou `AppTrilhaNavegacao` (Complexos) no topo.
5. **Inativação Lógica**: Nunca crie fluxos de "Delete" físico. Sempre "Inativar" o registro (`ativo = 0` ou `false`).
6. **Theme CSS & Layout**: Tudo requer suporte via classes `dark:`. Formulários usam sempre matriz em Grid responsiva (`grid grid-cols-1 md:grid-cols-12 gap-6 items-end`). A tela principal (View root) deve iniciar com `<div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">`.

---

## 1. Blueprint da Camada de View (O Arquivo `.vue`)

### 1.1 View de Listagem (`index.vue`)
Use a trindade nativa do sistema:
1. `AppCabecalhoPagina` (exclusivo p/ lists).
2. `AppBarraFerramentas` (Pesquisa lateral esquerda/direita contendo filtros rápidos, ex: `AppInputAutocomplete` e `AppSelecaoStatus`).
3. `AppContainerListagem` (com slots responsivos).
   - Extraia a reatividade de `use[A]Listagem()` com *destructuring*. O container exige mapeamento rígido: `:lista="listaRegistros"`, `:paginaAtual="paginaAtual"`, etc.
   - Use `#cabecalho-tabela` e `#linhas-tabela`. Condicionais atadas via `v-if="colunasVisiveis.nomeColuna"`.

### 1.2 View de Cadastro Simples vs Multi-Etapas
- **Simples (`funcionario/cadastro.vue`)**: Ideal para fluxos curtos. Usa `AppBarraNavegacao` -> `AppCartaoFormulario` -> `AppSobreposicaoCarregamento` -> `<form @submit.prevent="gravarRegistro">` -> `AppFormularioSecao` -> `<AppRodapeFormulario>`.
- **Complexo (`projeto/cadastro.vue`)**: Quando o volume de campos exige carga cognitiva dividida. Usa `AppTrilhaNavegacao` e o componente chave `AppPassosFormulario`. A submissão bloqueia avanço: `<form @submit.prevent="passoAtual === x ? gravarRegistro() : avancarPasso()">`.

### 1.3 Validação Visual "Shake"
- Os campos nunca são nativos HTML. Use `AppInputTexto`, `AppInputCnpj`, `AppSelect`, etc.
- **Implementação Visual de Erro**: O framework exige tremulação e highlights automáticos vermelhos nos erros do form:
```vue
<div :class="{ 'animate-shake': erros.has('cnpj') }">
   <AppInputCnpj v-model="form.cnpj" required />
</div>
```

---

## 2. Componentes de Interface UI/UX Padrões do Sistema

| Componente | Contexto Ouro e Uso Obrigatório |
| :--- | :--- |
| `AppInputAutocomplete` | Busca principal no header de telas de Listagem. |
| `AppInputCpf` / `Cnpj` / `Cep` | Inputs mascarados e validados por regras de negócio nativas. |
| `AppSelect` | Listas de seleção (Sempre passe props `itemValue="codigo"` e `itemLabel="descricao"`). |
| `AppBotao` | Use variações engessadas: `acao` (azul), `primario` (verde/gravar), `perigo` (vermelho/inativar). |
| `AppSobreposicaoCarregamento` | Layer de opacidade durante qualquer `$fetch` crítico p/ a UI que renderiza dados lidos. |
| `AppAtivo` | Exibe pills do sistema com o status "Ativo/Inativo" usando cores padronizadas. |

---

## 3. Blueprint Rigoroso dos Composables

A lógica vital reside aqui (`app/composables/cadastro/[modulo]/...`). Estas variáveis DEVERÃO existir.

### 3.1 Composable de Listagem (`use...Listagem.ts`)
- **Paginação Global via Função Auxiliar**: Nunca escreva paginação lógica manual. Utilize **`usePaginacaoFrontEnd(listaCompleta, visaoAtual)`**. Você mapeia o `$fetch` na API para `listaCompleta.value = apiData` e o composable gerenciará e retornará `listaPaginada`, `paginaAtual`, etc.
- **Debounce de Autocomplete**: Sugestões exigem length > 2 e `setTimeout()` para evitar spam de Requests.
- **Modais Avançados (Booleans)**: Controles nativos como `modalFiltroAvancadoAberto`, `modalExibicaoAberto` e a property `colunasVisiveis`.

### 3.2 Composable de Formulário (`use...Formulario.ts`)
1. **Identificadores Iniciais**: Resgate via `const registroId = useRoute().query.id as string`.
2. **Interface TS Forte**: Defina tipos rígidos, ex: `interface ModuloForm { codigo: string | number, ... }`.
3. **Reatividade e Edição**:
   - `const form = reactive<ModuloForm>({ codigo: registroId || '0', ... })`
   - `const editando = computed(() => form.codigo !== '0' && !!form.codigo)`
4. **Tratamento de Erros via `Set`**: `const erros = reactive(new Set<string>())`. Função manual `validarEtapa()` atualiza este Set para disparar o `animate-shake`.
5. **Modais Seguros**: Nunca acesse o nativo `alert()`. Invoque métodos abstratos como `mostrarAlerta(titulo, msg)`, que abrirão o `AppModal` usando prop de erro `icon="fa7-solid:circle-exclamation"`.
6. **Integração CRUD**: Funções `carregarDados()`, `gravarRegistro()` e `excluirRegistro()` manipulando métodos `$fetch({ method: 'POST', body: form })` dentro de `try/catch/finally` acompanhados das flags estritas `carregandoTela`, `carregandoGravacao`, `carregandoExclusao`.

---

## 4. Camada de Servidor Backend (API em `/server/api/`)

A via de comunicação final usa endpoints Nuxt:
1. `listagem.post.ts`: Extraia filtros e devolva a query no limite necessário.
2. `recupera.get.ts`: Retorna JSON puro do registro (`?codigo=x`).
3. `gravar.post.ts`: Recebe `form`. **Obrigatório**: Se submeter Listas filhas/Grids (ex: `verbas`), converta os Arrays do JS para um XML raw (ex: `<row id="X" />`) antes de despachar via `EXEC SP_` do SQL Server.
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

Quando for solicitado criar uma tela, não tente inventar o design do zero. Em vez disso, inicie transportando o esqueleto modular do 'Funcionário' (se for tela única) e molde o seu objetivo em cima dele:
1. **Slots Ouro da Barra de Ferramentas**: Não esqueça de dividir as ações em `#entradas`, `#acoes-secundarias` (Filtros e View), `#acoes-principais` (Novo Registro), e `#acoes-pesquisa`.
2. **Modais Periféricos**: Toda listagem madura do sistema contém a integração simultânea do `AppModalFiltroAvancado`, `AppModalExibicao` (para colunas da tabela dinâmica vinculadas por `v-if="colunas.x"`) e o `AppModalHistorico`. O Composable deve gerenciá-los ativamente.
3. **Travamento Condicional (Novo vs Editando)**: Na View de `/cadastro`, os ID's controlam o estado da UI. Verifique se `id=0` para derivar flag booleana `editando`. Essa flag **muta e trava** chaves estrangeiras/unicas (`:disabled="editando"`) ou abre o input para cadastro de um novo item. Essa mutação precisa estar visível logo no input principal do form.
