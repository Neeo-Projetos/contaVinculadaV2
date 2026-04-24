<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="aberto" class="fixed inset-0 z-[60] flex justify-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          @click="$emit('close')"
        ></div>

        <!-- Painel -->
        <Transition
          enter-active-class="transition transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition transform duration-400 ease-in-out"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
          appear
        >
          <div 
            class="relative w-full max-w-2xl bg-white dark:bg-[#12141a] shadow-2xl flex flex-col h-full border-l border-gray-100 dark:border-gray-800"
            @click.stop
          >
            <!-- Cabeçalho -->
            <div class="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-inner">
                  <Icon :name="icone" class="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                  <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {{ titulo }}
                  </h3>
                  <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] -mt-0.5">
                    {{ subtitulo }}
                  </p>
                </div>
              </div>
              <button 
                @click="$emit('close')"
                class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 transition-all border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:shadow-lg"
              >
                <Icon name="fa7-solid:xmark" class="w-4 h-4" />
              </button>
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
              <slot></slot>
            </div>

            <!-- Rodapé -->
            <div v-if="$slots.footer" class="px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  aberto: { type: Boolean, default: false },
  titulo: { type: String, default: 'Conferência' },
  subtitulo: { type: String, default: 'Auditoria de Detalhes' },
  icone: { type: String, default: 'fa7-solid:magnifying-glass-chart' }
})

defineEmits(['close'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.3);
}
</style>
