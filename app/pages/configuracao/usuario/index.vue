<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Gestão de" 
      tituloGrosso="Usuários"
      descricao="Administração de acessos e permissões do sistema" 
      icone="fa7-solid:users-gear" 
    />

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-3">
          <AppInputTexto 
            v-model="filtro.login" 
            label="Login" 
            placeholder="Digite o login..." 
            icone="fa7-solid:user"
          />
        </div>
        <div class="md:col-span-4">
          <AppInputTexto 
            v-model="filtro.nome" 
            label="Nome do Usuário" 
            placeholder="Digite o nome..." 
            icone="fa7-solid:user-tag"
          />
        </div>
        <div class="md:col-span-3">
          <AppInputCpf 
            v-model="filtro.cpf" 
            label="CPF" 
          />
        </div>
        <div class="md:col-span-2">
          <AppSelecaoStatus v-model="filtro.ativo" />
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <AppBotao variacao="primario" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/usuario/cadastro')">
          Novo Usuário
        </AppBotao>
        
        <div class="flex items-center gap-3">
          <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
          <div class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button @click="visaoAtual = 'lista'"
              :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center">
              <Icon name="fa7-solid:list-ul" class="w-4 h-4" />
            </button>
            <button @click="visaoAtual = 'cards'"
              :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center">
              <Icon name="fa7-solid:border-all" class="w-4 h-4" />
            </button>
          </div>
          <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="filtrar">
            Pesquisar
          </AppBotao>
        </div>
      </div>
    </div>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="buscaRealizada" 
      :lista="dados || []"
      :visaoAtual="visaoAtual" 
      :registroInicial="registroInicial" 
      :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" 
      :itensPorPagina="itensPorPagina" 
      :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" 
      :paginasExibidas="paginasExibidas" 
      @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina"
    >
      <template #cabecalho-tabela>
        <th v-if="colunas.login" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Login</th>
        <th v-if="colunas.nome" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome do Usuário</th>
        <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPF</th>
        <th v-if="colunas.status" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.login" class="px-6 py-4">
          <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}`" class="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all">
            {{ item.login }}
          </NuxtLink>
        </td>
        <td v-if="colunas.nome" class="px-6 py-4">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.nomeUsuario }}</span>
        </td>
        <td v-if="colunas.cpf" class="px-6 py-4">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ item.cpf }}</span>
        </td>
        <td v-if="colunas.status" class="px-6 py-4 text-center">
          <AppAtivo :ativo="Number(item.ativo) === 1 || item.ativo === true" />
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Editar">
              <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.nomeUsuario" 
          :subtituloNome="item.login" 
          :subtituloValor="item.email || ''"
          :ativo="Number(item.ativo) === 1 || item.ativo === true"
          :detalhes="[
            { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
          ]" 
          @ver-detalhes="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)" 
          @clique-titulo="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)" 
        />
      </template>
    </AppContainerListagem>

    <AppModalExibicao 
      :aberto="modalExibicaoAberto" 
      :colunas="colunasTemp" 
      :labels="labels" 
      @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" 
    />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  filtrar, placeholderDinamico,
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useUsuarioListagem()
</script>
