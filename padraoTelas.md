# Guia de Padronização "Ouro" - Sistema ContaVinculada

Este documento é a referência definitiva para a criação de novas telas no sistema. Ele define a arquitetura, os padrões visuais e as regras de negócio que garantem a consistência e a qualidade premium da experiência do usuário.

> [!IMPORTANT]
> O módulo de **Funcionário** (`app/pages/cadastro/funcionario/`) é o **Padrão Ouro**. Qualquer nova tela de CRUD deve ser baseada rigorosamente na estrutura deste módulo.

---

## 1. Telas de Listagem (Ex: `index.vue`)

Uma tela de listagem padrão deve seguir a anatomia do arquivo [funcionario/index.vue](file:///c:/inetpub/wwwroot/contaVinculadaV2/app/pages/cadastro/funcionario/index.vue).

### 1.1 Estrutura Visual (Top-Down)
1. **Navegação**: Usar `AppTrilhaNavegacao` no topo (identidade breadcrumb).
2. **Cabeçalho**: `AppCabecalhoPagina` com título fino/grosso e ícone representativo.
3. **Barra de Filtros Principal**:
   - `AppInputAutocomplete`: Para busca textual com sugestões em tempo real.
   - `AppSelecaoStatus`: Para alternar entre registros ativos/inativos.
   - **Lado Direito**: Alternador de visão (Lista/Cards), botões de `Exibição` e `Filtros Avançados`.
4. **Barra de Ações**: Linha com botões `Novo Registro` (primário) e `Pesquisar`.

### 1.2 Componentes de Exibição
- **Tabela**:
  - Headers (`th`) vinculados ao objeto `labels` do Composable.
  - Link de edição no campo principal usando `NuxtLink`.
  - Ícone de histórico padronizado: `fa6-solid:history`.
  - Colunas com visibilidade dinâmica controlada pelo objeto `colunas`.
- **Cards**:
  - Usar `AppCardListagem` injetado no slot `#cards`.
  - Manter paridade de informações com a tabela.

---

## 2. Telas de Cadastro e Edição (Ex: `cadastro.vue`)

Basear-se integralmente no arquivo [funcionario/cadastro.vue](file:///c:/inetpub/wwwroot/contaVinculadaV2/app/pages/cadastro/funcionario/cadastro.vue).

### 2.1 Componentes Essenciais
- **AppCartaoFormulario**: Container principal que envolve o formulário.
- **AppSobreposicaoCarregamento**: Obrigatório para feedback de carregamento de dados e salvamento.
- **AppFormularioSecao**: Divide campos por contexto com ícones dedicados.
- **Rodapé Padronizado**: Usar `AppRodapeFormulario` com as props corretas para refletir o status do registro.

### 2.2 Regra de "Exclusão" (Inativação)
- **NUNCA** excluir dados fisicamente do banco de dados (salvo exceções raras).
- **Inativação Lógica**: Usar o termo "Inativar" em vez de "Excluir".
- **Comunicação**: O botão de inativação no rodapé só deve aparecer se o registro já estiver salvo (`editando`) e estiver atualmente **Ativo**.
- **Modal de Confirmação**: Usar `AppModal` com `tamanho="sm"`, `rodapeEntre` e `semScroll`. O texto deve informar que o dado permanecerá no histórico.

### 2.3 Formulários Complexos (Multi-etapas)
Para formulários com muitos campos ou divisões lógicas claras, use o padrão de passos:
- **Componente**: `AppPassosFormulario`.
- **Estrutura**:
  ```vue
  <AppTrilhaNavegacao class="mb-8" ... />
  <div class="mb-8">
    <AppPassosFormulario :passos="['Etapa 1', 'Etapa 2']" :passoAtual="passoAtual" />
  </div>
  <AppCartaoFormulario> ... </AppCartaoFormulario>
  ```
- **UX**: O rodapé deve alternar entre "Próxima Etapa" e "Finalizar Cadastro" conforme o `passoAtual`.

---

## 3. Camada de Lógica (Composables)

Toda a inteligência deve estar em composables dedicados.

### 3.1 Listagem (`use...Listagem.ts`)
- Mapear `labelsColunas` para reaproveitamento em modais e tabelas.
- Usar `colunasTemp` para permitir o "Cancelar" no modal de exibição.
- Implementar `placeholderDinamico` baseado em `useWindowSize` para melhor UX mobile.

### 3.2 Cadastro (`use...Formulario.ts`)
- Utilizar `reactive` para o objeto `form`.
- Definir `interface` TypeScript clara para o formulário.
- Centralizar o status `ativo` (status 0 ou 1) no estado do formulário para controle de UI.

### 3.3 Navegação de Passos
Em formulários multi-etapas, o composable deve gerenciar:
- `passoAtual: number`: Índice da etapa ativa.
- `avancarPasso()` / `voltarPasso()`: Funções de navegação com validação.
- `totalPassos: number`: Constante para controle de fim de fluxo.

---

## 4. Camada de Servidor (API e Utils)

### 4.1 Utilitários Universais (`comum.ts`)
- **Sempre** utilizar as funções do [comum.ts](file:///c:/inetpub/wwwroot/contaVinculadaV2/server/utils/comum.ts) para:
  - `validaCPF` / `validaCNPJ`.
  - `abreviarNome`: Para listagens onde o espaço é reduzido.
  - Formatações de data e valores (Recupera vs Grava).

### 4.2 Endpoints de API
- Seguir o padrão de retorno `{ status: 'success' | 'failed', data: ..., mensagem: ... }`.
- **Histórico**: Implementar o log de alterações comparando os valores antigos e novos para exibição amigável.

---

## 5. Design System e UX (Premium)
- **Modais**: Sempre usar `<Teleport to="body">` e `<Transition>` (implementado no `AppModal` global).
- **Z-Index**: O Modal global usa `z-[999]` para garantir visibilidade absoluta.
- **Micro-interações**: Usar as animações `animate-fade-in` e `animate-modal-in` para suavidade.
- **Iconografia**: Priorizar `fa7-solid` ou `fa6-solid` para consistência.
- **Espaçamento Central**: Usar `md:p-10` no container principal para telas de cadastro.
- **Grid de Formulários**:
  - Usar `gap-6` entre campos.
  - Alinhamento `items-end` para garantir que labels e inputs fiquem equilibrados visualmente.
  - Labels sempre em caixa alta (uppercase) e com `tracking-wider` (através dos componentes de input).
