<template>
  <div class="w-full overflow-hidden">
    <table class="w-full text-center border-separate border-spacing-y-1 mx-auto max-w-full">
      <thead>
        <tr class="text-[9px] font-black uppercase tracking-tighter text-gray-500 dark:text-gray-400">
          <th class="py-2 px-2 text-left w-[20%]">Verba</th>
          <th class="py-2 px-2 w-[15%]">Vlr Original</th>
          
          <th class="py-2 px-2 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-l-lg w-[15%]">Décimo</th>
          <th class="py-2 px-1 bg-emerald-500/5 text-emerald-400/50 rounded-r-lg w-[5%]">%</th>
          
          <th class="py-2 px-2 bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-l-lg w-[15%]">Férias</th>
          <th class="py-2 px-1 bg-blue-500/5 text-blue-400/50 rounded-r-lg w-[5%]">%</th>
          
          <th class="py-2 px-2 bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-l-lg w-[15%]">Multa</th>
          <th class="py-2 px-1 bg-amber-500/5 text-amber-400/50 rounded-r-lg w-[5%]">%</th>
          
          <th class="py-2 px-2 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-l-lg w-[15%]">Submódulo</th>
          <th class="py-2 px-1 bg-indigo-500/5 text-indigo-400/50 rounded-r-lg w-[5%]">%</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in itens" :key="item.codigo" class="group transition-all duration-300">
          <td class="py-3 px-2 text-left font-bold text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-800/40 rounded-l-xl border-y border-l border-gray-100 dark:border-gray-700/50 truncate max-w-[120px]" :title="item.verbaDescricao">
            {{ item.verbaDescricao }}
          </td>
          
          <td class="py-3 px-2 font-black text-[11px] text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-700/50">
            {{ formatarMoeda(item.valorVerba) }}
          </td>

          <!-- Grupo Décimo -->
          <td class="py-3 px-2 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border-y border-emerald-500/10">
            {{ formatarMoeda(item.valorDecimoTerceiro) }}
          </td>
          <td class="py-3 px-1 text-[9px] font-black text-emerald-400/60 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border-y border-r border-emerald-500/10 rounded-r-lg">
            {{ item.percentualDecimoTerceiro }}%
          </td>

          <!-- Grupo Férias -->
          <td class="py-3 px-2 font-bold text-[11px] text-blue-600 dark:text-blue-400 bg-blue-500/[0.03] dark:bg-blue-500/[0.05] border-y border-l border-blue-500/10 rounded-l-lg">
            {{ formatarMoeda(item.valorFerias) }}
          </td>
          <td class="py-3 px-1 text-[9px] font-black text-blue-400/60 bg-blue-500/[0.03] dark:bg-blue-500/[0.05] border-y border-r border-blue-500/10 rounded-r-lg">
            {{ item.percentualFerias }}%
          </td>

          <!-- Grupo Multa -->
          <td class="py-3 px-2 font-bold text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border-y border-l border-amber-500/10 rounded-l-lg">
            {{ formatarMoeda(item.valorMultaFgts) }}
          </td>
          <td class="py-3 px-1 text-[9px] font-black text-amber-400/60 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border-y border-r border-amber-500/10 rounded-r-lg">
            {{ item.percentualMultaFgts }}%
          </td>

          <!-- Grupo Submódulo -->
          <td class="py-3 px-2 font-bold text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] border-y border-l border-indigo-500/10 rounded-l-lg">
            {{ formatarMoeda(item.valorSubmodulo) }}
          </td>
          <td class="py-3 px-1 text-[9px] font-black text-indigo-400/60 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] border-y border-r border-indigo-500/10 rounded-r-xl">
            {{ item.percentualSubmodulo }}%
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="itens.length === 0" class="p-12 text-center text-gray-400 italic bg-gray-50/50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 mx-2 mt-2">
      Nenhum detalhe de verba encontrado para este registro.
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  itens: { type: Array as PropType<any[]>, default: () => [] }
})

const formatarMoeda = (valor: number | string) => {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.4);
}
</style>
