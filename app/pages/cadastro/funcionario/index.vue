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

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex flex-col gap-5 mb-2">
      
      <div class="flex flex-col xl:flex-row items-center justify-between gap-4">
        
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-1/2">
          
          <div class="relative w-full sm:flex-1">
            <Icon name="fa7-solid:magnifying-glass" class="absolute left-4 top-3.5 text-gray-400 w-4 h-4 z-10" />
            <input 
              v-model="filtro.nomeParam" 
              @input="buscarSugestoesNome"
              @focus="buscarSugestoesNome"
              @blur="fecharSugestoesDelay"
              @keyup.enter="buscarLista"
              type="text" 
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
              placeholder="Digite o nome do funcionário..." 
              autocomplete="off"
            />
            <Icon v-if="buscandoSugestoes" name="fa7-solid:spinner" class="animate-spin absolute right-4 top-3.5 text-emerald-500 w-4 h-4" />

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
                  <span class="text-sm">Nenhum nome encontrado.</span>
                </div>
              </div>
            </Transition>
          </div>

          <div class="w-full sm:w-44 shrink-0 relative">
            <select v-model="filtro.ativoParam" @change="buscarLista" class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer appearance-none">
              <option value="">Status: Todos</option>
              <option value="1">Status: Ativos</option>
              <option value="0">Status: Inativos</option>
            </select>
            <Icon name="fa7-solid:chevron-down" class="absolute right-4 top-4 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto shrink-0">
          
          <div class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button @click="visaoAtual = 'lista'" :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
              <Icon name="fa7-solid:list-ul" class="w-4 h-4" /> Lista
            </button>
            <button @click="visaoAtual = 'cards'" :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
              <Icon name="fa7-solid:border-all" class="w-4 h-4" /> Cards
            </button>
          </div>

          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

          <button @click="abrirModalExibicao" class="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
            <Icon name="fa7-solid:table-columns" class="w-4 h-4 opacity-70" /> Exibição
          </button>

          <button @click="abrirModalFiltroAvancado" class="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
            <Icon name="fa7-solid:filter" class="w-4 h-4 text-gray-500 dark:text-gray-400" /> Filtros Avançados
          </button>

        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <NuxtLink to="/cadastro/funcionario/cadastro" class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:user-plus" class="w-5 h-5" /> Novo Funcionário
        </NuxtLink>

        <button @click="buscarLista" class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:magnifying-glass" class="w-5 h-5" /> Pesquisar Funcionários
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
          Utilize a busca rápida ou os filtros para listar a base de funcionários.
        </p>
      </div>

      <div v-else-if="listaRegistros.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-gray-400 dark:text-gray-500">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
          <Icon name="fa7-solid:folder-open" class="w-8 h-8 opacity-50" />
        </div>
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">Nenhum resultado</h3>
        <p class="font-medium text-sm text-center">Nenhum funcionário encontrado com os filtros informados.</p>
      </div>

      <div v-else class="relative z-10 bg-gray-50/30 dark:bg-transparent">
        
        <div v-if="visaoAtual === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-4 sm:p-6">
          <div v-for="item in listaRegistros" :key="item.codigo" class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/60 rounded-2xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col gap-4">
            
            <div class="flex justify-between items-start gap-3">
              <NuxtLink :to="`/cadastro/funcionario/cadastro?codigo=${item.codigo}`" class="flex-1 group-hover:opacity-80 transition-opacity">
                <h3 class="font-extrabold text-lg text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{{ item.nomeCompleto }}</h3>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{{ item.projeto || 'Não Alocado' }}</span>
              </NuxtLink>
              
              <span v-if="item.ativo" class="shrink-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full text-xs font-bold">
                Ativo
              </span>
              <span v-else class="shrink-0 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2.5 py-1 rounded-full text-xs font-bold">
                Inativo
              </span>
            </div>

            <div class="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center"><Icon name="fa7-solid:address-card" class="w-4 h-4 opacity-70" /></div>
                <span class="font-medium">{{ item.cpf }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center"><Icon name="fa7-solid:id-badge" class="w-4 h-4 opacity-70" /></div>
                <span class="font-medium">{{ item.matricula }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center"><Icon name="fa7-solid:envelope" class="w-4 h-4 opacity-70" /></div>
                <span class="font-medium truncate" :title="item.email">{{ item.email || 'Sem e-mail' }}</span>
              </div>
            </div>

            <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button @click="abrirModalHistorico(item.codigo)" class="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all">
                <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" /> Ver Histórico
              </button>
            </div>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
              <tr>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome do Funcionário</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documento (CPF)</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matrícula</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projeto / Alocação</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50 bg-white dark:bg-[#1e2029]">
              <tr v-for="item in listaRegistros" :key="item.codigo" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                <td class="px-6 py-4">
                  <NuxtLink :to="`/cadastro/funcionario/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-transparent group-hover:border-emerald-300 transition-colors">
                      {{ item.nomeCompleto.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ item.nomeCompleto }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-500">{{ item.email }}</span>
                    </div>
                  </NuxtLink>
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
                <td class="px-6 py-4 text-center">
                  <button @click="abrirModalHistorico(item.codigo)" title="Ver Histórico" class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
                    <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <AppModalHistorico 
      :isOpen="modalHistoricoAberto" 
      titulo="Histórico do Funcionário"
      :historico="historicoSelecionado"
      @close="modalHistoricoAberto = false" 
    />
  </div>
</template>

<script setup lang="ts">

const {
  carregandoTela, buscaRealizada, listaRegistros, filtro,
  sugestoesNome, mostrandoSugestoes, buscandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay,
  destacarTexto, buscarLista, visaoAtual, abrirModalFiltroAvancado, 
  abrirModalExibicao,modalHistoricoAberto,historicoSelecionado,abrirModalHistorico
} = useFuncionarioListagem()
</script>