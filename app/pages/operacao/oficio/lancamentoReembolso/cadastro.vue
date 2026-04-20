<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:file-invoice-dollar" 
      :links="[{ label: 'Lançamento Reembolso', to: '/operacao/oficio/lancamentoReembolso' }]"
      :paginaAtual="editando ? `Edição: Ofício nº ${form.numeroOficio}` : 'Novo Lançamento'"
    />

    <div class="mb-2">
      <AppPassosFormulario 
        :passos="['Informações Gerais', 'Dados do Ofício', 'Funcionários']" 
        :passoAtual="passoAtual - 1" 
        @mudar-passo="passoAtual = $event + 1"
      />
    </div>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela || salvando" :mensagem="salvando ? 'Gravando dados...' : 'Carregando informações...'" />

      <form v-if="!carregandoTela" @submit.prevent class="space-y-12 relative">
        
        <!-- PASSO 1: INFORMAÇÕES DO LANÇAMENTO -->
        <div v-if="passoAtual === 1" class="animate-fade-in relative z-10">
          <AppFormularioSecao icone="fa7-solid:circle-info">
            INFORMAÇÕES GERAIS DO LANÇAMENTO
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
            <div class="md:col-span-6">
              <AppSelect 
                v-model="form.projeto" 
                label="PROJETO" 
                placeholder="Selecione o projeto..." 
                :opcoes="combos.projetos.map(p => ({ codigo: String(p.codigo), descricao: p.apelido ? `${p.apelido} - ${p.descricao}` : p.descricao }))"
                :somente-leitura="editando"
              />
            </div>
            
            <div class="md:col-span-6">
              <AppSelect 
                v-model="form.contaVinculada" 
                label="CONTA VINCULADA" 
                placeholder="Selecione a conta..." 
                :opcoes="combos.contasVinculadas" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-4">
              <AppSelect 
                v-model="form.tipoMovimentacao" 
                label="TIPO DE MOVIMENTAÇÃO" 
                placeholder="Selecione o tipo..." 
                :opcoes="combos.tiposMovimentacao" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-4">
              <AppInputMoeda 
                v-model="form.valorMovimentacao" 
                label="VALOR" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-4">
              <AppInputData 
                v-model="form.dataMovimentacao" 
                label="DATA" 
                placeholder="DD/MM/AAAA"
                icone="fa7-solid:calendar-day"
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-4">
              <AppSelect 
                v-model="form.classificacaoLancamento" 
                label="CLASSIFICAÇÃO" 
                placeholder="Selecione..." 
                :opcoes="combos.classificacoes" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-8">
              <AppInputTexto 
                v-model="form.motivo" 
                label="MOTIVO / JUSTIFICATIVA" 
                placeholder="Descreva o motivo deste lançamento detalhadamente..." 
                icone="fa7-solid:comment-dots"
                textarea
                rows="3"
                :somente-leitura="editando"
              />
            </div>
          </div>
        </div>

        <!-- PASSO 2: INFORMAÇÕES DO OFÍCIO -->
        <div v-if="passoAtual === 2" class="animate-fade-in relative z-10">
          <AppFormularioSecao icone="fa7-solid:stamp">
            INFORMAÇÕES DO OFÍCIO DE REEMBOLSO
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.numeroOficio" 
                label="Nº DO OFÍCIO" 
                placeholder="Digite o número..." 
                icone="fa7-solid:hashtag"
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputData 
                v-model="form.dataOficio" 
                label="DATA DO OFÍCIO" 
                placeholder="DD/MM/AAAA"
                icone="fa7-solid:calendar-check"
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputMoeda 
                v-model="form.valorOficio" 
                label="VALOR DO OFÍCIO" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-3">
              <AppSelect 
                v-model="form.status" 
                label="STATUS ATUAL" 
                placeholder="Selecione o status..." 
                :opcoes="combos.statusList" 
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputData 
                v-model="form.dataResposta" 
                label="DATA DA RESPOSTA" 
                placeholder="DD/MM/AAAA"
                icone="fa7-solid:calendar-minus"
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputData 
                v-model="form.dataEntrada" 
                label="DATA DE ENTRADA" 
                placeholder="DD/MM/AAAA"
                icone="fa7-solid:calendar-plus"
                :somente-leitura="editando"
              />
            </div>

            <div class="md:col-span-6">
                <AppSelect 
                  v-model="form.classificacaoOficio" 
                  label="CLASSIFICAÇÃO DO OFÍCIO" 
                  placeholder="Selecione a classificação..." 
                  :opcoes="combos.classificacoes" 
                  :somente-leitura="editando"
                />
            </div>
          </div>
        </div>

        <!-- PASSO 3: FUNCIONÁRIOS -->
        <div v-if="passoAtual === 3" class="space-y-8 animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:users-gear">
            Vincular Funcionários (Opcional)
          </AppFormularioSecao>

          <div class="space-y-6">
            <div v-if="!editando" class="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-end animate-fade-in text-gray-900">
              <div class="flex-1 w-full">
                <AppInputAutocomplete 
                  v-model="buscaFuncionario" 
                  label="Pesquisar Funcionário" 
                  placeholder="Digite o nome (min. 3 caracteres)..."
                  :sugestoes="sugestoesFuncionarios"
                  :buscando="buscandoFuncionario"
                  :mostrarMenu="mostrarMenuFuncionario"
                  item-value="codigo"
                  item-label="nomeCompleto"
                  @buscar="buscarFuncionariosAutoComplete"
                  @selecionar="selecionarFuncionario"
                  @fechar="mostrarMenuFuncionario = false"
                />
              </div>
              <div class="flex gap-2 w-full md:w-auto">
                <AppBotao variacao="primario" @click="addFuncionario" class="flex-1 md:flex-none h-12">
                   <Icon name="fa7-solid:plus" class="mr-2" /> Adicionar
                </AppBotao>
                <AppBotao variacao="perigo" @click="removerFuncionariosSelecionados" class="flex-1 md:flex-none h-12">
                  <Icon name="fa7-solid:trash-can" />
                </AppBotao>
              </div>
            </div>

            <!-- Barra de Busca e Ações da Tabela de Vínculos -->
            <template v-if="form.funcionarios.filter(f => f.tipoAlteracao !== 2).length > 0">
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="flex-1 w-full">
                  <AppInputTexto 
                    v-model="filtroFuncionario"
                    placeholder="Filtrar funcionários já adicionados..."
                    icone="fa7-solid:magnifying-glass"
                    label=""
                    class="!mb-0"
                  />
                </div>

                <AppBotao 
                  v-if="!editando"
                  :variacao="todosFuncionariosMarcados ? 'perigo' : 'padrao'"
                  :icone="todosFuncionariosMarcados ? 'fa7-solid:xmark' : 'fa7-solid:check-double'" 
                  @click.prevent="marcarDesmarcarTodosFuncionarios"
                  class="!h-11 !px-6 !text-[10px] !rounded-xl shadow-sm w-full sm:w-auto uppercase font-black tracking-widest"
                >
                  {{ todosFuncionariosMarcados ? 'Desmarcar Todos' : 'Marcar Todos' }}
                </AppBotao>
              </div>

              <!-- Listagem Premium -->
              <AppContainerListagem
                :lista="funcionariosPaginados"
                :carregando="false"
                :buscaRealizada="true"
                :totalRegistros="funcionariosFiltrados.length"
                :registroInicial="registroInicialFuncionario"
                :registroFinal="registroFinalFuncionario"
                :totalPaginas="totalPaginasFuncionario"
                :paginaAtual="paginaFuncionario"
                :itensPorPagina="itensPorPaginaFuncionario"
                :paginasExibidas="paginasExibidasFuncionario"
                :view="false"
                :edit="false"
                class="mb-0 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-gray-900"
                @mudarPagina="paginaFuncionario = $event"
              >
                <template #cabecalho-tabela>
                  <th class="p-5 w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
                  <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Funcionário</th>
                </template>

                <template #linhas-tabela="{ item }">
                  <td class="p-5 text-center transition-colors" :class="!editando ? 'cursor-pointer hover:bg-emerald-50/10' : ''" @click.stop="!editando && (item.selecionadoParaRemover = !item.selecionadoParaRemover)">
                    <div class="flex items-center justify-center">
                      <AppCheckbox :modelValue="item.selecionadoParaRemover" :somenteLeitura="editando" />
                    </div>
                  </td>
                  <td class="p-5">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] group-hover:scale-110 transition-transform uppercase">
                        {{ (item.funcionarioNome || 'F').charAt(0) }}
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 transition-colors truncate">
                          {{ item.funcionarioNome }}
                        </span>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter opacity-60">
                          Código: {{ item.funcionarioId }}
                        </span>
                      </div>
                    </div>
                  </td>
                </template>
              </AppContainerListagem>

              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2 opacity-70">
                <Icon name="fa7-solid:circle-info" class="text-emerald-500 w-4 h-4" />
                Clique em qualquer lugar da linha para selecionar.
              </p>
            </template>

            <div v-else class="text-center py-16 bg-gray-50/30 dark:bg-gray-900/10 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 animate-fade-in shadow-inner">
              <div class="relative inline-block mb-6">
                <div class="absolute inset-0 bg-gray-200/20 blur-2xl rounded-full animate-pulse"></div>
                <Icon name="fa7-solid:users-slash" class="w-16 h-16 text-gray-200 relative z-10" />
              </div>
              <p class="text-lg text-gray-400 font-black uppercase tracking-tighter">Nenhum funcionário vinculado</p>
              <p class="text-xs text-gray-300 mt-2 font-bold uppercase tracking-widest">O lançamento será aplicado a todos do projeto por padrão.</p>
            </div>
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando" 
          :carregandoGravar="salvando"
          :labelVoltar="passoAtual === 1 ? 'Retornar à Lista' : 'Etapa Anterior'"
          :labelGravar="editando ? (passoAtual === totalPassos ? 'Fechar Visualização' : 'Próxima Etapa') : (passoAtual === totalPassos ? 'Finalizar Cadastro' : 'Próxima Etapa')"
          :iconeGravar="editando ? (passoAtual === totalPassos ? 'fa7-solid:xmark' : 'fa7-solid:arrow-right') : (passoAtual === totalPassos ? 'fa7-solid:check-double' : 'fa7-solid:arrow-right')"
          class="relative z-0"
          @voltar="voltarPasso"
          @limpar="limparFormulario"
          @gravar="editando && passoAtual === totalPassos ? voltarParaLista() : avancarPasso()"
        />
      </form>
    </AppCartaoFormulario>

    <!-- MODAIS -->
    <AppModal :isOpen="modalConfirmaProjeto" title="Lançamento Global" icon="fa7-solid:building-user" tamanho="sm" rodapeEntre @close="modalConfirmaProjeto = false">
      <div class="py-4 text-center">
        <p class="text-sm font-medium text-gray-500 mb-6">Confirmar este lançamento para <strong class="text-gray-900">todos</strong> os funcionários vinculados ao projeto?</p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalConfirmaProjeto = false">Não, voltar</AppBotao>
        <AppBotao variacao="primario" @click="gravar">Sim, Confirmar</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalAlertaAberto" :title="modalAlertaTitulo" icon="fa7-solid:circle-exclamation" tamanho="sm" @close="fecharModalAlerta">
      <div class="p-6 text-center">
         <p class="text-base font-bold text-gray-700 dark:text-gray-200">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Ok</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, salvando, modalConfirmaProjeto, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
  fecharModalAlerta, form, editando, combos,
  funcionarioTemp, buscaFuncionario, buscandoFuncionario, sugestoesFuncionarios, mostrarMenuFuncionario,
  buscarFuncionariosAutoComplete, selecionarFuncionario,
  filtroFuncionario, paginaFuncionario, itensPorPaginaFuncionario,
  funcionariosFiltrados, funcionariosPaginados, totalPaginasFuncionario,
  registroInicialFuncionario, registroFinalFuncionario, paginasExibidasFuncionario,
  todosFuncionariosMarcados, marcarDesmarcarTodosFuncionarios,
  carregarContas, carregarProjetoDaConta, addFuncionario,
  removerFuncionariosSelecionados, tentarGravar, gravar, limparFormulario, voltarParaLista,
  passoAtual, totalPassos, avancarPasso, voltarPasso
} = useLancamentoReembolsoFormulario()
</script>