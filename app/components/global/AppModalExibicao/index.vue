<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="aberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="relative bg-white dark:bg-[#1a1c23] rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
          
          <div class="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Icon name="fa7-solid:table-columns" class="w-5 h-5" />
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Controle de Exibição</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Selecione quais colunas deseja ver na tabela.</p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="(valor, chave) in colunas" :key="chave"
                   @click="colunas[chave] = !colunas[chave]"
                   class="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                   :class="colunas[chave] ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700'">
                <div class="w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0"
                     :class="colunas[chave] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-[#1e2029] border-gray-300 dark:border-gray-600'">
                  <Icon v-if="colunas[chave]" name="fa7-solid:check" class="w-3 h-3" />
                </div>
                <span class="font-bold text-sm" :class="colunas[chave] ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'">
                  {{ labels[chave] || chave }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-900/30 rounded-b-2xl">
            <AppBotao variacao="primario" icone="fa7-solid:check" @click="$emit('aplicar')">Pronto</AppBotao>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

defineProps({ 
  aberto: Boolean,
  colunas: { type: Object as PropType<Record<string, boolean>>, required: true },
  labels: { type: Object as PropType<Record<string, string>>, default: () => ({}) }
})

defineEmits(['close', 'aplicar'])
</script>