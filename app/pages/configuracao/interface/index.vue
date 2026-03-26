<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-10 animate-fade-in">
    <!-- Navegação -->
    <AppBarraNavegacao 
      pagina-atual="Acessibilidade" 
      icone="fa7-solid:universal-access" 
      :links="[]" 
    />

    <div class="w-full">
      <AppCartaoFormulario>
        <div class="p-6 md:p-10 space-y-16">
          
          <!-- SEÇÃO: TEMA -->
          <div>
            <AppFormularioSecao icone="fa7-solid:palette">
              Visual do Sistema
            </AppFormularioSecao>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-[-1.5rem] mb-8 ml-14 max-w-2xl leading-relaxed">
              Personalize a aparência do sistema para o modo que mais lhe agrada ou sincronize com seu Windows.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                v-for="tema in temas" 
                :key="tema.id"
                @click="colorMode.preference = tema.id; settings.tema = tema.id"
                class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border-2 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                :class="colorMode.preference === tema.id ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:shadow-md'"
              >
                <!-- Check de Seleção -->
                <div v-if="colorMode.preference === tema.id" class="absolute -right-2 -top-2 w-10 h-10 bg-emerald-500 flex items-center justify-center rounded-bl-2xl shadow-md z-20">
                    <Icon name="fa7-solid:check" class="w-4 h-4 text-white" />
                </div>

                <!-- Shape Decorativo -->
                <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" :class="colorMode.preference === tema.id ? 'bg-emerald-500/10' : 'bg-gray-500/5'"></div>

                <div class="flex items-start justify-between relative z-10 w-full">
                  <div class="flex-1 pr-4 text-left">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" :class="colorMode.preference === tema.id ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'">
                          Diferencial
                        </span>
                    </div>
                    <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
                      {{ tema.nome }}
                    </h3>
                  </div>
                  
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all group-hover:scale-110 group-hover:rotate-3" :class="colorMode.preference === tema.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/40'">
                    <Icon :name="tema.icone" class="w-6 h-6" :class="colorMode.preference === tema.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'" />
                  </div>
                </div>

                <!-- Preview Area -->
                <div class="mt-8 w-full aspect-[16/10] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 relative shadow-inner group-hover:shadow-md transition-shadow">
                   <div :class="tema.previewClass" class="absolute inset-0"></div>
                </div>
              </button>
            </div>
          </div>

          <!-- SEÇÃO: LAYOUT -->
          <div>
            <AppFormularioSecao icone="fa7-solid:layer-group">
              Layout do Sistema
            </AppFormularioSecao>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-[-1.5rem] mb-8 ml-14 max-w-2xl leading-relaxed">
              Escolha como deseja que o menu de navegação seja exibido no sistema.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                v-for="layout in layouts" 
                :key="layout.id"
                @click="settings.layout = layout.id"
                class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border-2 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                :class="settings.layout === layout.id ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:shadow-md'"
              >
                <!-- Check de Seleção -->
                <div v-if="settings.layout === layout.id" class="absolute -right-2 -top-2 w-10 h-10 bg-emerald-500 flex items-center justify-center rounded-bl-2xl shadow-md z-20">
                    <Icon name="fa7-solid:check" class="w-4 h-4 text-white" />
                </div>

                <!-- Shape Decorativo -->
                <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" :class="settings.layout === layout.id ? 'bg-emerald-500/10' : 'bg-gray-500/5'"></div>

                <div class="flex items-start justify-between relative z-10 w-full">
                  <div class="flex-1 pr-4 text-left">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" :class="settings.layout === layout.id ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'">
                          Configuração
                        </span>
                    </div>
                    <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
                      {{ layout.nome }}
                    </h3>
                  </div>
                  
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all group-hover:scale-110 group-hover:rotate-3" :class="settings.layout === layout.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/40'">
                    <Icon :name="layout.icone" class="w-6 h-6" :class="settings.layout === layout.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'" />
                  </div>
                </div>

                <!-- Preview Area Layout -->
                <div class="mt-8 w-full aspect-[21/9] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 relative shadow-inner group-hover:shadow-md transition-shadow">
                   <div class="absolute inset-0 bg-gray-50 dark:bg-gray-900 p-2 flex gap-1">
                      <template v-if="layout.id === 'barraLateral'">
                        <div class="w-8 h-full bg-emerald-500/30 rounded-md"></div>
                        <div class="flex-1 flex flex-col gap-1">
                          <div class="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                          <div class="flex-1 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-sm"></div>
                        </div>
                      </template>
                      <template v-else>
                        <div class="flex-1 flex flex-col gap-1">
                          <div class="h-4 w-full bg-emerald-500/30 rounded-sm"></div>
                          <div class="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                          <div class="flex-1 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-sm"></div>
                        </div>
                      </template>
                   </div>
                </div>
              </button>
            </div>
          </div>

          <!-- SEÇÃO: ACESSIBILIDADE VISUAL -->
          <div>
            <AppFormularioSecao icone="fa7-solid:eye">
              Acessibilidade de Cores
            </AppFormularioSecao>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-[-1.5rem] mb-8 ml-14 max-w-2xl leading-relaxed">
              Filtros inteligentes para melhorar a distinção de elementos para usuários com daltonismo e ajustes de escala.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AppSelect 
                 v-model="settings.daltonismo"
                 label="Modo de Cor (Daudonismo)"
                 :opcoes="[
                   { label: 'Normal (Nenhum)', id: 'normal' },
                   { label: 'Protanopia (Vermelho cego)', id: 'protanopia' },
                   { label: 'Deuteranopia (Verde cego)', id: 'deuteranopia' },
                   { label: 'Tritanopia (Azul cego)', id: 'tritanopia' }
                 ]"
                 item-label="label"
                 item-value="id"
                 placeholder="Selecione o modo..."
               />
               <AppSelect 
                 v-model="settings.escalaFonte"
                 label="Escala de Fonte"
                 :opcoes="[
                   { label: 'Pequena (80%)', id: 80 },
                   { label: 'Normal (100%)', id: 100 },
                   { label: 'Grande (120%)', id: 120 },
                   { label: 'Extra Grande (150%)', id: 150 }
                 ]"
                 item-label="label"
                 item-value="id"
                 placeholder="Selecione a escala..."
               />
            </div>
          </div>

          <!-- SEÇÃO: CONFORTO E PERFORMANCE -->
          <div>
            <AppFormularioSecao icone="fa7-solid:gauge-high">
              Conforto e Performance
            </AppFormularioSecao>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-[-1.5rem] mb-8 ml-14 max-w-2xl leading-relaxed">
              Otimize a experiência de uso para maior velocidade de navegação ou facilidade de leitura.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <!-- Alto Contraste -->
               <div 
                 @click="settings.altoContraste = !settings.altoContraste"
                 class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                 :class="settings.altoContraste ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:shadow-md'"
               >
                  <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                  <div class="flex items-start justify-between relative z-10">
                    <div class="flex-1 pr-4">
                      <div class="flex items-center gap-2 mb-2">
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" :class="settings.altoContraste ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'">
                            {{ settings.altoContraste ? 'Ativado' : 'Desativado' }}
                          </span>
                      </div>
                      <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
                        Alto Contraste
                      </h3>
                      <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        Melhora a separação visual entre os elementos do sistema.
                      </p>
                    </div>
                    
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all group-hover:scale-110" :class="settings.altoContraste ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/40'">
                      <Icon name="fa7-solid:circle-half-stroke" class="w-6 h-6" :class="settings.altoContraste ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'" />
                    </div>
                  </div>

                  <div class="mt-8 flex items-center justify-end relative z-10">
                    <div 
                      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 shadow-inner"
                      :class="{ 'bg-emerald-500 dark:bg-emerald-600': settings.altoContraste }"
                    >
                      <span 
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition duration-200"
                        :class="settings.altoContraste ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </div>
                  </div>
               </div>

               <!-- Reduzir Movimento -->
               <div 
                 @click="settings.reduzirMovimento = !settings.reduzirMovimento"
                 class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                 :class="settings.reduzirMovimento ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:shadow-md'"
               >
                  <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                  <div class="flex items-start justify-between relative z-10">
                    <div class="flex-1 pr-4">
                      <div class="flex items-center gap-2 mb-2">
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" :class="settings.reduzirMovimento ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'">
                            {{ settings.reduzirMovimento ? 'Ativado' : 'Desativado' }}
                          </span>
                      </div>
                      <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
                        Reduzir Movimento
                      </h3>
                      <p class="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        Desativa animações e transições para maior fluidez e foco.
                      </p>
                    </div>
                    
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all group-hover:scale-110" :class="settings.reduzirMovimento ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/40'">
                      <Icon name="fa7-solid:wind" class="w-6 h-6" :class="settings.reduzirMovimento ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'" />
                    </div>
                  </div>

                  <div class="mt-8 flex items-center justify-end relative z-10">
                    <div 
                      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 shadow-inner"
                      :class="{ 'bg-emerald-500 dark:bg-emerald-600': settings.reduzirMovimento }"
                    >
                      <span 
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition duration-200"
                        :class="settings.reduzirMovimento ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>

        <!-- Rodapé Flutuante e Orgânico -->
        <div class="p-6 sm:p-8">
          <div class="bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-[2rem] p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/10 dark:shadow-none">
             
             <div class="flex items-center gap-4 text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner group overflow-hidden">
                   <Icon name="fa7-solid:cloud-arrow-up" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-1 transition-transform duration-500" />
                </div>
                <div class="flex flex-col">
                   <span class="text-[9px] uppercase font-black text-emerald-600/70 dark:text-emerald-400/60 tracking-[0.25em]">Sincronização Ativa</span>
                   <span class="text-[11px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">Suas preferências estão seguras</span>
                </div>
             </div>

             <div class="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
                <button 
                  @click="restaurarPadroes"
                  class="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="fa7-solid:rotate-left" class="w-3.5 h-3.5" />
                  Resetar
                </button>
                
                <button 
                  @click="router.push('/')"
                  class="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="fa7-solid:circle-check" class="w-4 h-4" />
                  Finalizar
                </button>
             </div>
          </div>
        </div>
      </AppCartaoFormulario>
    </div>

  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const colorMode = useColorMode()
const { settings } = useInterfaceSettings()

const temas = [
  { id: 'light', nome: 'Claro', icone: 'fa7-solid:sun', previewClass: 'bg-white' },
  { id: 'dark', nome: 'Escuro', icone: 'fa7-solid:moon', previewClass: 'bg-[#1a1c23]' },
  { id: 'system', nome: 'Sistema', icone: 'fa7-solid:display', previewClass: 'bg-gradient-to-br from-white to-[#1a1c23]' }
]

const layouts = [
  { id: 'barraLateral' as const, nome: 'Barra Lateral', icone: 'fa7-solid:grip-vertical' },
  { id: 'barraSuperior' as const, nome: 'Barra Superior', icone: 'fa7-solid:window-maximize' }
]

const restaurarPadroes = () => {
  settings.value.tema = 'system'
  settings.value.daltonismo = 'normal'
  settings.value.escalaFonte = 100
  settings.value.reduzirMovimento = false
  settings.value.altoContraste = false
  settings.value.layout = 'barraLateral'
  colorMode.preference = 'system'
}
</script>

<style>
/* Estilos globais injetados para o protótipo */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

.high-contrast {
  --tw-shadow: 0 0 0 1px #000;
  contrast: 1.2;
}

.high-contrast .dark {
  --tw-shadow: 0 0 0 1px #fff;
}
</style>
