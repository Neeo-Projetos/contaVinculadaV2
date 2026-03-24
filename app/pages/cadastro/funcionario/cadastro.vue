<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:users" 
      :links="[{ label: 'Funcionários', to: '/cadastro/funcionario' }]"
      :paginaAtual="editando ? form.nomeCompleto || 'Editando Registro' : 'Novo Registro'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Carregando dados do funcionário..." />

      <form v-if="!carregandoTela" @submit.prevent="handleSubmit" class="space-y-8 relative z-0">
        <AppFormularioSecao icone="fa7-solid:file-lines">
          Dados Principais
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-8">
            <AppInputTexto ref="nomeCompletoRef" v-model="form.nomeCompleto" label="Nome Completo" placeholder="Digite o nome completo do funcionário..." required maxlength="60" icone="fa7-solid:user" />
          </div>
          
          <div class="md:col-span-4">
            <AppInputCpf ref="cpfRef" v-model="form.cpf" @invalido="cpfInvalido = $event" required />
          </div>

          <div class="md:col-span-3">
            <AppInputTexto ref="matriculaRef" v-model="form.matricula" label="Matrícula" placeholder="Ex: 12345" required icone="fa7-solid:id-badge" />
          </div>

          <div class="md:col-span-4">
            <AppInputEmail ref="emailRef" v-model="form.email" @invalido="emailInvalido = $event" required maxlength="50" />
          </div>

          <div class="md:col-span-5">
            <AppSelect 
              ref="projetoRef"
              v-model="form.projeto" 
              label="Projeto Responsável" 
              placeholder="Selecione o projeto na lista..." 
              :opcoes="projetosFormatados" 
              itemValue="codigo" 
              itemLabel="label" 
              required 
            />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando && (Number(form.ativo) === 1 || form.ativo === true)" 
          :carregandoGravar="carregandoGravacao"
          labelExcluir="Inativar"
          iconeExcluir="fa7-solid:user-slash"
          @voltar="voltarParaLista"
          @excluir="abrirModalExclusao"
          @limpar="limparFormulario"
        />
      </form>
    </AppCartaoFormulario>

    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Inativação" 
      icon="fa7-solid:user-slash"
      tamanho="sm"
      rodapeEntre
      semScroll
      @close="fecharModal"
    >
      <div class="flex flex-col items-center py-2 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:user-lock" class="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Inativar Funcionário
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Você está prestes a tornar <strong class="text-gray-800 dark:text-gray-200">{{ form.nomeCompleto }}</strong> inativo. Ele não aparecerá mais nas listagens principais.
        </p>
        
        <AppCampoObrigatorio class="mt-8">
          O registro permanecerá no histórico
        </AppCampoObrigatorio>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="fecharModal">
          Cancelar
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:user-slash" :carregando="carregandoExclusao" @click="excluirRegistro">
          Sim, Inativar
        </AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, carregandoGravacao, carregandoExclusao, modalExclusaoAberto, form, editando,
  projetosAtivos, carregarProjetos, carregarDados, voltarParaLista, limparFormulario,
    abrirModalExclusao, fecharModal, gravarRegistro, excluirRegistro,
    cpfInvalido, emailInvalido, projetosFormatados
} = useFuncionarioFormulario()

onMounted(() => { 
  carregarProjetos()
  carregarDados() 
})

// Refs para Focus
const nomeCompletoRef = ref<any>(null)
const cpfRef = ref<any>(null)
const matriculaRef = ref<any>(null)
const emailRef = ref<any>(null)
const projetoRef = ref<any>(null)

const refsMap: any = {
  nomeCompleto: nomeCompletoRef,
  cpf: cpfRef,
  matricula: matriculaRef,
  email: emailRef,
  projeto: projetoRef
}

async function handleSubmit() {
  const result: any = await gravarRegistro()
  if (result && result.erro) {
    const component = refsMap[result.campo]
    if (component?.value) {
      component.value.focus()
    }
  }
}
</script>