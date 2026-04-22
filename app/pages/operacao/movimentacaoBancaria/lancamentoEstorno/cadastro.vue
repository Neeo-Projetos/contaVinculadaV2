<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:reply-all" 
      :links="[{ label: 'Lançamentos', to: '/operacao/movimentacaoBancaria/lancamentoEstorno' }]"
      paginaAtual="Estorno Rápido por Projeto"
    />

    <!-- Área de Seleção Premium -->
    <AppCartaoFormulario class="overflow-visible">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-6">
          <AppSelect 
            v-model="projetoId" 
            label="Projeto" 
            placeholder="Selecione o projeto..."
            :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))"
          />
        </div>
        <div class="md:col-span-3">
          <AppSelect 
            v-model="tipoLancamento" 
            label="Origem" 
            :opcoes="[{ codigo: 2, descricao: 'Manual' }, { codigo: 3, descricao: 'Reembolso' }]"
          />
        </div>
        <div class="md:col-span-3">
          <AppBotao 
            variacao="primario" 
            class="w-full h-[42px] text-[10px] font-black uppercase tracking-widest"
            :carregando="buscando"
            @click="buscarLancamentos"
          >
            <Icon name="fa7-solid:magnifying-glass" class="mr-2" />
            Listar Lançamentos
          </AppBotao>
        </div>
      </div>
    </AppCartaoFormulario>

    <!-- Lista de Resultados (Estilo Padrão Reembolso com AppContainerListagem) -->
    <div v-if="lancamentos.length > 0 && !lancamentoSelecionado" class="space-y-4 animate-fade-in text-gray-900">
       <AppContainerListagem
         :lista="lancamentos"
         :carregando="buscando"
         :buscaRealizada="buscaRealizada"
         :totalRegistros="lancamentos.length"
         :totalPaginas="1"
         :paginaAtual="1"
         :itensPorPagina="100"
         :view="false"
         :edit="false"
         class="mb-0 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-gray-900"
       >
         <template #cabecalho-tabela>
           <th class="p-5 w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
           <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Usuário</th>
           <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Data</th>
           <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Classificação</th>
           <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-right">Valor</th>
           <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-center">Ações</th>
         </template>

         <template #linhas-tabela="{ item }">
           <td class="p-5 text-center cursor-pointer hover:bg-emerald-50/10 transition-colors" @click.stop="selecionarParaEstorno(item)">
             <div class="flex items-center justify-center">
               <AppCheckbox :modelValue="false" />
             </div>
           </td>
           <td class="p-5">
             <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase border border-gray-100 dark:border-gray-700">
                 {{ (item.usuarioNome || 'U').charAt(0) }}
               </div>
               <span class="text-xs font-bold text-gray-600 dark:text-gray-400">{{ item.usuarioNome || 'Sistema' }}</span>
             </div>
           </td>
           <td class="p-5 text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
             {{ item.dataMovimentacao }}
           </td>
           <td class="p-5">
             <div class="flex flex-col">
               <span class="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                 {{ item.classificacao }}
               </span>
               <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter opacity-60">
                 Código: {{ item.codigo }}
               </span>
             </div>
           </td>
           <td class="p-5 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right tabular-nums">
             R$ {{ formatarMoeda(item.valorMovimentacao) }}
           </td>
           <td class="p-5 text-center">
             <div class="flex items-center justify-center gap-2">
               <button 
                 @click.stop="abrirModalFuncionarios(item.codigo, item.tipoLancamento, item.codigoProjeto)"
                 class="w-9 h-9 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm"
                 title="Ver Funcionários"
               >
                 <Icon name="fa7-solid:users" class="w-4 h-4" />
               </button>
               <button 
                 @click.stop="selecionarParaEstorno(item)"
                 class="px-4 h-9 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
               >
                 Selecionar
               </button>
             </div>
           </td>
         </template>
       </AppContainerListagem>
    </div>

    <!-- Detalhes do Lançamento (Formulário) -->
    <AppCartaoFormulario v-if="lancamentoSelecionado" class="animate-fade-in relative">
      <button 
        @click="lancamentoSelecionado = null" 
        class="absolute top-6 right-6 p-2 text-gray-400 hover:text-rose-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm z-10"
        title="Voltar para lista"
      >
        <Icon name="fa7-solid:xmark" class="w-4 h-4" />
      </button>

      <div class="space-y-8">
        <AppFormularioSecao icone="fa7-solid:circle-info">
          Informações Detalhadas do Lançamento
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-4">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Data Movimentação</label>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold">{{ lancamentoSelecionado.dataMovimentacao }}</div>
          </div>
          <div class="md:col-span-4">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Tipo Movimentação</label>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold">{{ lancamentoSelecionado.tipoMovimentacao }}</div>
          </div>
          <div class="md:col-span-4">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Valor</label>
             <div class="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-black tabular-nums">R$ {{ formatarMoeda(lancamentoSelecionado.valorMovimentacao) }}</div>
          </div>

          <div class="md:col-span-6">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Classificação</label>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold uppercase">{{ lancamentoSelecionado.classificacao }}</div>
          </div>

          <div class="md:col-span-6">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Usuário Responsável</label>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold uppercase">{{ lancamentoSelecionado.usuarioNome || 'Não Identificado' }}</div>
          </div>

          <div class="md:col-span-12">
             <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Justificativa Original</label>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold min-h-[80px]">{{ lancamentoSelecionado.motivo || 'Nenhuma justificativa informada.' }}</div>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
          <AppBotao variacao="padrao" @click="lancamentoSelecionado = null">
            Cancelar Seleção
          </AppBotao>
          <AppBotao variacao="perigo" class="px-8 shadow-[0_10px_20px_rgba(225,29,72,0.2)]" @click="prepararEstornoRapido(lancamentoSelecionado)">
            <Icon name="fa7-solid:reply" class="mr-2" />
            Confirmar e Estornar
          </AppBotao>
        </div>
      </div>
    </AppCartaoFormulario>

    <!-- Modais de Segurança (Padronizados) -->
    <AppModalFuncionarios 
        :aberto="modalFuncionarioAberto" 
        :lista="listaFuncionariosModal"
        @close="modalFuncionarioAberto = false"
    />

    <AppModalMotivoEstorno 
        :aberto="modalEstornoAberto"
        v-model:motivo="estornoObj.motivo"
        :data-programada="dataEstornoDisplay"
        @close="modalEstornoAberto = false"
        @avancar="vaiParaPin"
    />

    <AppModalAssinaturaEletronica
        :aberto="modalPinAberto"
        v-model:pin="estornoObj.pin"
        :carregando="processandoEstorno"
        label-botao="Confirmar Estorno"
        @close="modalPinAberto = false"
        @confirmar="tentarFinalizar"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { 
  projetoId, tipoLancamento, projetosAtivos, buscando, lancamentos, buscaRealizada, lancamentoSelecionado,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios,
  modalEstornoAberto, modalPinAberto, estornoObj, dataEstornoDisplay, processandoEstorno,
  buscarLancamentos, selecionarParaEstorno, prepararEstornoRapido, vaiParaPin, tentarFinalizar, formatarMoeda, navegarParaCadastro
} = useLancamentoEstornoFormulario()

onMounted(() => {
  // Se veio código na URL, já tenta carregar? 
  // No caso de estorno, a tela de cadastro é mais uma busca rápida.
})
</script>
