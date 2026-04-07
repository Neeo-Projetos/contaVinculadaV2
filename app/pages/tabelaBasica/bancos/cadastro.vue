<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:university" 
      :links="[{ label: 'Bancos', to: '/tabelaBasica/bancos' }]"
      :paginaAtual="ehEdicao ? form.nomeBanco || 'Editando Banco' : 'Novo Banco'"
    >
      <template #acoes>
        <AppBotao 
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
            <AppInputTexto v-model="form.codigoBanco" label="Código do Banco" placeholder="Ex: 001, 237, 341..." required maxlength="11" icone="fa7-solid:hashtag" />
          </div>
          <div class="md:col-span-8">
            <AppInputTexto v-model="form.nomeBanco" label="Nome da Instituição" placeholder="Digite o nome oficial do banco..." required icone="fa7-solid:signature" />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          labelExcluir="Excluir Banco"
          iconeExcluir="fa7-solid:trash-can"
          @voltar="voltar"
          @excluir="confirmarExclusao"
          @limpar="novo"
          @gravar="gravar"
        >
        </AppRodapeFormulario>
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Exclusão (Padrão) -->
    <AppModal 
      :isOpen="modalExclusao" 
      title="Atenção: Exclusão de Registro" 
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
          Remover Banco?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Esta ação é permanente. Ter certeza que deseja excluir <strong class="text-gray-800 dark:text-gray-200">{{ form.nomeBanco }}</strong> do sistema?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusao = false">
          Não, Cancelar
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
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const registroId = route.query.id as string
const ehEdicao = computed(() => registroId !== '0' && !!registroId)

const salvando = ref(false)
const carregandoDados = ref(false)
const modalExclusao = ref(false)

const modalAlertaAberto = ref(false)
const modalAlertaTitulo = ref('')
const modalAlertaMensagem = ref('')

const form = ref({
  codigo: registroId || '0',
  codigoBanco: '',
  nomeBanco: ''
})

const mostrarAlerta = (titulo: string, mensagem: string) => {
  modalAlertaTitulo.value = titulo
  modalAlertaMensagem.value = mensagem
  modalAlertaAberto.value = true
}

const buscarDados = async () => {
  if (ehEdicao.value) {
    carregandoDados.value = true
    try {
      const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/bancos/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        form.value.codigoBanco = data.codigoBanco
        form.value.nomeBanco = data.nomeBanco
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      carregandoDados.value = false
    }
  }
}

const gravar = async () => {
  if (!form.value.codigoBanco) return mostrarAlerta("Código Obrigatório", "Por favor, informe o código oficial do banco.")
  if (!form.value.nomeBanco) return mostrarAlerta("Nome Obrigatório", "Por favor, informe o nome da instituição bancária.")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/gravar', {
      method: 'POST',
      body: form.value
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Gravar", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao gravar dados:', error)
    mostrarAlerta("Erro Interno", "Houve uma falha ao tentar salvar os dados.")
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => modalExclusao.value = true

const excluir = async () => {
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/excluir', {
      method: 'POST',
      body: { codigo: form.value.codigo }
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Excluir", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao excluir:', error)
    mostrarAlerta("Erro Interno", "Falha de comunicação para excluir o registro.")
  } finally {
    modalExclusao.value = false
  }
}

const novo = () => {
  router.push('/tabelaBasica/bancos/cadastro?id=0')
  form.value = { codigo: '0', codigoBanco: '', nomeBanco: '' }
}

const voltar = () => router.push('/tabelaBasica/bancos')

onMounted(() => {
  buscarDados()
})
</script>