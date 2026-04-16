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

            <div v-if="form.funcionarios.filter(f => f.tipoAlteracao !== 2).length > 0" class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-[#1e2029]">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-800/50">
                    <th class="p-4 w-12 text-center border-b border-gray-100 dark:border-gray-800">
                       <Icon name="fa7-solid:check-double" class="text-gray-300" />
                    </th>
                    <th class="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">Funcionário</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr v-for="(item, index) in form.funcionarios.filter(f => f.tipoAlteracao !== 2)" :key="index" class="hover:bg-gray-50/50 transition-colors">
                    <td class="p-4 text-center">
                      <input type="checkbox" v-model="item.selecionadoParaRemover" class="w-5 h-5 rounded-lg border-gray-200 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                    </td>
                    <td class="p-4 font-bold text-sm text-gray-700 dark:text-gray-300">{{ item.funcionarioNome }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-12 bg-gray-50/30 dark:bg-gray-900/10 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
              <Icon name="fa7-solid:users-slash" class="w-12 h-12 text-gray-200 mb-4" />
              <p class="text-base text-gray-400 font-medium">Nenhum funcionário vinculado.</p>
              <p class="text-xs text-gray-300 mt-1">O lançamento será aplicado a todos do projeto por padrão.</p>
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