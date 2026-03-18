<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Parâmetros de" 
      tituloGrosso="Ofício"
      descricao="Gerencie a redação padrão e variáveis dos ofícios gerados pelo sistema" 
      icone="fa7-solid:file-signature" 
    />

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-12">
          <AppInputTexto 
            v-model="filtro.projetoNome" 
            label="Buscar por Projeto" 
            placeholder="Digite o nome do projeto para filtrar..." 
            icone="fa7-solid:magnifying-glass"
          />
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            <AppBotao variacao="primario" icone="fa7-solid:plus" @click="navigateTo('/configuracao/parametros/oficio/cadastro?id=0')">
                Novo Registro
            </AppBotao>
            <AppBotao variacao="padrao" icone="fa7-solid:pen-nib" @click="abrirModalPadrao">
                Redação Padrão
            </AppBotao>
        </div>
        
        <div class="flex items-center gap-3">
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
          <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
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
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projeto</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <NuxtLink :to="`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`" class="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all">
            {{ item.apelido }} - {{ item.projeto }}
          </NuxtLink>
        </td>
        <td class="px-6 py-4 text-center">
          <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Ver Histórico">
            <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <NuxtLink :to="`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Editar">
              <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.apelido" 
          :subtituloNome="item.projeto" 
          :subtituloValor="`Cód: ${item.codigo}`"
          :ativo="true"
          :detalhes="[
            { icone: 'fa7-solid:calendar-lines', texto: 'Personalizado por Projeto' }
          ]" 
          @ver-detalhes="navigateTo(`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`)" 
          @clique-titulo="navigateTo(`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`)" 
        >
            <template #actions-extra>
                <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors border border-gray-100 dark:border-gray-800" title="Histórico">
                    <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
                </button>
            </template>
        </AppCardListagem>
      </template>
    </AppContainerListagem>

    <!-- Modal Redação Padrão -->
    <AppModal :isOpen="modalPadraoAberto" title="Editar Redação Padrão" icon="fa7-solid:pen-nib" tamanho="4xl" @close="modalPadraoAberto = false">
        <div class="p-2 lg:p-4 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-emerald-50/30 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <div>
                    <AppSelect 
                        v-model="padrao.tipoSaldo" 
                        label="Modelo de Referência" 
                        placeholder="Selecione o modelo..." 
                        :opcoes="[{codigo: '0', descricao: 'Sem Saldo (Lista Simples)'}, {codigo: '1', descricao: 'Com Saldo (Cita Valores)'}]" 
                        itemValue="codigo" 
                        itemLabel="descricao"
                        required 
                        @change="carregarModeloPadrao"
                    />
                </div>
                <div class="text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-2 bg-white dark:bg-gray-900/50 p-3 rounded-xl border border-emerald-500/20 shadow-sm">
                    <Icon name="fa7-solid:info-circle" class="w-5 h-5 shrink-0 mt-0.5" />
                    <p class="font-medium leading-relaxed">Este texto servirá como base automática ao cadastrar novos parâmetros para projetos.</p>
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icon name="fa7-solid:tags" class="w-3 h-3 text-emerald-500" />
                    Variáveis Dinâmicas (Clique para Copiar)
                </label>
                <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[11px]">
                    <div v-for="(variavel, idx) in variaveis" :key="idx" 
                         @click="copiarVariavel(variavel.codigo)"
                         class="group cursor-pointer bg-white dark:bg-[#1e2029] border border-gray-100 dark:border-gray-800 rounded-xl p-2.5 flex flex-col gap-1 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 transition-all">
                        <code class="text-emerald-600 dark:text-emerald-400 font-bold font-mono tracking-tight group-hover:scale-105 transition-transform">{{ variavel.codigo }}</code>
                        <span class="text-gray-500 dark:text-gray-400 font-medium truncate">{{ variavel.desc }}</span>
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icon name="fa7-solid:align-left" class="w-3 h-3 text-emerald-500" />
                    Conteúdo da Redação
                </label>
                <textarea 
                    v-model="padrao.texto" 
                    rows="12" 
                    class="w-full bg-white dark:bg-[#1e2029] border border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-serif"
                    placeholder="Inicie a redação do ofício padrão...">
                </textarea>
            </div>
        </div>

        <template #footer>
            <div class="flex gap-3 justify-end w-full">
                <AppBotao variacao="padrao" @click="modalPadraoAberto = false" class="px-8">Cancelar</AppBotao>
                <AppBotao variacao="primario" :carregando="salvandoPadrao" @click="gravarModeloPadrao" class="px-8">Gravar Redação</AppBotao>
            </div>
        </template>
    </AppModal>

    <!-- Modal Histórico -->
    <AppModal :isOpen="modalHistoricoAberto" title="Histórico de Alterações" icon="fa7-solid:clock-rotate-left" tamanho="xl" @close="modalHistoricoAberto = false">
      <div class="max-h-[500px] overflow-y-auto p-4 space-y-4">
        <div v-for="hist in historicoData" :key="hist.codigo" class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div class="bg-white dark:bg-[#1e2029] px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Icon name="fa7-solid:user-pen" class="w-4 h-4" />
                </div>
                <div>
                    <h5 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{{ hist.usuarioAlteracao }}</h5>
                    <p class="text-[10px] text-gray-500 font-bold">{{ hist.dataAlteracao }}</p>
                </div>
            </div>
          </div>
          <div class="p-4 space-y-2">
            <div v-for="(alt, idx) in hist.alteracoes" :key="idx" class="text-xs text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-100/50 dark:border-gray-800/50" v-html="alt"></div>
          </div>
        </div>
        <div v-if="historicoData.length === 0" class="py-12 text-center text-gray-400">
            <Icon name="fa7-solid:folder-open" class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p class="text-xs font-black uppercase tracking-widest">Nenhum histórico encontrado</p>
        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarLista, modalHistoricoAberto, historicoData, abrirHistorico,
  modalPadraoAberto, salvandoPadrao, padrao, variaveis, carregarModeloPadrao, abrirModalPadrao, gravarModeloPadrao, copiarVariavel,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useParametrosOficioListagem()
</script>