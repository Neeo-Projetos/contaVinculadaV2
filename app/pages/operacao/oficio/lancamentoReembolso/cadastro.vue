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

      <form v-if="!carregandoTela" @submit.prevent="avancarPasso" class="space-y-12 relative z-0">
        
        <!-- PASSO 1: INFORMAÇÕES DO LANÇAMENTO -->
        <div v-if="passoAtual === 1" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:circle-info">
            INFORMAÇÕES GERAIS DO LANÇAMENTO
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
            <div class="md:col-span-6">
              <AppSelect 
                v-model="form.projeto" 
                label="PROJETO" 
                placeholder="Selecione o projeto na lista..." 
                :opcoes="projetosFormatados" 
                itemValue="codigo" 
                itemLabel="label" 
                required 
                @change="carregarContas(form.projeto)"
              />
            </div>
            
            <div class="md:col-span-6">
              <AppSelect 
                v-model="form.contaVinculada" 
                label="CONTA VINCULADA" 
                placeholder="Selecione a conta bancária..." 
                :opcoes="contasVinculadas" 
                itemValue="codigo" 
                itemLabel="label"
                required 
                @change="carregarProjetoDaConta(form.contaVinculada)"
              />
            </div>

            <div class="md:col-span-4">
              <AppSelect 
                v-model="form.tipoMovimentacao" 
                label="TIPO DA MOVIMENTAÇÃO" 
                placeholder="Selecione o tipo..." 
                :opcoes="tiposMovimentacao" 
                itemValue="codigo" 
                itemLabel="descricao"
                required 
              />
            </div>

            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.valorMovimentacao" 
                label="VALOR DA MOVIMENTAÇÃO" 
                placeholder="0,00" 
                icone="fa7-solid:dollar-sign"
                required 
                @input="formatarValor('valorMovimentacao')"
              />
            </div>

            <div class="md:col-span-2">
              <AppInputTexto 
                v-model="form.dataMovimentacao" 
                label="DATA DA MOV." 
                placeholder="dd/mm/aaaa" 
                icone="fa7-solid:calendar-days"
                required 
                v-maska="'##/##/####'"
              />
            </div>

            <div class="md:col-span-3">
              <AppSelect 
                v-model="form.classificacaoLancamento" 
                label="CLASSIFICAÇÃO DO LANC." 
                placeholder="Selecione..." 
                :opcoes="classificacoes" 
                itemValue="codigo" 
                itemLabel="descricao"
                required 
              />
            </div>

            <div class="md:col-span-12">
              <AppInputTexto 
                v-model="form.motivo" 
                label="MOTIVO / JUSTIFICATIVA" 
                placeholder="Descreva o motivo deste lançamento detalhadamente..." 
                icone="fa7-solid:comment-dots"
                textarea
                rows="3"
                required 
              />
            </div>
          </div>
        </div>

        <!-- PASSO 2: INFORMAÇÕES DO OFÍCIO -->
        <div v-if="passoAtual === 2" class="animate-fade-in">
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
                required 
              />
            </div>

            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.dataOficio" 
                label="DATA DO OFÍCIO" 
                placeholder="dd/mm/aaaa" 
                icone="fa7-solid:calendar-check"
                required 
                v-maska="'##/##/####'"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.valorOficio" 
                label="VALOR DO OFÍCIO" 
                placeholder="0,00" 
                icone="fa7-solid:dollar-sign"
                required 
                @input="formatarValor('valorOficio')"
              />
            </div>

            <div class="md:col-span-3">
              <AppSelect 
                v-model="form.status" 
                label="STATUS ATUAL" 
                placeholder="Selecione o status..." 
                :opcoes="statusList" 
                itemValue="codigo" 
                itemLabel="descricao"
                required 
              />
            </div>

            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.dataResposta" 
                label="DATA DA RESPOSTA" 
                placeholder="dd/mm/aaaa" 
                icone="fa7-solid:calendar-minus"
                required 
                v-maska="'##/##/####'"
              />
            </div>

            <div class="md:col-span-3">
              <AppInputTexto 
                v-model="form.dataEntrada" 
                label="DATA DE ENTRADA" 
                placeholder="dd/mm/aaaa" 
                icone="fa7-solid:calendar-plus"
                required 
                v-maska="'##/##/####'"
              />
            </div>

            <div class="md:col-span-6">
                <AppSelect 
                  v-model="form.classificacaoOficio" 
                  label="CLASSIFICAÇÃO DO OFÍCIO" 
                  placeholder="Selecione a classificação..." 
                  :opcoes="classificacoes" 
                  itemValue="codigo" 
                  itemLabel="descricao"
                  required 
                />
            </div>
          </div>
        </div>

        <!-- PASSO 3: FUNCIONÁRIOS -->
        <div v-if="passoAtual === 3" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:users-rectangle">
            APLICAÇÃO EM FUNCIONÁRIOS (OPCIONAL)
          </AppFormularioSecao>
          
          <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2 mb-6 flex items-center gap-2">
            <Icon name="fa7-solid:circle-exclamation" class="w-4 h-4" />
            <span>Caso nenhum funcionário seja listado, o lançamento será aplicado globalmente ao projeto.</span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-6 items-end">
            <div class="md:col-span-8">
              <AppSelect 
                v-model="funcionarioTemp" 
                label="SELECIONE O FUNCIONÁRIO" 
                placeholder="Busque pelo nome..." 
                :opcoes="funcionariosAtivos" 
                itemValue="codigo" 
                itemLabel="nomeCompleto" 
                returnObject
              />
            </div>
            <div class="md:col-span-4 flex gap-2">
              <AppBotao variacao="padrao" icone="fa7-solid:plus" class="flex-1" @click="addFuncionario">Adicionar</AppBotao>
              <AppBotao variacao="perigo" icone="fa7-solid:minus" class="flex-1" @click="removerFuncionario">Remover</AppBotao>
            </div>
          </div>

          <div class="mt-8 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50/50 dark:bg-gray-900/10">
            <table class="w-full text-left border-collapse font-bold uppercase tracking-widest text-[10px]">
              <thead>
                <tr class="bg-white dark:bg-[#1e2029]">
                  <th class="p-4 w-12 text-center"></th>
                  <th class="p-4 text-gray-400">Nome do Funcionário</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.funcionarios.filter(f => f.tipoAlteracao !== 2)" :key="index" 
                    class="border-t border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-[#1e2029] transition-colors group">
                  <td class="p-4 text-center">
                    <AppCheckbox v-model="item.selecionadoParaRemover" />
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 font-extrabold text-[10px]">
                            {{ item.funcionarioNome.charAt(0).toUpperCase() }}
                        </div>
                        <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.funcionarioNome }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="form.funcionarios.filter(f => f.tipoAlteracao !== 2).length === 0">
                    <td colspan="2" class="p-10 text-center text-gray-400">
                        <div class="flex flex-col items-center gap-2 opacity-60">
                            <Icon name="fa7-solid:users-slash" class="w-10 h-10 mb-2" />
                            <p class="text-[10px] font-black uppercase tracking-widest">Nenhum Selecionado</p>
                        </div>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando" 
          :carregandoGravar="salvando"
          :labelVoltar="passoAtual === 1 ? 'Retornar à Lista' : 'Etapa Anterior'"
          :labelGravar="passoAtual === totalPassos ? 'Finalizar Cadastro' : 'Próxima Etapa'"
          :iconeGravar="passoAtual === totalPassos ? 'fa7-solid:check-double' : 'fa7-solid:arrow-right'"
          @voltar="voltarPasso"
          @limpar="limparFormulario"
          @gravar="avancarPasso"
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
  fecharModalAlerta, form, editando, projetosAtivos, contasVinculadas, tiposMovimentacao, classificacoes,
  funcionariosAtivos, statusList, funcionarioTemp, projetosFormatados, formatarValor, carregarContas,
  carregarProjetoDaConta, addFuncionario, removerFuncionario, tentarGravar, gravar, limparFormulario, voltarParaLista,
  passoAtual, totalPassos, avancarPasso, voltarPasso
} = useLancamentoReembolsoFormulario()
</script>