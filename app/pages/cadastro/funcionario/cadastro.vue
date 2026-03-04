<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <div class="flex items-center gap-2 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:px-6 shadow-sm text-gray-500 dark:text-gray-400 font-medium text-sm">
      <Icon name="fa7-solid:users" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span class="mx-1">/</span>
      <NuxtLink to="/cadastro/funcionario" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap">Funcionários</NuxtLink>
      <span class="mx-1">/</span>
      <span class="text-gray-800 dark:text-gray-200 font-bold px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md truncate">
        {{ editando ? form.nomeCompleto || 'Editando Registro' : 'Novo Registro' }}
      </span>
    </div>

    <div class="flex-1 bg-white dark:bg-[#1e2029] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
      
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>

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
          <div class="md:col-span-4">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Nome Completo <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.nomeCompleto" 
              type="text" 
              required
              maxlength="60"
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
              placeholder="Digite o nome..." 
            />
          </div>
          
          <div class="md:col-span-3">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              CPF <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Icon name="fa7-solid:id-card" />
              </div>
              <input 
                v-model="form.cpf" 
                v-maska data-maska="###.###.###-##"
                type="text" 
                required
                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl pl-11 pr-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
                placeholder="___.___.___-__" 
              />
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Matrícula <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.matricula" 
              type="text" 
              required
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
              placeholder="Ex: 12345"
            />
          </div>

          <div class="md:col-span-3">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Icon name="fa7-solid:at" />
              </div>
              <input 
                v-model="form.email" 
                type="email" 
                required
                maxlength="50"
                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl pl-11 pr-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
                placeholder="email@exemplo.com" 
              />
            </div>
          </div>

          <div class="md:col-span-12">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Projeto Responsável <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.projeto" 
              required
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled class="dark:bg-gray-800">Selecione um projeto na lista...</option>
              <option v-for="p in projetosAtivos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">
                {{ p.apelido }} - {{ p.descricao }}
              </option>
            </select>
          </div>
        </div>

        <div class="pt-6 mt-8 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              @click="voltarParaLista"
              class="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:arrow-left" class="w-4 h-4 text-gray-400" />
              Voltar
            </button>

            <button 
              v-if="editando" 
              type="button" 
              @click="abrirModalExclusao"
              class="w-full sm:w-auto bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/50 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:trash-can" class="w-4 h-4" />
              Excluir
            </button>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              type="button" 
              @click="limparFormulario"
              class="w-full sm:w-auto text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:file" class="w-4 h-4 text-gray-400" />
              Limpar / Novo
            </button>
            <button 
              type="submit" 
              :disabled="carregandoGravacao"
              class="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <Icon v-if="carregandoGravacao" name="fa7-solid:spinner" class="animate-spin w-5 h-5" />
              <Icon v-else name="fa7-solid:floppy-disk" class="w-5 h-5" />
              Gravar Dados
            </button>
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
        <button @click="fecharModal" class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold rounded-xl transition-all shadow-sm">
          Cancelar
        </button>
        <button @click="excluirRegistro" :disabled="carregandoExclusao" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
          <Icon v-if="carregandoExclusao" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
          <Icon v-else name="fa7-solid:trash" class="w-4 h-4" />
          Sim, Excluir
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const codigoRaw = route.query.codigo

const carregandoTela = ref(false)
const carregandoGravacao = ref(false)
const carregandoExclusao = ref(false)
const modalExclusaoAberto = ref(false)

const form = reactive({
  codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
  nomeCompleto: '',
  cpf: '',
  matricula: '',
  email: '',
  projeto: ''
})

const editando = computed(() => !!form.codigo)
const projetosAtivos = ref<any[]>([])

const carregarProjetos = async () => {
  try {
    const data = await $fetch<any>('/api/cadastro/projeto/ativos')
    projetosAtivos.value = data?.data || []
  } catch (e) { console.error(e) }
}

const carregarDados = async () => {
  if (form.codigo) {
    carregandoTela.value = true
    try {
      const data = await $fetch<any>(`/api/cadastro/funcionario/recupera?codigo=${form.codigo}`)
      if (data && data.status === 'success') {
        const d = data.data
        form.nomeCompleto = d.nomeCompleto
        form.cpf = d.cpf
        form.matricula = d.matricula
        form.email = d.email
        form.projeto = d.projeto
      } else {
        alert(data?.mensagem || 'Erro ao carregar dados.')
      }
    } catch (e) { console.error(e) } finally { carregandoTela.value = false }
  }
}

const voltarParaLista = () => {
  router.push('/cadastro/funcionario')
}

const limparFormulario = () => {
  router.push('/cadastro/funcionario/cadastro')
  form.codigo = 0
  form.nomeCompleto = ''
  form.cpf = ''
  form.matricula = ''
  form.email = ''
  form.projeto = ''
}

const abrirModalExclusao = () => { 
  modalExclusaoAberto.value = true 
}

const fecharModal = () => {
  modalExclusaoAberto.value = false
}

const gravarRegistro = async () => {
  carregandoGravacao.value = true
  try {
    const data = await $fetch<any>('/api/cadastro/funcionario/gravar', { method: 'POST', body: form })
    if (data.status === 'success') {
      alert('Operação realizada com sucesso!')
      voltarParaLista()
    } else { alert(data.mensagem || 'Erro desconhecido.') }
  } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao gravar') } finally { carregandoGravacao.value = false }
}

const excluirRegistro = async () => {
  carregandoExclusao.value = true
  try {
    const data = await $fetch<any>('/api/cadastro/funcionario/excluir', { method: 'POST', body: { codigo: form.codigo } })
    if (data.status === 'success') { 
      alert(data.mensagem)
      voltarParaLista() 
    }
    else { alert(data.mensagem) }
  } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao excluir') } finally { 
    carregandoExclusao.value = false
    fecharModal() 
  }
}

onMounted(() => { 
  carregarProjetos()
  carregarDados() 
})
</script>

<style scoped src="./cadastro.style.css"></style>