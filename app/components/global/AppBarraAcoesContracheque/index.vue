<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="exibir" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div class="bg-gray-900/95 dark:bg-emerald-950/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-4 flex items-center justify-between gap-6">
        
        <!-- Info -->
        <div class="flex items-center gap-5 pl-4">
          <div class="relative">
            <div class="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
            <div class="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex flex-col items-center justify-center text-white shadow-lg">
              <span class="text-lg font-black leading-none">{{ total }}</span>
              <span class="text-[8px] font-black uppercase tracking-tighter opacity-80">Itens</span>
            </div>
          </div>
          <div class="flex flex-col">
            <h4 class="text-sm font-black text-white uppercase tracking-widest">Ações em Lote</h4>
            <p class="text-[10px] text-emerald-400/70 font-bold uppercase tracking-tight">Processar seleção atual</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-10 bg-white/10"></div>

        <!-- Ações -->
        <div class="flex items-center gap-3 pr-2">
          <AppBotao 
            variacao="perigo" 
            icone="fa7-solid:ban" 
            @click="$emit('reprovar')"
            class="!rounded-2xl !h-12 !px-6 !text-[10px] !font-black uppercase tracking-widest shadow-xl shadow-rose-950/20"
          >
            Reprovar
          </AppBotao>
          
          <AppBotao 
            variacao="primario" 
            icone="fa7-solid:check-double" 
            @click="$emit('aprovar')"
            class="!rounded-2xl !h-12 !px-8 !text-[10px] !font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20 bg-emerald-500 hover:bg-emerald-400 border-none"
          >
            Aprovar Tudo
          </AppBotao>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  exibir: { type: Boolean, default: false },
  total: { type: Number, default: 0 }
})

defineEmits(['aprovar', 'reprovar'])
</script>
