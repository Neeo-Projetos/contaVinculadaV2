<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:upload" class="mr-2" />
        Importação de Contracheque
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input 
              v-model="form.ano" 
              v-maska data-maska="##/####" 
              placeholder="mm/aaaa" 
              type="text" 
              class="w-full border rounded-md p-2 pl-10 text-center" 
            />
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Arquivo TXT</label>
          <input 
            type="file" 
            @change="aoSelecionarArquivo" 
            accept=".txt" 
            class="w-full border rounded-md p-1.5" 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Última Importação</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input 
              v-model="ultimaImportacao" 
              type="text" 
              class="w-full border rounded-md p-2 pl-10 text-center bg-gray-100" 
              readonly 
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-4">
      <button @click="abrirModalInfo" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
        <span>Processamento</span>
        <Icon name="fa-solid:cogs" class="ml-2" />
      </button>
      
      <button @click="importarArquivo" :disabled="importando" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center disabled:opacity-50">
        <span>{{ importando ? 'Importando...' : 'Importar' }}</span>
        <Icon v-if="!importando" name="fa-solid:upload" class="ml-2" />
      </button>
    </div>

    <AppModal :isOpen="modalInfoAberto" title="Informações de Processamento" @close="modalInfoAberto = false">
      <div class="p-4 text-center">
        <h3 class="font-bold text-lg mb-4">SEGUE ABAIXO AS INFORMAÇÕES PARA REALIZAR O PROCESSAMENTO DE UM CONTRACHEQUE:</h3>
        
        <div class="my-6">
          <p class="text-green-600 font-bold text-xl mb-1">APROVAR</p>
          <p class="text-gray-800 font-semibold">Os contracheques selecionados<br> serão APROVADOS e processados.</p>
        </div>
        
        <div class="my-6">
          <p class="text-red-600 font-bold text-xl mb-1">REPROVAR</p>
          <p class="text-gray-800 font-semibold">Os contracheques selecionados<br> serão REPROVADOS e processados.</p>
        </div>

        <div class="mt-6 flex justify-center gap-4">
          <button @click="irParaProcessamento" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Ir para Processamento</button>
          <button @click="modalInfoAberto = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Fechar</button>
        </div>
      </div>
    </AppModal>

    <AppModal :isOpen="modalImportadosAberto" title="Atenção" @close="modalImportadosAberto = false">
      <div class="p-4 text-center">
        <p class="text-lg font-semibold mb-6">Importação realizada! Deseja processar os contracheques agora?</p>
        <div class="flex justify-center gap-4">
          <button @click="irParaProcessamento" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Sim</button>
          <button @click="modalImportadosAberto = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Não</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()

const form = ref({
  ano: ''
})
const arquivoSelecionado = ref<File | null>(null)
const ultimaImportacao = ref('')

const importando = ref(false)
const modalInfoAberto = ref(false)
const modalImportadosAberto = ref(false)

const carregarUltimaImportacao = async () => {
  try {
    const { data } = await $fetch<{ data: string }>('/api/operacao/contracheque/importacao/ultimaImportacao')
    ultimaImportacao.value = data || 'Nenhuma importação'
  } catch (error) {
    console.error('Erro ao buscar última importação:', error)
  }
}

const aoSelecionarArquivo = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    if (!file) return 

    if (file.size > 1048576) {
      alert('Atenção: O arquivo ultrapassou o valor máximo permitido (1MB).')
      target.value = ''
      arquivoSelecionado.value = null
      return
    }
    
    if (file.type !== 'text/plain') {
      alert('Atenção: Tipo de arquivo não suportado. Envie um arquivo TXT.')
      target.value = ''
      arquivoSelecionado.value = null
      return
    }

    arquivoSelecionado.value = file
  }
}

const importarArquivo = async () => {
  if (!form.value.ano) return alert('Informe o Mês/Ano.')
  if (!arquivoSelecionado.value) return alert('É necessário enviar um arquivo.')

  importando.value = true
  const formData = new FormData()
  formData.append('ano', form.value.ano)
  formData.append('arquivo', arquivoSelecionado.value)

  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/operacao/contracheque/importacao/upload', {
      method: 'POST',
      body: formData
    })

    if (res.status === 'success') {
      modalImportadosAberto.value = true
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao importar arquivo:', error)
    alert('Erro ao realizar a importação do arquivo.')
  } finally {
    importando.value = false
  }
}

const abrirModalInfo = () => modalInfoAberto.value = true

const irParaProcessamento = () => {
  modalInfoAberto.value = false
  modalImportadosAberto.value = false
  // Rota para a tela de processamento (ajuste o caminho conforme criar a tela)
  router.push('/operacao/contracheque/processamento') 
}

carregarUltimaImportacao()
</script>