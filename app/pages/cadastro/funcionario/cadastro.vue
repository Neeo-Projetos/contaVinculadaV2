<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppTrilhaNavegacao 
      icone="fa7-solid:users" 
      :links="[{ label: 'Funcionários', to: '/cadastro/funcionario' }]"
      :paginaAtual="editando ? form.nomeCompleto || 'Editando Registro' : 'Novo Registro'"
    />

    <div class="flex-1 bg-white dark:bg-[#1e2029] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm relative">
      
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-t-3xl"></div>

      <div v-if="carregandoTela" class="absolute inset-0 z-10 bg-white/80 dark:bg-[#1e2029]/90 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 rounded-3xl">
        <Icon name="fa7-solid:spinner" class="animate-spin w-12 h-12 mb-4" />
        <span class="font-bold tracking-wide">Carregando dados do funcionário...</span>
      </div>

      <form v-else @submit.prevent="gravarRegistro" class="space-y-8 relative z-0">
        <div class="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <Icon name="fa7-solid:file-lines" class="text-gray-500 dark:text-gray-400 w-5 h-5" />
          </div>
          <h2 class="font-extrabold text-xl text-gray-800 dark:text-gray-200 tracking-tight">Dados Principais</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-6">
            <AppInputTexto v-model="form.nomeCompleto" label="Nome Completo" placeholder="Digite o nome..." required maxlength="60" />
          </div>
          
          <div class="md:col-span-3">
            <AppInputCpf v-model="form.cpf" required />
          </div>

          <div class="md:col-span-3">
            <AppInputTexto v-model="form.matricula" label="Matrícula" placeholder="Ex: 12345" required />
          </div>

          <div class="md:col-span-6">
            <AppInputEmail v-model="form.email" required maxlength="50" />
          </div>

          <div class="md:col-span-6">
            <AppSelect v-model="form.projeto" label="Projeto Responsável" placeholder="Selecione um projeto na lista..." :opcoes="projetosFormatados" itemValue="codigo" itemLabel="label" required />
          </div>
        </div>

        <div class="pt-6 mt-8 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <AppBotao variacao="padrao" icone="fa7-solid:arrow-left" @click="voltarParaLista">
              Voltar
            </AppBotao>

            <AppBotao v-if="editando" variacao="perigo" icone="fa7-solid:trash-can" @click="abrirModalExclusao">
              Excluir
            </AppBotao>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <AppBotao variacao="padrao" icone="fa7-solid:file" @click="limparFormulario">
              Limpar / Novo
            </AppBotao>
            
            <AppBotao nativeType="submit" variacao="primario" icone="fa7-solid:floppy-disk" :carregando="carregandoGravacao">
              Gravar Dados
            </AppBotao>
          </div>
        </div>
      </form>
    </div>

    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Exclusão" 
      icon="fa7-solid:triangle-exclamation"
      @close="fecharModal"
    >
      <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300">
         <p class="text-lg text-center font-bold">Confirma a exclusão permanente deste funcionário?</p>
         <p class="text-sm text-center mt-2 opacity-80">Esta ação não poderá ser desfeita e removerá os dados do banco.</p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="fecharModal">
          Cancelar
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash" :carregando="carregandoExclusao" @click="excluirRegistro">
          Sim, Excluir
        </AppBotao>
      </template>
    </AppModal>
    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="fecharModalAlerta"
    >
      <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
         <p class="text-base text-center font-medium">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full sm:w-auto">
          Entendi
        </AppBotao>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'

const {
  carregandoTela, carregandoGravacao, carregandoExclusao, modalExclusaoAberto, form, editando,
  projetosAtivos, carregarProjetos, carregarDados, voltarParaLista, limparFormulario,
  abrirModalExclusao, fecharModal, gravarRegistro, excluirRegistro,
  cpfInvalido, emailInvalido,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta 
} = useFuncionarioFormulario()

const projetosFormatados = computed(() => {
  return projetosAtivos.value.map(p => ({
    codigo: p.codigo,
    label: `${p.apelido} - ${p.descricao}`
  }))
})

onMounted(() => { 
  carregarProjetos()
  carregarDados() 
})
</script>