<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Gestão de" 
      tituloGrosso="Usuários"
      descricao="Administração de acessos e permissões do sistema" 
      icone="fa7-solid:users-gear" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
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
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/usuario/cadastro')">
          Novo Usuário
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="filtrar">
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
