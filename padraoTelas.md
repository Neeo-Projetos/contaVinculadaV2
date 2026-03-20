# Guia de Padronização "Ouro" - Sistema ContaVinculada

Este documento é a referência definitiva para a criação de novas telas no sistema. Ele define a arquitetura, os padrões visuais e as regras de negócio que garantem a consistência e a qualidade premium da experiência do usuário.

> [!IMPORTANT]
> Os módulos de **Funcionário** (`app/pages/cadastro/funcionario/`) e **Projeto** (`app/pages/cadastro/projeto/`) são os **Padrões Ouro**. 
> - **Funcionário**: Referência para cadastros simples (única tela).
> - **Projeto**: Referência para cadastros complexos (múltiplas etapas/steps).

---

## 0. Regras de Ouro (Invioláveis)

1. **Referência Absoluta**: Se o cadastro for simples, siga **Funcionário**. Se for complexo (muitos campos), siga **Projeto**.
2. **Navegação Distinta**: 
   - Telas de **Listagem** (`index.vue`): **NÃO** usam barra de navegação no topo. Usam apenas `AppCabecalhoPagina`.
   - Telas de **Cadastro** (`cadastro.vue`): **OBRIGATÓRIO** o uso de `AppBarraNavegacao` (Simples) ou `AppTrilhaNavegacao` (Complexo/Processos) no topo.
3. **Barra de Ferramentas Obrigatória**: Em listagens, use `AppBarraFerramentas`. 
   - `#acoes-principais` (Esquerda): Botões de "Novo" e "Relatórios".
   - `#acoes-pesquisa` (Direita): Botão "Pesquisar".
4. **Regra de Busca Ativa (Zero Auto-Load)**: Listagens começam vazias. Só carregam dados após interação explícita do usuário (pesquisa ou seleção no autocomplete).
5. **Grid System**: Use `md:grid-cols-12` com `gap-x-6 gap-y-8`. Alinhamento vertical é crucial.
6. **Inativação Lógica**: Nunca "Excluir". Sempre "Inativar". Use `AppModal` (tamanho `sm`) para confirmação.

---

## 1. Arquitetura de Telas (Frontend)

### 1.1 Listagem (`index.vue`)
Use o composable `use...Listagem.ts` para gerenciar o estado.
- **Cabeçalho**: `AppCabecalhoPagina`.
- **Filtros**: `AppInputAutocomplete` para busca rápida + `AppSelecaoStatus`.
- **Modais**: `AppModalExibicao` (colunas dinâmicas), `AppModalFiltroAvancado` e `AppModalHistorico`.
- **Visão**: Alternância entre Tabela e Cards via `AppContainerListagem`.

### 1.2 Cadastro Simples (`funcionario/cadastro.vue`)
Ideal para formulários que cabem em uma única visualização sem cansar o usuário.
- **Estrutura**: `AppBarraNavegacao` -> `AppCartaoFormulario` -> `AppFormularioSecao` -> `AppRodapeFormulario`.
- **Lógica**: Carregamento direto dos dados no `onMounted` via composable.

### 1.3 Cadastro Multi-Etapas (`projeto/cadastro.vue`)
**Por que utilizar?** Quando o volume de informações é alto (ex: Projetos tem Dados Gerais, Endereço e Parâmetros). Dividir em passos reduz a carga cognitiva e melhora a UX.
- **Componente Chave**: `AppPassosFormulario`.
- **Navegação**: `AppTrilhaNavegacao` (mais robusta que a barra simples).
- **UX Etapas**: 
  - **Validação Local**: Validar cada etapa antes de avançar (`avancarPasso`).
  - **Feedback Visual**: Usar a classe `animate-shake` em campos obrigatórios vazios.
  - **Resumo Final**: Exibir um `AppModal` de sucesso com o resumo dos dados salvos.

---

## 2. Camada de Lógica (Composables)

Os composables devem ser separados em arquivos distintos dentro de `app/composables/cadastro/[modulo]/`.

### 2.1 Padrão `use...Listagem.ts`
Deve retornar:
- `filtro`: Objeto reativo com os parâmetros de busca.
- `listaRegistros`: Array com os dados retornados da API.
- `colunasVisiveis`: Objeto para controle de visibilidade na tabela.
- `buscar...()`: Função que chama o endpoint `/api/.../listagem`.
- `abrirHistorico()`: Carrega logs de alteração do registro.

### 2.2 Padrão `use...Formulario.ts`
Deve gerenciar:
- `form`: Objeto `reactive` seguindo uma `interface` TypeScript rigorosa.
- `passoAtual` (se multi-etapas): Controla qual div do formulário exibir.
- `validarEtapa()`: Retorna boolean e popula o `Set` de `erros` (que dispara a animação `animate-shake`).
- `gravarRegistro()`: Faz o POST para `/api/.../gravar`.
- `excluirRegistro()`: Faz o POST para `/api/.../excluir` (inativação).
- **Sucesso**: Exibir o modal de resumo com `modalSucessoAberto`.

---

## 3. Camada de Servidor (API e DB)

### 3.1 Estrutura de Endpoints e Coleções XML
Localizados em `server/api/cadastro/[modulo]/`:
1. `listagem.post.ts`: Recebe filtros e retorna array de objetos. Deve usar `comum.formatarCpf` e `comum.abreviarNome` se necessário.
2. `recupera.get.ts`: Recebe um ID/Código e retorna o objeto completo para edição.
3. `gravar.post.ts`: 
   - Recebe o `form` completo. 
   - **Coleções (Grids)**: Se o formulário tiver listas (ex: `contas` ou `verbas`), converta-as para **XML** antes de enviar para o banco de dados via query EXEC.
   - Chama a **Procedures SQL**.
4. `excluir.post.ts`: Altera o campo `ativo` para `0`.
5. `autocomplete.get.ts`: Retorna sugestões leves (id/nome) para o `AppInputAutocomplete`.

### 3.2 Utilitários (`server/utils/comum.ts`)
**Sempre** utilize estas funções para manter a integridade:
- `comum.validaCPF` / `comum.validaCNPJ`.
- `comum.formatarDataSql`: Converte DD/MM/YYYY para YYYY-MM-DD.
- `comum.validaValorRecupera`: Converte números do banco para String "0,00".

---

## 4. Componentes de Interface (UI/UX)

| Componente | Uso Obrigatório | Contexto |
| :--- | :--- | :--- |
| `AppInputAutocomplete` | Sim | Busca principal da listagem. |
| `AppInputCpf` / `AppInputCnpj` | Sim | Validação automática de máscara e dígito. |
| `AppSelect` | Sim | Listas de seleção (use `itemValue="codigo"` e `itemLabel="descricao"`). |
| `AppBotao` | Sim | Use as variações: `acao` (azul/sistema), `primario` (verde/gravar), `perigo` (vermelho/inativar). |
| `AppSobreposicaoCarregamento` | Sim | feedback visual durante qualquer requisição `fetch`. |
| `AppAtivo` | Sim | Exibe o status "Ativo/Inativo" com cores padronizadas. |

---

## 5. Fluxo de Implementação (Passo a Passo)

Para criar uma nova tela sem erros:

1. **Defina o Tipo**: Simples (Etapa única) ou Complexo (Multi-passos).
2. **Crie o Back-end**: Endpoints de listagem, recupera, gravar e excluir. Use sempre Procedures SQL.
3. **Desenvolva o Composable**:
   - Defina a `interface` do formulário.
   - Implemente as funções de busca e persistência.
   - Para multi-etapas, crie a lógica de `passoAtual` e o `Set` de `erros`.
4. **Construa a View**:
   - Use os componentes `App...` conforme a tabela acima.
   - Garanta que todos os botões no `AppRodapeFormulario` estejam vinculados corretamente.
   - Adicione animações (`animate-fade-in` no container, `animate-shake` nos erros).
5. **Verifique o "Zero Auto-Load"**: Garanta que o `onMounted` da listagem não dispare busca sem filtros.

---

## 6. Diferença entre Funcionários e Projetos (O "Porquê")

| Característica | Funcionário (Simples) | Projeto (Complexo) |
| :--- | :--- | :--- |
| **Passos** | Não possui (`AppPassosFormulario`). | Possui 3 passos. |
| **Público** | Operacional (Cadastro rápido). | Gestão (Cadastro detalhado/contratual). |
| **Campos** | ~6 campos fundamentais. | >20 campos, incluindo endereços e verbas. |
| **UX Strategy** | Foco em velocidade. | Foco em organização e precisão de dados. |

> [!TIP]
> Use o `AppPassosFormulario` sempre que o formulário exigir que o usuário mude o "contexto mental" (ex: trocar de dados pessoais para dados bancários ou endereços).
