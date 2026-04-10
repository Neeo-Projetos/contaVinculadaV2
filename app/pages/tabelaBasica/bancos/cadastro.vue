<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:university" 
      :links="[{ label: 'Bancos', to: '/tabelaBasica/bancos' }]"
      :paginaAtual="ehEdicao ? form.nomeBanco || 'Editando Banco' : 'Novo Banco'"
    >
      <template #acoes>
        <AppBotao 
          v-if="!modoVisualizar"
          variacao="padrao" 
          icone="fa7-solid:download" 
          @click="navigateTo('/tabelaBasica/bancos/importar')"
        >
          Importação
        </AppBotao>
      </template>
    </AppBarraNavegacao>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoDados" mensagem="Buscando dados do banco..." />

      <form v-if="!carregandoDados" @submit.prevent="gravar" class="space-y-10 relative z-0">
        <AppFormularioSecao icone="fa7-solid:building-columns">
          Identificação da Instituição Bancária
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-4">
            <AppInputTexto v-model="form.codigoBanco" label="Código do Banco" placeholder="Ex: 001, 237, 341..." required maxlength="11" icone="fa7-solid:hashtag" :somenteLeitura="modoVisualizar" />
          </div>
          <div class="md:col-span-8">
            <AppInputTexto v-model="form.nomeBanco" label="Nome da Instituição" placeholder="Digite o nome oficial do banco..." required icone="fa7-solid:signature" :somenteLeitura="modoVisualizar" />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          :visualizar="modoVisualizar"
          labelEditar="&nbsp;Editar"
          iconeEditar="fa7-solid:pencil"
          iconeExcluir="fa7-solid:trash-can"
          :ocultarExcluir="registroInativo"
          @voltar="voltar"
          @excluir="modalExclusao = true"
          @limpar="novo"
          @gravar="gravar"
          @editar="irParaEdicao"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Inativação (Padrão) -->
    <AppModal 
      :isOpen="modalExclusao" 
      title="Atenção: Inativação de Registro" 
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
          Inativar Banco?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Esta ação desativará o registro. Tem certeza que deseja inativar <strong class="text-gray-800 dark:text-gray-200">{{ form.nomeBanco }}</strong> no sistema?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusao = false">
          Não, Cancelar
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" @click="excluir">
          Sim, Inativar Agora
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
  form, salvando, carregandoDados, modalExclusao, ehEdicao, modoVisualizar, irParaEdicao,
  registroInativo,
  gravar, excluir, novo, voltar,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta
} = useBancosFormulario()
</script>