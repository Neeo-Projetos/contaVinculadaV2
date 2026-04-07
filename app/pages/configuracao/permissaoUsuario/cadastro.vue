<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
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
              v-model="form.usuarioId" 
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
              @change="buscarPermissoesDoMenu"
            />
          </div>
        </div>

        <template v-if="form.menuSelecionado">
          <AppFormularioSecao icone="fa7-solid:list-check">
            Funcionalidades Disponíveis
          </AppFormularioSecao>

          <div v-if="!modoVisualizar" class="flex items-center gap-4 mb-4">
            <AppBotao variacao="padrao" icone="fa7-solid:check-double" @click.prevent="marcarDesmarcarTodos">
              Marcar / Desmarcar Todos
            </AppBotao>
          </div>

          <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <table class="w-full text-left">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="p-4 w-16 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionalidade</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                <tr v-for="perm in form.permissoes" :key="perm.idFuncionalidade" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="p-4 flex justify-center">
                    <input type="checkbox" v-model="perm.marcado" :disabled="modoVisualizar" class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 dark:bg-gray-700 dark:border-gray-600" :class="modoVisualizar ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'" />
                  </td>
                  <td class="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ perm.nomeCompleto || perm.descricaoFuncionalidade }}
                  </td>
                </tr>
                <tr v-if="form.permissoes.length === 0">
                   <td colspan="2" class="p-6 text-center text-gray-400 dark:text-gray-500 italic">Nenhuma funcionalidade atrelada a este menu.</td>
                </tr>
              </tbody>
            </table>
          </div>
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
        >
          <template #extra-acoes-direita v-if="modoVisualizar">
            <AppBotao variacao="primario" icone="fa7-solid:pencil" @click="irParaEdicao">
              Editar
            </AppBotao>
          </template>
        </AppRodapeFormulario>
      </form>
    </AppCartaoFormulario>

    <AppModal :isOpen="modalExclusaoAberto" title="Atenção: Revogar Permissões" icon="fa7-solid:circle-exclamation" tamanho="sm" rodapeEntre semScroll @close="fecharModal">
      <div class="flex flex-col items-center py-2 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:shield-virus" class="w-10 h-10 text-white" />
          </div>
        </div>
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3 mt-4">Revogar Acessos?</h4>
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          As funcionalidades selecionadas serão indisponibilizadas permanentemente para o usuário neste menu. Deseja prosseguir?
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
        <div class="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center animate-success-pop mb-4 shadow-lg shadow-emerald-500/30">
            <Icon name="fa7-solid:check" class="w-10 h-10 text-white" />
        </div>
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">Gravado com sucesso!</h4>
      </div>
      <template #footer><AppBotao variacao="primario" @click="voltarParaLista" class="w-full">Voltar p/ Listagem</AppBotao></template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const {
  carregandoTela, carregandoGravacao, carregandoExclusao,
  modalExclusaoAberto, abrirModalExclusao, fecharModal,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta,
  modalSucessoAberto, editando, possuiMarcacao, modoVisualizar,
  form, erros, menusDisponiveis,
  carregarDadosIniciais, buscarPermissoesDoMenu, marcarDesmarcarTodos,
  gravarRegistro, excluirRegistro, voltarParaLista, limparFormulario, irParaEdicao
} = usePermissaoUsuarioFormulario()

onMounted(() => {
  carregarDadosIniciais()
})
</script>