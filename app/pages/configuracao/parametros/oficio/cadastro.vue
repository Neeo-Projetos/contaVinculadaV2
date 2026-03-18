<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:file-signature" 
      :links="[{ label: 'Parâmetros de Ofício', to: '/configuracao/parametros/oficio' }]"
      :paginaAtual="ehEdicao ? 'Edição de Parâmetros' : 'Novo Parâmetro de Ofício'"
    />

    <div class="mb-2">
      <AppPassosFormulario 
        :passos="['Vincular Projeto', 'Redigir Conteúdo']" 
        :passoAtual="passoAtual - 1" 
      />
    </div>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela || salvando" :mensagem="salvando ? 'Gravando dados...' : 'Carregando informações...'" />

      <form v-if="!carregandoTela" @submit.prevent="avancarPasso" class="space-y-12 relative z-0">
        
        <!-- PASSO 1: PROJETO -->
        <div v-if="passoAtual === 1" class="animate-fade-in">
            <AppFormularioSecao icone="fa7-solid:diagram-project">
                Seleção do Projeto
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
                <div class="md:col-span-12 lg:col-span-8">
                    <AppSelect 
                        v-model="form.projeto" 
                        label="Projeto Correspondente" 
                        placeholder="Selecione o projeto na lista..." 
                        :opcoes="projetos" 
                        itemValue="codigo" 
                        itemLabel="apelido" 
                        required 
                        @change="buscarModeloPadrao"
                    />
                    <div class="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
                        <Icon name="fa7-solid:wand-magic-sparkles" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <p class="font-bold uppercase tracking-wider mb-1">Carga Inteligente</p>
                            <p>Ao selecionar um projeto pela primeira vez, o sistema carregará automaticamente a redação padrão para agilizar seu trabalho.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PASSO 2: REDAÇÃO -->
        <div v-if="passoAtual === 2" class="animate-fade-in">
            <AppFormularioSecao icone="fa7-solid:align-left">
                Redação do Ofício
            </AppFormularioSecao>

            <div class="mt-6 space-y-6">
                <textarea 
                    v-model="form.texto" 
                    rows="15" 
                    class="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-serif"
                    placeholder="Digite aqui o texto do ofício..."
                    required>
                </textarea>

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
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          :labelVoltar="passoAtual === 1 ? 'Retornar' : 'Etapa Anterior'"
          :labelGravar="passoAtual === totalPassos ? 'Finalizar Cadastro' : 'Próxima Etapa'"
          :iconeGravar="passoAtual === totalPassos ? 'fa7-solid:check-double' : 'fa7-solid:arrow-right'"
          @voltar="voltarPasso"
          @excluir="modalExclusaoAberto = true"
          @limpar="limpar"
          @gravar="avancarPasso"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Exclusão -->
    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Exclusão" 
      icon="fa7-solid:trash-can"
      tamanho="sm"
      rodapeEntre
      @close="modalExclusaoAberto = false"
    >
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
                <Icon name="fa7-solid:file-circle-xmark" class="w-10 h-10 text-white" />
            </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Remover Parâmetro?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px]">
          Deseja realmente remover a configuração de ofício deste projeto?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusaoAberto = false">Cancelar</AppBotao>
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" @click="excluir">Sim, remover</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, salvando, modalExclusaoAberto, form, projetos, ehEdicao, variaveis,
  carregarProjetos, carregarDados, buscarModeloPadrao, gravar, excluir, limpar, voltar,
  passoAtual, totalPassos, avancarPasso, voltarPasso
} = useParametrosOficioFormulario()
</script>