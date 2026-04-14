<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppBarraNavegacao 
      icone="fa7-solid:shield-halved" 
      :links="[{ label: 'Permissões', to: '/configuracao/permissaoUsuario' }]"
      :paginaAtual="editando ? 'Configurar Acessos: ' + (form.usuarioNome || '...') : 'Novo Acesso'"
    />

    <AppCartaoFormulario class="py-10 px-8 sm:px-12">
      <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Carregando..." />

      <form v-if="!carregandoTela" @submit.prevent="gravarRegistro" class="space-y-10 relative z-0">
        
        <AppFormularioSecao icone="fa7-solid:id-badge">
          Dados do Acesso
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('usuarioNome') }">
            <AppInputTexto 
              v-if="editando"
              v-model="form.usuarioNome" 
              label="Usuário Selecionado" 
              icone="fa7-solid:user" 
              :somenteLeitura="true"
              disabled
            />
            <AppInputAutocomplete 
              v-else
              v-model="form.codigo" 
              urlConsulta="/api/configuracao/permissaoUsuario/autocompleteLogin" 
              label="Selecionar Usuário a Configurar"
              icone="fa7-solid:user" 
              propId="id" 
              propDescricao="descricao" 
              placeholder="Busque pelo login..." 
              required 
              :somenteLeitura="modoVisualizar"
            />
          </div>
          <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('menuSelecionado') }">
            <AppSelect 
              v-model="form.menuSelecionado" 
              label="Escolha de Permissão por Menu" 
              :opcoes="menusDisponiveis" 
              itemValue="codigo"
              itemLabel="descricao"
              required
              :somenteLeitura="modoVisualizar"
            />
          </div>
        </div>

        <template v-if="form.menuSelecionado">
          <div class="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center justify-between">
            <div>
                <h2 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                    <Icon name="fa7-solid:list-check" class="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                </div>
                FUNCIONALIDADES DISPONÍVEIS
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">Configure os privilégios de acesso deste menu para o usuário.</p>
            </div>
            
            <div class="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all">
                <Icon name="fa7-solid:id-card-clip" class="text-emerald-500 w-3.5 h-3.5" />
                {{ form.permissoes.filter(p => p.marcado).length }} selecionadas
            </div>
          </div>

          <!-- Barra de Busca e Ações da Tabela -->
          <div class="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div class="flex-1 w-full">
                <AppInputTexto 
                    v-model="filtroFunc"
                    placeholder="Pesquisar funcionalidade..."
                    icone="fa7-solid:magnifying-glass"
                    label=""
                    class="!mb-0"
                />
            </div>

            <AppBotao 
                v-if="!modoVisualizar"
                :variacao="todosMarcados ? 'perigo' : 'padrao'"
                :icone="todosMarcados ? 'fa7-solid:xmark' : 'fa7-solid:check-double'" 
                @click.prevent="marcarDesmarcarTodos"
                class="!h-11 !px-6 !text-[10px] !rounded-xl shadow-sm w-full sm:w-auto uppercase font-black tracking-widest"
            >
                {{ todosMarcados ? 'Desmarcar Todas' : 'Marcar Todas' }}
            </AppBotao>
          </div>

          <!-- Tabela Premium Estilo Projetos -->
          <AppContainerListagem
            :lista="funcionalidadesPaginadas"
            :carregando="false"
            :buscaRealizada="true"
            :totalRegistros="funcionalidadesFiltradas.length"
            :registroInicial="registroInicialFunc"
            :registroFinal="registroFinalFunc"
            :totalPaginas="totalPaginasFunc"
            :paginaAtual="paginaFunc"
            :itensPorPagina="itensPorPaginaFunc"
            :paginasExibidas="paginasExibidasFunc"
            :view="false"
            :edit="false"
            class="mb-0 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
            @mudarPagina="paginaFunc = $event"
          >
            <template #cabecalho-tabela>
              <th class="p-5 w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
              <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">Funcionalidade</th>
            </template>

            <template #linhas-tabela="{ item }">
              <td class="p-5 text-center transition-colors" :class="{ 'cursor-pointer hover:bg-emerald-50/10': !modoVisualizar }" @click.stop="!modoVisualizar && (item.marcado = !item.marcado)">
                <div class="flex items-center justify-center">
                    <AppCheckbox :modelValue="item.marcado" :somenteLeitura="modoVisualizar" />
                </div>
              </td>
              <td class="p-5">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] group-hover:scale-110 transition-transform uppercase">
                        {{ (item.nomeCompleto || item.nome || 'F').charAt(0) }}
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 transition-colors truncate">
                            {{ item.nomeCompleto || item.nome }}
                        </span>
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter opacity-60">
                            {{ item.nome }}
                        </span>
                    </div>
                </div>
              </td>
            </template>
          </AppContainerListagem>

          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2 mt-4 opacity-70">
            <Icon name="fa7-solid:circle-info" class="text-emerald-500 w-4 h-4" />
            Clique em qualquer lugar da linha para selecionar a regra de acesso.
          </p>
        </template>

        <AppRodapeFormulario 
          :editando="editando" 
          :carregandoGravar="carregandoGravacao"
          :visualizar="modoVisualizar"
          labelGravar="Gravar Acessos"
          labelExcluir="Revogar Selecionadas"
          iconeExcluir="fa7-solid:trash-can"
          @voltar="voltarParaLista"
          @limpar="limparFormulario"
          @excluir="abrirModalExclusao"
          @editar="irParaEdicao"
        />
      </form>
    </AppCartaoFormulario>

    <AppModal :isOpen="modalExclusaoAberto" title="Atenção: Revogar Permissões" icon="fa7-solid:circle-exclamation" tamanho="sm" rodapeEntre semScroll @close="fecharModal">
      <div class="flex flex-col items-center py-2 text-center text-gray-900 dark:text-gray-100">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:shield-virus" class="w-10 h-10 text-white" />
          </div>
        </div>
        <h4 class="text-2xl font-black mb-3 mt-4">Revogar Acessos?</h4>
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          As funcionalidades marcadas serão indisponibilizadas para o usuário. Deseja prosseguir?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="fecharModal">Cancelar</AppBotao>
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" :carregando="carregandoExclusao" @click="excluirRegistro">Sim, Revogar</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalAlertaAberto" :title="modalAlertaTitulo" icon="fa7-solid:circle-exclamation" @close="fecharModalAlerta">
      <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
         <p class="text-base text-center font-medium">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer><AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Entendi</AppBotao></template>
    </AppModal>
    
    <AppModal :isOpen="modalSucessoAberto" title="Acessos Atualizados!" icon="fa7-solid:circle-check" @close="voltarParaLista">
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative w-22 h-22 bg-emerald-500 rounded-full flex items-center justify-center animate-success-pop mb-4 shadow-xl shadow-emerald-500/20">
            <Icon name="fa7-solid:check" class="w-12 h-12 text-white" />
        </div>
        <h4 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Gravado com sucesso!</h4>
        <p class="text-gray-500 dark:text-gray-400 mt-1">As regras de acesso foram atualizadas.</p>
      </div>
      <template #footer><AppBotao variacao="primario" @click="voltarParaLista" class="w-full !h-12 !rounded-xl uppercase font-black tracking-widest">Fechar e Sair</AppBotao></template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const {
  carregandoTela, carregandoGravacao, carregandoExclusao,
  modalExclusaoAberto, abrirModalExclusao, fecharModal,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta,
  modalSucessoAberto, editando, possuiMarcacao, modoVisualizar, todosMarcados,
  form, erros, menusDisponiveis,
  carregarDadosIniciais, buscarPermissoesDoMenu, marcarDesmarcarTodos,
  gravarRegistro, excluirRegistro, voltarParaLista, limparFormulario, irParaEdicao,
  filtroFunc, funcionalidadesPaginadas, funcionalidadesFiltradas, paginaFunc, 
  itensPorPaginaFunc, totalPaginasFunc, registroInicialFunc, registroFinalFunc, paginasExibidasFunc
} = usePermissaoUsuarioFormulario()

onMounted(() => {
  carregarDadosIniciais()
})
</script>