<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppBarraNavegacao 
      icone="fa7-solid:file-signature" 
      :links="[{ label: 'Parâmetros de Ofício', to: '/configuracao/parametros/oficio' }]"
      :paginaAtual="ehEdicao ? 'Edição de Parâmetros' : 'Novo Parâmetro de Ofício'"
    >
      <template #acoes>
          <AppBotao v-if="ehEdicao" variacao="padrao" icone="fa7-solid:clock-rotate-left" @click="abrirHistorico">
            Histórico
          </AppBotao>
          <AppBotao variacao="padrao" icone="fa7-solid:pen-nib" @click="navigateTo('/configuracao/parametros/oficio/padrao')">
            Redação Padrão
          </AppBotao>
      </template>
    </AppBarraNavegacao>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela || salvando" :mensagem="salvando ? 'Gravando dados...' : 'Carregando informações...'" />

      <form v-if="!carregandoTela" @submit.prevent="gravar" class="space-y-8 relative z-0">
            <AppFormularioSecao icone="fa7-solid:diagram-project">
                Seleção do Projeto
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
                <div class="md:col-span-12 lg:col-span-8" :class="{ 'animate-shake': erros.has('projeto') }">
                    <AppSelect 
                        v-model="form.projeto" 
                        label="Projeto Correspondente" 
                        placeholder="Selecione o projeto na lista..." 
                        :opcoes="projetos" 
                        itemValue="codigo" 
                        itemLabel="nomeExibicao" 
                        required 
                        :somenteLeitura="modoVisualizar || ehEdicao"
                        @change="buscarModeloPadrao"
                    />
                    <div v-if="!modoVisualizar" class="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
                        <Icon name="fa7-solid:wand-magic-sparkles" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <p class="font-bold uppercase tracking-wider mb-1">Carga Inteligente</p>
                            <p>Ao selecionar um projeto pela primeira vez, o sistema carregará automaticamente a redação padrão para agilizar seu trabalho.</p>
                        </div>
                    </div>
                </div>
            </div>
        <!-- PASSO 2: REDAÇÃO -->
        <AppFormularioSecao icone="fa7-solid:align-left">
            Redação do Ofício
        </AppFormularioSecao>

        <div class="mt-6 space-y-6">
            <div :class="{ 'animate-shake': erros.has('texto') }">
                <textarea 
                    v-model="form.texto" 
                    rows="15" 
                    class="w-full textarea-scrollbar bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-serif"
                    :class="{ 'opacity-80 grayscale-[0.5] cursor-default pointer-events-none': modoVisualizar }"
                    placeholder="Digite aqui o texto do ofício..."
                    :readonly="modoVisualizar"
                    required>
                </textarea>
            </div>

                <!-- Dica Variaveis -->
                <div class="bg-white dark:bg-[#1e2029] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h5 class="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">
                        <Icon name="fa7-solid:lightbulb" class="w-4 h-4" />
                        Variáveis Dinâmicas
                    </h5>
                    <div class="flex flex-wrap gap-2">
                        <code v-for="v in variaveis" :key="v" class="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono shadow-sm">
                            {{ v }}
                        </code>
                    </div>
                </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          :visualizar="modoVisualizar"
          iconeEditar="fa7-solid:pencil"
          ocultarExcluir
          @voltar="voltar"
          @limpar="limpar"
          @editar="irParaEdicao"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal Alerta Erro -->
    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="fecharModalAlerta"
    >
      <div class="p-6 text-center">
         <p class="text-base font-bold text-gray-700 dark:text-gray-200">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Entendi</AppBotao>
      </template>
    </AppModal>

    <!-- Modal Sucesso -->
    <AppModal :isOpen="modalSucessoAberto" title="Sucesso" icon="fa7-solid:circle-check" semScroll @close="voltar">
      <div class="flex flex-col items-center py-6 text-center">
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div class="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl"><Icon name="fa7-solid:check" class="w-12 h-12 text-white" /></div>
        </div>
        <h3 class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Sucesso!</h3>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-8">O parâmetro de ofício foi salvo.</p>
      </div>
      <template #footer><AppBotao variacao="primario" @click="voltar" class="w-full h-14 text-lg rounded-2xl">Voltar para Listagem</AppBotao></template>
    </AppModal>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoData"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, salvando, form, projetos, ehEdicao, variaveis, modoVisualizar, irParaEdicao,
  carregarProjetos, carregarDados, buscarModeloPadrao, gravar, limpar, voltar,
  erros, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta, modalSucessoAberto,
  modalHistoricoAberto, historicoData, carregandoHistorico, abrirHistorico
} = useParametrosOficioFormulario()
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
.animate-shake :deep(input), .animate-shake :deep(select), .animate-shake :deep(textarea) { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.dark .animate-shake :deep(input), .dark .animate-shake :deep(textarea), .dark .animate-shake :deep(select) { background-color: rgba(239, 68, 68, 0.05) !important; }

/* Custom Scrollbar for the Textarea */
.textarea-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.textarea-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 8px; /* Afasta o tracker do overflow top/bottom do padding p/ nao grudar nas bordas rounded-2xl */
}
.textarea-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 8px;
  border: 2px solid transparent; 
  background-clip: padding-box;
}
.dark .textarea-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
  border: 2px solid transparent; 
  background-clip: padding-box;
}
.textarea-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #10b981;
}
</style>