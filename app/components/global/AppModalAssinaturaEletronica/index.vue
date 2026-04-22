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
      <div v-if="aberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative w-full max-w-md bg-white dark:bg-[#1e2029] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
          
          <!-- Header Premium Security -->
          <div class="bg-gradient-to-br from-[#1a1c23] to-[#2d3748] dark:from-[#0f172a] dark:to-[#1e293b] p-6 border-b border-gray-200/10 dark:border-gray-800 flex items-center justify-between relative overflow-hidden shrink-0">
            <!-- Decorative Shield Pattern -->
            <div class="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Icon name="fa7-solid:shield-halved" class="w-32 h-32 text-white" />
            </div>
            
            <h2 class="text-xl font-black text-white tracking-tight flex items-center gap-3 relative z-10">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md shadow-inner">
                <Icon name="fa7-solid:lock" class="w-4 h-4 text-emerald-400" />
              </div>
              Assinatura Eletrônica
            </h2>
            
            <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors relative z-10 w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Content Area -->
          <div class="p-8 space-y-8 bg-gray-50/10 dark:bg-transparent relative z-10">
            
            <!-- Icone e Instrução -->
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center border border-gray-200 dark:border-gray-700/50 shadow-inner group">
                <Icon name="fa7-solid:shield-check" class="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors duration-500" />
              </div>
              <div class="space-y-1">
                <p class="text-gray-900 dark:text-white font-black text-lg tracking-tight">Confirmação de Segurança</p>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Insira seu PIN operacional para processar</p>
              </div>
            </div>

            <!-- PIN Input Stylized -->
            <div class="relative group max-w-[280px] mx-auto">
              <input 
                :type="exibirPin ? 'text' : 'password'" 
                :value="pin"
                @input="$emit('update:pin', ($event.target as HTMLInputElement).value)"
                maxlength="6"
                class="w-full h-20 text-center text-4xl font-black tracking-[0.6em] bg-gray-50 dark:bg-gray-900/80 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all shadow-inner pl-6 text-gray-900 dark:text-white"
                placeholder="••••••"
              />
              <button 
                @click="exibirPin = !exibirPin"
                class="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 text-gray-300 hover:text-emerald-500 transition-colors bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <Icon :name="exibirPin ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-4 h-4" />
              </button>
            </div>

            <!-- Warning Footer Info -->
            <p class="text-[9px] text-gray-400 dark:text-gray-500 text-center font-bold uppercase tracking-widest leading-relaxed">
              Esta ação é protegida por criptografia de ponta a ponta <br/> e será registrada no log de auditoria.
            </p>

          </div>

          <!-- Footer Action -->
          <div class="p-6 bg-gray-50/50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800">
            <button 
              @click="$emit('confirmar')" 
              :disabled="carregando || pin.length < 1"
              class="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(225,29,72,0.2)] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Icon v-if="carregando" name="svg-spinners:ring-resize" class="w-5 h-5" />
              <template v-else>
                {{ labelBotao || 'Confirmar Operação' }}
                <Icon name="fa7-solid:arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  aberto: boolean
  pin: string
  carregando?: boolean
  labelBotao?: string
}>()

defineEmits(['close', 'update:pin', 'confirmar'])

const exibirPin = ref(false)
</script>

<style scoped>
input::placeholder {
  letter-spacing: 0.1em;
  opacity: 0.3;
}
</style>
