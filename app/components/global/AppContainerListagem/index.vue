<template>
  <div
    class="bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden flex flex-col relative transition-all duration-300"
    :class="(lista || []).length === 0 ? 'flex-1' : ''">

    <div v-if="buscaRealizada && ((lista || []).length > 0 || filtroGlobal)"
      class="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/40 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300">
      <!-- Busca na Esquerda -->
      <div class="w-full sm:max-w-sm flex items-center gap-3">
        <AppInputBusca :model-value="filtroGlobal" @update:model-value="$emit('update:filtroGlobal', $event)"
          placeholder="Buscar na listagem..." />
      </div>

      <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <!-- Seletor de Linhas na Direita -->
        <div class="flex items-center gap-4 group">
          <span class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Linhas por página:</span>
          <div class="relative flex-shrink-0">
            <div @click="dropdownLinhasAberto = !dropdownLinhasAberto"
                class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-lg px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-300 focus:outline-none transition-all cursor-pointer shadow-sm min-w-[85px] flex items-center justify-between gap-3 hover:border-emerald-500/50"
                :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]': dropdownLinhasAberto }">
                <span>{{ itensPorPagina }}</span>
                <Icon name="fa7-solid:chevron-down" class="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-all" :class="{ 'rotate-180': dropdownLinhasAberto }" />
            </div>
            
            <div v-if="dropdownLinhasAberto" class="fixed inset-0 z-40" @click="dropdownLinhasAberto = false"></div>
            
            <Transition name="dropdown">
                <div v-if="dropdownLinhasAberto" class="absolute top-full mt-1.5 right-0 z-50 w-full min-w-[85px] bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl py-1 animate-slide-up">
                <ul class="flex flex-col">
                    <li v-for="opcao in (visaoAtual === 'cards' ? [12, 24, 48, 96] : [10, 25, 50, 100])" :key="opcao" @click="selecionarLinhas(opcao)"
                    class="px-4 py-2 text-sm font-bold cursor-pointer transition-colors text-center"
                    :class="itensPorPagina === opcao ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'">
                    {{ opcao }}
                    </li>
                </ul>
                </div>
            </Transition>

          </div>
        </div>
      </div>
    </div>


    <div v-if="carregando && (lista || []).length === 0"
      class="flex-1 flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div class="relative flex items-center justify-center mb-6">
        <div class="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-ping opacity-20"></div>
        <div
          class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center relative z-10 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
          <Icon name="fa7-solid:spinner" class="animate-spin w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Buscando informações</h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400">Aguarde um momento, estamos processando os
        dados...</p>
    </div>

    <div v-else-if="!buscaRealizada"
      class="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div
        class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200/60 dark:border-gray-700/50 ring-8 ring-gray-50/50 dark:ring-gray-800/20">
        <Icon name="fa7-solid:magnifying-glass" class="w-10 h-10 text-emerald-500 dark:text-emerald-400 opacity-90" />
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Pronto para buscar</h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">Utilize a barra de
        pesquisa ou os filtros acima para listar os registros no sistema.</p>
    </div>

    <div v-else-if="(lista || []).length === 0"
      class="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div
        class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200/60 dark:border-gray-700/50 ring-8 ring-gray-50/50 dark:ring-gray-800/20">
        <Icon name="fa7-solid:folder-open" class="w-10 h-10 text-gray-400 dark:text-gray-500 opacity-80" />
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Nenhum registro encontrado
      </h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">Não encontramos dados com
        os filtros informados. Limpe os filtros e tente novamente.</p>
    </div>

    <div v-else class="relative z-10 bg-gray-50/30 dark:bg-transparent flex flex-col flex-1">

      <div v-if="carregando"
        class="absolute inset-0 z-30 bg-white/60 dark:bg-[#1e2029]/70 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 rounded-t-2xl">
        <div
          class="bg-white dark:bg-gray-800 p-4 px-6 rounded-2xl shadow-xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
          <Icon name="fa7-solid:spinner" class="animate-spin w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span class="font-bold text-sm tracking-wide text-gray-800 dark:text-gray-200">Atualizando lista...</span>
        </div>
      </div>

      <div v-if="visaoAtual === 'cards'" class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 p-4 sm:p-6">
        <template v-for="(item, index) in lista" :key="item.codigo || index">
          <slot name="cards" :item="item"></slot>
        </template>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
            <tr class="divide-x divide-gray-200 dark:divide-gray-800">
              <slot name="cabecalho-tabela"></slot>
              <th
                class="px-6 py-4 text-xs font-bold text-center text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/20 dark:text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800/80 bg-white dark:bg-[#1e2029]">
            <tr v-for="(item, index) in lista" :key="item.codigo || index"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group divide-x divide-gray-100 dark:divide-gray-800/60">
              <slot name="linhas-tabela" :item="item"></slot>
              <td class="px-6 py-4 text-center bg-gray-50/5 dark:bg-slate-800/5">
                <div class="flex items-center justify-center gap-2 pl-2">
                  <button v-if="view" @click.stop="$emit('view', item)"
                    class="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 border border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white"
                    title="Ver Detalhes">
                    <Icon v-if="loadingId === item.codigo" name="fa7-solid:spinner"
                      class="h-3.5 w-3.5 animate-spin" />
                    <Icon v-else :name="verIcone" class="h-3.5 w-3.5" />
                  </button>
                  <button @click.stop="$emit('edit', item)"
                    class="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                    title="Editar">
                    <Icon name="fa7-solid:pen" class="h-3.5 w-3.5" />
                  </button>
                  <button v-if="history" @click.stop="$emit('history', item.codigo || item.id)"
                    class="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 border border-slate-500/20 bg-slate-500/5 text-slate-500 hover:bg-slate-500 hover:text-white"
                    title="Ver Histórico">
                    <Icon name="fa6-solid:clock-rotate-left" class="h-3.5 w-3.5" />
                  </button>
                  <button v-if="isAtivo(item)" @click.stop="triggerDelete(item.codigo)"
                    class="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white"
                    title="Excluir">
                    <Icon name="fa7-solid:trash" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="bg-gray-50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800 p-4 sm:px-6 flex flex-col xl:flex-row items-center justify-between gap-4 mt-auto">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center xl:text-left">
          Mostrando de <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroInicial }}</span>
          até <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroFinal }}</span>
          de <span class="font-bold text-gray-900 dark:text-gray-100">{{ totalRegistros }}</span> registros
        </div>

        <div v-if="totalPaginas > 1"
          class="flex items-center bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
          <button type="button" @click="$emit('mudarPagina', paginaAtual - 1)" :disabled="paginaAtual === 1"
            class="px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
            :class="paginaAtual === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'">Anterior</button>
          <template v-for="(pag, index) in paginasExibidas" :key="index">
            <button type="button" v-if="pag !== '...'" @click="$emit('mudarPagina', Number(pag))"
              class="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
              :class="pag === paginaAtual ? 'bg-emerald-600 text-white cursor-default shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'">{{
              pag }}</button>
            <div v-else
              class="px-3 py-2 text-[10px] font-black text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 cursor-default">
              ...</div>
          </template>
          <button type="button" @click="$emit('mudarPagina', paginaAtual + 1)" :disabled="paginaAtual === totalPaginas"
            class="px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
            :class="paginaAtual === totalPaginas ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'">Próximo</button>
        </div>

      </div>
    </div>

    <!-- Modais de Exclusão e Feedback -->
    <AppModal :isOpen="modalConfirm.visivel" title="Confirmar Exclusão" icon="fa7-solid:triangle-exclamation" @close="modalConfirm.visivel = false">
      <div class="flex flex-col items-center justify-center p-4 text-center">
          <div class="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/30">
              <Icon name="fa7-solid:trash" class="w-8 h-8 text-rose-500" />
          </div>
          <p class="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
              {{ mensagemExcluir || 'Tem certeza que deseja excluir este registro?' }}
          </p>
      </div>
      <template #footer>
          <button @click="modalConfirm.visivel = false" class="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
          <AppBotao variacao="erro" class="!px-8" @click="handleConfirmDelete">Sim, Excluir</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalFeedback.visivel" :title="modalFeedback.titulo" :icon="modalFeedback.tipo === 'sucesso' ? 'fa7-solid:circle-check' : 'fa7-solid:circle-xmark'" @close="handleFeedbackClose">
      <div class="flex flex-col items-center justify-center p-4 text-center">
          <div :class="[
              'w-16 h-16 rounded-full flex items-center justify-center mb-4 border',
              modalFeedback.tipo === 'sucesso' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/30 text-rose-500'
          ]">
              <Icon :name="modalFeedback.tipo === 'sucesso' ? 'fa7-solid:circle-check' : 'fa7-solid:circle-xmark'" class="w-8 h-8" />
          </div>
          <p class="text-gray-600 dark:text-gray-300 font-medium">
              {{ modalFeedback.mensagem }}
          </p>
      </div>
      <template #footer>
          <AppBotao :variacao="modalFeedback.tipo === 'sucesso' ? 'acao' : 'erro'" @click="handleFeedbackClose">Ok, entendi</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue'

const props = defineProps({
  carregando: { type: Boolean, default: false },
  buscaRealizada: { type: Boolean, default: true },
  lista: { type: Array as PropType<any[]>, required: true },
  visaoAtual: { type: String, default: 'lista' },
  registroInicial: { type: Number, default: 0 },
  registroFinal: { type: Number, default: 0 },
  totalRegistros: { type: Number, default: 0 },
  itensPorPagina: { type: Number, default: 10 },
  totalPaginas: { type: Number, default: 1 },
  paginaAtual: { type: Number, default: 1 },
  paginasExibidas: { type: Array as PropType<(number | string)[]>, default: () => [] },
  filtroGlobal: { type: String, default: '' },
  
  // Novas props para Ações
  view: { type: Boolean, default: true },
  history: { type: Boolean, default: false },
  verIcone: { type: String, default: 'fa7-solid:eye' },
  loadingId: { type: [Number, String] as PropType<number | string | null>, default: null },
  endpointDelete: { type: String, default: '' },
  funcaoDelete: { type: String, default: 'excluir' },
  nomeTela: { type: String, default: '' },
  mensagemExcluir: { type: String, default: '' }
})

const emit = defineEmits(['mudarPagina', 'mudarItensPorPagina', 'update:filtroGlobal', 'view', 'edit', 'delete', 'delete-success', 'history'])
const dropdownLinhasAberto = ref(false)

const selecionarLinhas = (quantidade: number) => {
  dropdownLinhasAberto.value = false
  emit('mudarItensPorPagina', quantidade)
}

// Lógica de Exclusão
const modalConfirm = ref({
    visivel: false,
    codigo: null as number | string | null
});

const modalFeedback = ref({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: ''
});

const deveAtualizarAposFeedback = ref(false);

const triggerDelete = (codigo: number | string) => {
    modalConfirm.value = {
        visivel: true,
        codigo
    };
};

const handleFeedbackClose = () => {
    modalFeedback.value.visivel = false;

    if (deveAtualizarAposFeedback.value) {
        deveAtualizarAposFeedback.value = false;
        emit('delete-success');
    }
};

const handleConfirmDelete = async () => {
    const codigo = modalConfirm.value.codigo;
    modalConfirm.value.visivel = false;

    if (codigo === null) return;

    // Se tiver endpoint, faz a exclusão automática
    if (props.endpointDelete) {
        try {
            const response = await $fetch<any>(props.endpointDelete, {
                method: 'POST',
                body: {
                    funcao: props.funcaoDelete,
                    codigo: Number(codigo)
                }
            });

            if (response.status === 'success') {
                modalFeedback.value = {
                    visivel: true,
                    tipo: 'sucesso',
                    titulo: 'Sucesso',
                    mensagem: `${props.nomeTela || 'Registro'} excluído com sucesso.`
                };
                deveAtualizarAposFeedback.value = true;
            } else {
                throw new Error(response.message || 'Erro ao excluir');
            }
        } catch (error: any) {
            deveAtualizarAposFeedback.value = false;
            modalFeedback.value = {
                visivel: true,
                tipo: 'erro',
                titulo: 'Erro',
                mensagem: error.message || 'Não foi possível excluir o registro.'
            };
        }
    } else {
        // Caso contrário, apenas emite o evento para a página pai tratar
        emit('delete', codigo);
    }
};

const isAtivo = (item: any) => {
    const atv = item.ativo;
    const sts = item.status;

    if (atv === 1 || atv === true || sts === 1 || sts === true) return true;
    if (typeof atv === 'string' && atv.toLowerCase() !== 'inativo' && atv !== '0') return true;
    if (typeof sts === 'string' && sts.toLowerCase() !== 'inativo' && sts !== '0') return true;

    // Se não tiver nenhum dos campos, consideramos ativo por padrão
    if (atv === undefined && sts === undefined) return true;

    return false;
};

defineExpose({
    triggerDelete
});
</script>