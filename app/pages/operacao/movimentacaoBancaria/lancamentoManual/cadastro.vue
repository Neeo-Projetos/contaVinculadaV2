<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:file-invoice-dollar" 
      :links="[{ label: 'Lançamento Manual', to: '/operacao/movimentacaoBancaria/lancamentoManual' }]"
      :paginaAtual="editando ? 'Editando Lançamento' : 'Novo Lançamento'"
    />

    <div class="mb-4">
      <AppPassosFormulario :passos="passos" :passoAtual="passoAtual" @mudar-passo="passoAtual = $event" />
    </div>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela || salvando" :mensagem="salvando ? 'Gravando lançamento...' : 'Carregando dados...'" />

      <form v-if="!carregandoTela" @submit.prevent class="space-y-8 relative">
        
        <!-- PASSO 0: DADOS DO LANÇAMENTO -->
        <div v-show="passoAtual === 0" class="space-y-8 animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:circle-info">
            Dados do Lançamento
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
            <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('projeto') }">
              <AppSelect 
                v-model="form.projeto" 
                label="Projeto" 
                placeholder="Selecione o projeto..." 
                :opcoes="combos.projetos.map(p => ({ codigo: String(p.codigo), descricao: p.apelido ? `${p.apelido} - ${p.descricao}` : p.descricao }))"
              />
            </div>

            <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('contaVinculada') }">
              <AppSelect 
                v-model="form.contaVinculada" 
                label="Conta Vinculada" 
                placeholder="Selecione a conta..." 
                :opcoes="combos.contasVinculadas.map(c => ({ 
                  codigo: String(c.codigo), 
                  descricao: `${c.banco} - AG: ${c.agencia}${c.digitoAgencia ? '-' + c.digitoAgencia : ''} / CT: ${c.conta}${c.digitoConta ? '-' + c.digitoConta : ''}`
                }))"
              />
            </div>

            <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('tipoMovimentacao') }">
              <AppSelect 
                v-model="form.tipoMovimentacao" 
                label="Tipo de Movimentação" 
                :opcoes="combos.tiposMovimentacao.map(t => ({ codigo: t.codigo, descricao: t.descricao }))"
                placeholder="Selecione..."
              />
            </div>

            <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('valorMovimentacao') }">
              <AppInputMoeda 
                v-model="form.valorMovimentacao" 
                label="Valor" 
              />
            </div>

            <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('dataMovimentacao') }">
              <AppInputData 
                v-model="form.dataMovimentacao" 
                label="Data" 
                placeholder="DD/MM/AAAA"
                icone="fa7-solid:calendar-day"
              />
            </div>

            <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('classificacao') }">
              <AppSelect 
                v-model="form.classificacao" 
                label="Classificação" 
                :opcoes="combos.classificacoes.map(c => ({ codigo: c.codigo, descricao: c.descricao }))"
                placeholder="Selecione..."
              />
            </div>

            <div class="md:col-span-8" :class="{ 'animate-shake': erros.has('motivo') }">
              <AppInputTexto 
                v-model="form.motivo" 
                label="Motivo / Observação" 
                placeholder="Digite o motivo..."
                icone="fa7-solid:comment-dots"
                maxlength="200"
              />
            </div>
          </div>
        </div>

        <!-- PASSO 1: VINCULAR FUNCIONÁRIOS -->
        <div v-show="passoAtual === 1" class="space-y-8 animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:users-gear">
            Vincular Funcionários (Opcional)
          </AppFormularioSecao>

          <div class="space-y-6">
            <div class="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-end animate-fade-in">
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
                class="mb-0 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
                @mudarPagina="paginaFuncionario = $event"
              >
                <template #cabecalho-tabela>
                  <th class="p-5 w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
                  <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Funcionário</th>
                </template>

                <template #linhas-tabela="{ item }">
                  <td class="p-5 text-center transition-colors cursor-pointer hover:bg-emerald-50/10" @click.stop="item.selecionadoParaRemover = !item.selecionadoParaRemover">
                    <div class="flex items-center justify-center">
                      <AppCheckbox :modelValue="item.selecionadoParaRemover" />
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
          :labelGravar="passoAtual === 0 ? 'Próximo Passo' : (editando ? 'Atualizar Lançamento' : 'Finalizar Cadastro')"
          :iconeGravar="passoAtual === 0 ? 'fa7-solid:arrow-right' : 'fa7-solid:check'"
          @voltar="voltarPasso"
          @gravar="passoAtual === 0 ? avancarPasso() : tentarGravar()"
          @limpar="novoRegistro"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal Confirma Todos -->
    <AppModal :isOpen="modalConfirmaTodosAberto" title="Atenção: Lançamento Geral" icon="fa7-solid:circle-nodes" tamanho="sm" @close="modalConfirmaTodosAberto = false" rodapeEntre semScroll>
      <div class="flex flex-col items-center py-2 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:users" class="w-10 h-10 text-white" />
          </div>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[300px]">
          Deseja aplicar este lançamento para **TODOS** os funcionários deste projeto?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalConfirmaTodosAberto = false">Cancelar</AppBotao>
        <AppBotao variacao="primario" @click="gravar">Sim, Confirmar</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { useLancamentoManualFormulario } from '~/composables/operacao/movimentacaoBancaria/lancamentoManual/useLancamentoManualFormulario'

const {
  form, combos, salvando, carregandoTela, editando, erros,
  passoAtual, passos, avancarPasso, voltarPasso,
  modalConfirmaTodosAberto,
  funcionarioTemp,
  buscaFuncionario, buscandoFuncionario, sugestoesFuncionarios, mostrarMenuFuncionario,
  buscarFuncionariosAutoComplete, selecionarFuncionario,
  filtroFuncionario, paginaFuncionario, itensPorPaginaFuncionario,
  funcionariosFiltrados, funcionariosPaginados, totalPaginasFuncionario,
  registroInicialFuncionario, registroFinalFuncionario, paginasExibidasFuncionario,
  todosFuncionariosMarcados, marcarDesmarcarTodosFuncionarios,
  carregarContas, carregarProjetoDaConta, tentarGravar, gravar,
  addFuncionario, removerFuncionariosSelecionados, voltarParaLista, novoRegistro
} = useLancamentoManualFormulario()
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
.animate-shake :deep(input), .animate-shake :deep(select) { border-color: #ef4444 !important; background-color: #fef2f2 !important; }

.dark .animate-shake :deep(input) { background-color: rgba(239, 68, 68, 0.05) !important; }
</style>