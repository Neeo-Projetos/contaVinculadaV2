<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <div class="relative overflow-hidden rounded-3xl shadow-sm bg-gradient-to-br from-[#22262e] to-[#2c3e50] dark:from-[#1a1c23] dark:to-[#0f172a] p-6 sm:p-8 border border-gray-200/10 dark:border-gray-800">
      <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 blur-sm pointer-events-none"></div>
      <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-[#a8cf45]/10 blur-sm pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col gap-1">
        <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
            <Icon name="fa7-solid:users" class="w-6 h-6 text-emerald-400" />
          </div>
          Base de <span class="text-emerald-400 drop-shadow-md">Funcionários</span>
        </h2>
        <p class="text-gray-400 text-sm md:text-base font-medium flex items-center gap-2 mt-1 sm:ml-16">
          Gestão e listagem de colaboradores do sistema
        </p>
      </div>
    </div>

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
          <Icon name="fa7-solid:filter" class="text-gray-500 dark:text-gray-400 w-4 h-4" />
        </div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Filtros de Pesquisa</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div class="lg:col-span-2 relative">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
          <div class="relative">
            <input 
              v-model="filtro.nomeParam" 
              @input="buscarSugestoesNome"
              @focus="buscarSugestoesNome"
              @blur="fecharSugestoesDelay"
              type="text" 
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
              placeholder="Buscar por nome..." 
              autocomplete="off"
            />
            <Icon v-if="buscandoSugestoes" name="fa7-solid:spinner" class="animate-spin absolute right-4 top-3.5 text-emerald-500 w-5 h-5" />
          </div>

          <Transition name="dropdown">
            <div v-if="mostrandoSugestoes" class="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl max-h-64 overflow-y-auto scrollbar-custom backdrop-blur-xl">
              <ul v-if="sugestoesNome.length > 0" class="py-1.5">
                <li 
                  v-for="sugestao in sugestoesNome" 
                  :key="sugestao.id" 
                  @mousedown.prevent="selecionarSugestao(sugestao)"
                  class="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800/50 last:border-0 group"
                >
                  <Icon name="fa7-solid:magnifying-glass" class="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400" v-html="destacarTexto(sugestao.descricao, filtro.nomeParam)"></span>
                </li>
              </ul>
              <div v-else-if="!buscandoSugestoes && filtro.nomeParam.length >= 3" class="p-6 text-center flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Icon name="fa7-solid:face-frown-open" class="w-6 h-6 opacity-50" />
                </div>
                <span class="text-sm">Nenhum nome encontrado para "<b class="text-gray-700 dark:text-gray-200">{{ filtro.nomeParam }}</b>"</span>
              </div>
            </div>
          </Transition>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">CPF</label>
          <input v-model="filtro.cpfParam" v-maska data-maska="###.###.###-##" type="text" class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" placeholder="___.___.___-__" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Matrícula</label>
          <input v-model="filtro.matriculaParam" type="text" class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" placeholder="Nº da matrícula" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
          <select v-model="filtro.ativoParam" class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
            <option value="" class="dark:bg-gray-800">Todos</option>
            <option value="1" class="dark:bg-gray-800">Ativo</option>
            <option value="0" class="dark:bg-gray-800">Inativo</option>
          </select>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        
        <NuxtLink to="/cadastro/funcionario/cadastro" class="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm">
          <Icon name="fa7-solid:user-plus" class="w-5 h-5" />
          Novo Funcionário
        </NuxtLink>

        <button @click="buscarLista" :disabled="carregandoTela" class="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
          <Icon v-if="carregandoTela" name="fa7-solid:spinner" class="animate-spin w-5 h-5" />
          <Icon v-else name="fa7-solid:magnifying-glass" class="w-5 h-5" />
          Pesquisar Funcionários
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col relative min-h-[300px] mb-6">
      
      <div v-if="carregandoTela" class="absolute inset-0 z-30 bg-white/70 dark:bg-[#1e2029]/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all duration-300">
        <Icon name="fa7-solid:spinner" class="animate-spin w-12 h-12 mb-4" />
        <span class="font-bold tracking-wide">Buscando informações...</span>
      </div>
      
      <div v-if="!buscaRealizada" class="flex flex-col items-center justify-center py-16 px-6 text-gray-400 dark:text-gray-500">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
          <Icon name="fa7-solid:magnifying-glass" class="w-8 h-8 opacity-70 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">Pronto para buscar</h3>
        <p class="font-medium text-sm text-center max-w-sm">
          Utilize os filtros acima e clique em <span class="font-bold text-gray-600 dark:text-gray-400">"Pesquisar Funcionários"</span> para listar a base.
        </p>
      </div>

      <div v-else-if="listaRegistros.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-gray-400 dark:text-gray-500">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
          <Icon name="fa7-solid:folder-open" class="w-8 h-8 opacity-50" />
        </div>
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">Nenhum resultado</h3>
        <p class="font-medium text-sm text-center">Nenhum funcionário encontrado com os filtros informados.</p>
      </div>

      <div v-else class="overflow-x-auto relative z-10">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
            <tr>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome do Funcionário</th>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documento (CPF)</th>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matrícula</th>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projeto / Alocação</th>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
            <tr v-for="item in listaRegistros" :key="item.codigo" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {{ item.nomeCompleto.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ item.nomeCompleto }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-500">{{ item.email }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{{ item.cpf }}</td>
              <td class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{{ item.matricula }}</td>
              <td class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">
                <span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-semibold">{{ item.projeto || 'Não Alocado' }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="item.ativo" class="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full text-xs font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                </span>
                <span v-else class="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-3 py-1 rounded-full text-xs font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inativo
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink :to="`/cadastro/funcionario/cadastro?codigo=${item.codigo}`" class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
                  <Icon name="fa7-solid:pen" class="w-4 h-4" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const carregandoTela = ref(false)
const buscaRealizada = ref(false)
const listaRegistros = ref<any[]>([])

const filtro = reactive({
  nomeParam: '',
  cpfParam: '',
  matriculaParam: '',
  emailParam: '',
  projetoParam: '',
  ativoParam: '1'
})

const sugestoesNome = ref<any[]>([])
const mostrandoSugestoes = ref(false)
const buscandoSugestoes = ref(false)
let timerDebounce: ReturnType<typeof setTimeout>

const buscarSugestoesNome = () => {
  const texto = filtro.nomeParam
  
  if (texto.length < 3) {
    sugestoesNome.value = []
    mostrandoSugestoes.value = false
    return
  }

  clearTimeout(timerDebounce)
  
  timerDebounce = setTimeout(async () => {
    buscandoSugestoes.value = true
    mostrandoSugestoes.value = true
    
    try {
      const resposta = await $fetch<any>(`/api/cadastro/funcionario/autocomplete?q=${texto}`)
      sugestoesNome.value = resposta?.data || [] 
    } catch (e) {
      console.error('Erro no autocomplete:', e)
    } finally {
      buscandoSugestoes.value = false
    }
  }, 400) 
}

const selecionarSugestao = (sugestao: any) => {
  filtro.nomeParam = sugestao.descricao
  mostrandoSugestoes.value = false
  
  buscarLista()
}

const fecharSugestoesDelay = () => {
  setTimeout(() => {
    mostrandoSugestoes.value = false
  }, 200)
}

const buscarLista = async () => {
  carregandoTela.value = true
  buscaRealizada.value = true
  try {
    const data = await $fetch<any>('/api/cadastro/funcionario/listagem', {
      method: 'POST',
      body: filtro
    })
    listaRegistros.value = data?.results || []
  } catch (err: any) {
    console.error(err)
  } finally {
    carregandoTela.value = false
  }
}

const destacarTexto = (texto: string, busca: string) => {
  if (!busca) return texto
  const regex = new RegExp(`(${busca})`, 'gi')
  return texto.replace(regex, '<span class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</span>')
}
</script>

<style scoped src="./index.style.css"></style>