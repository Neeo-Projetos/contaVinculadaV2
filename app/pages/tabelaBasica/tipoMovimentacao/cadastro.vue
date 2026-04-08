<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:shuffle" 
      :links="[{ label: 'Tipos de Movimentação', to: '/tabelaBasica/tipoMovimentacao' }]"
      :paginaAtual="ehEdicao ? form.descricao || 'Editando Registro' : 'Novo Registro'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoDados" mensagem="Buscando informações da movimentação..." />

      <form v-if="!carregandoDados" @submit.prevent="gravar" class="space-y-10 relative z-0">
        <AppFormularioSecao icone="fa7-solid:arrows-spin">
          Definição do Fluxo de Movimentação
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-8">
            <AppInputTexto 
              v-model="form.descricao" 
              label="Descrição do Tipo" 
              placeholder="Ex: Transferência, Depósito, Estorno..." 
              required 
              maxlength="255" 
              :somenteLeitura="somenteLeitura"
            />
          </div>
          <div class="md:col-span-4">
            <AppSelect 
              v-model="form.tipo" 
              label="Efeito Financeiro" 
              placeholder="Selecione..." 
              :opcoes="[{ codigo: '1', descricao: 'Crédito (+)' }, { codigo: '0', descricao: 'Débito (-)' }]" 
              required 
              :somenteLeitura="somenteLeitura"
            />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          :visualizar="somenteLeitura"
          labelExcluir="Remover Registro"
          iconeExcluir="fa7-solid:trash-can"
          @voltar="voltar"
          @excluir="confirmarExclusao"
          @limpar="novo"
          @gravar="gravar"
          @editar="habilitarEdicao"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Exclusão (Padrão) -->
    <AppModal 
      :isOpen="modalExclusao" 
      title="Atenção: Exclusão Permanente" 
      icon="fa7-solid:triangle-exclamation"
      @close="modalExclusao = false"
    >
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:trash-can" class="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Deseja Excluir?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Esta operação removerá permanentemente o tipo <strong class="text-gray-800 dark:text-gray-200">{{ form.descricao }}</strong>.
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusao = false">
          Não, Manter
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" @click="excluir">
          Sim, Excluir Agora
        </AppBotao>
      </template>
    </AppModal>

    <!-- Modal de Alerta -->
    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="modalAlertaAberto = false"
    >
      <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
         <p class="text-base text-center font-bold">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="modalAlertaAberto = false" class="w-full sm:w-auto">
          Ok, Entendido
        </AppBotao>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
const {
  form, ehEdicao, somenteLeitura, salvando, carregandoDados,
  modalExclusao, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
  gravar, confirmarExclusao, excluir, novo, voltar, habilitarEdicao
} = useTipoMovimentacaoFormulario()
</script>