<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Gestão de" tituloGrosso="Usuários"
      descricao="Gerenciamento de acessos e permissões do sistema" icone="fa7-solid:user-gear" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <AppInputTexto v-model="filtro.nome" label="USUÁRIO" placeholder="Buscar por usuário..." icone="fa7-solid:magnifying-glass"
          @enter="buscarLista" />
        <AppSelecaoStatus v-model="filtro.ativo" label="STATUS" />
      </template>

      <template #acoes-principais>
        <AppBotao variacao="acao" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/usuario/cadastro')">
          Novo Usuário
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

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
        <th scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Usuário</th>
        <th scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Login</th>
        <th scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
        <th scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="p-4">
          <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
              {{ item.nome.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-500 transition-colors uppercase">
              {{ item.nome }}
            </span>
          </NuxtLink>
        </td>
        <td class="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 italic">
          {{ item.login }}
        </td>
        <td class="p-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
        <td class="p-4 text-center text-center">
          <div class="flex items-center justify-center">
            <button @click="verHistorico" 
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Histórico">
              <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nome" :subtituloNome="'Login'" :subtituloValor="item.login" :ativo="item.ativo"
          :mostrarStatus="true" @ver-detalhes="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)"
          @clique-titulo="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, filtro, buscarLista, filtrar,
  dados, paginaAtual, itensPorPagina, totalRegistros, totalPaginas,
  registroInicial, registroFinal, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useUsuarioListagem()

const verHistorico = () => {
    alert('📜 Ver Histórico...')
}
</script>
