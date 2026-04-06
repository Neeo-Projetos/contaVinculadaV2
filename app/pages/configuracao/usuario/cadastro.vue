<template>
  <div class="min-h-full flex flex-col p-4 md:p-10 animate-fade-in">
    
    <AppTrilhaNavegacao 
      icone="fa7-solid:users-gear" 
      class="mb-8"
      :links="[{ label: 'Usuários', to: '/configuracao/usuario' }]"
      :paginaAtual="editando ? form.nomeUsuario || 'Editando Registro' : 'Novo Registro'"
    />

    <div class="mb-8">
      <AppPassosFormulario 
        :passos="['Dados Pessoais', 'Acesso', 'Projetos']" 
        :passoAtual="passoAtual - 1" 
        @mudar-passo="passoAtual = $event + 1"
      />
    </div>

    <AppCartaoFormulario class="py-10 px-8 sm:px-12 min-h-[400px]">
      <!-- Loader Customizado (Design Ouro) -->
      <Transition name="fade-blur">
        <div v-if="carregandoTela || salvando" class="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center rounded-[inherit] overflow-hidden pointer-events-none">
          <div class="absolute inset-0 bg-white/40 dark:bg-[#1a1c23]/60 backdrop-blur-xl transition-all duration-700"></div>
          
          <div class="relative flex flex-col items-center gap-6 animate-fade-in animate-zoom-in">
            <div class="relative w-20 h-20 flex items-center justify-center">
              <div class="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
              <div class="absolute inset-0 border-4 border-emerald-500/5 dark:border-emerald-400/5 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Icon name="fa7-solid:spinner" class="animate-spin text-emerald-600 dark:text-emerald-400 w-5 h-5" />
              </div>
            </div>

            <div class="flex flex-col items-center gap-2">
              <span class="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-[0.2em] uppercase opacity-80 animate-pulse">
                {{ salvando ? 'Gravando Alterações' : 'Recuperando Dados' }}
              </span>
              <div class="w-24 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-shimmer scale-x-[1.5]"></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <form v-if="!carregandoTela" @submit.prevent="avancarPasso" class="space-y-12 relative z-0">
        
        <!-- PASSO 1: DADOS PESSOAIS -->
        <div v-if="passoAtual === 1" class="animate-fade-in space-y-8">
            <AppFormularioSecao icone="fa7-solid:user-tag">
                DADOS PESSOAIS
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 items-end">
                <div class="md:col-span-8" :class="{ 'animate-shake': erros.has('nomeUsuario') }">
                    <AppInputTexto v-model="form.nomeUsuario" label="NOME COMPLETO" placeholder="Digite o nome do usuário..." required maxlength="60" icone="fa7-solid:user" />
                </div>
                
                <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('cpf') }">
                    <AppInputCpf v-model="form.cpf" label="CPF" required />
                </div>

                <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('email') }">
                    <AppInputEmail v-model="form.email" label="E-MAIL" required maxlength="50" />
                </div>

                <div class="md:col-span-6">
                    <AppInputTexto v-model="form.telefone" label="TELEFONE" placeholder="(00) 00000-0000" icone="fa7-solid:phone" v-maska="'(##) #####-####'" />
                </div>
            </div>
        </div>

        <!-- PASSO 2: ACESSO -->
        <div v-if="passoAtual === 2" class="animate-fade-in space-y-8">
            <AppFormularioSecao icone="fa7-solid:shield-halved">
                CONFIGURAÇÕES DE ACESSO
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 items-end">
                <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('login') }">
                    <AppInputTexto v-model="form.login" label="LOGIN (USERNAME)" placeholder="Digite o login de acesso..." required maxlength="100" icone="fa7-solid:id-badge" />
                </div>

                <div class="md:col-span-6">
                    <AppSelect 
                        v-model="form.restauraSenha" 
                        label="FORÇAR TROCA DE SENHA NO 1º ACESSO?" 
                        placeholder="Selecione..." 
                        :opcoes="[{codigo: 1, descricao: 'SIM, OBRIGATÓRIO'}, {codigo: 0, descricao: 'NÃO, MANTER ATUAL'}]" 
                        itemValue="codigo" 
                        itemLabel="descricao" 
                        required 
                    />
                </div>

                <div class="md:col-span-6" :class="{ 'animate-shake': erros.has('senha') }">
                    <div class="w-full relative">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            SENHA {{ editando ? '(OPCIONAL/ALTERAR)' : '*' }}
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Icon name="fa7-solid:lock" />
                            </div>
                            <input 
                                v-model="form.senha" 
                                :type="pwdVisible ? 'text' : 'password'" 
                                :required="!editando"
                                autocomplete="new-password"
                                placeholder="••••••••"
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl py-3 pl-11 pr-12 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 font-sans"
                            />
                            <button type="button" @click="pwdVisible = !pwdVisible" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors">
                                <Icon :name="pwdVisible ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-6">
                    <div class="w-full relative">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            CONFIRMAR NOVA SENHA
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Icon name="fa7-solid:lock" />
                            </div>
                            <input 
                                v-model="senhaConfirma" 
                                :type="pwdVisibleConf ? 'text' : 'password'" 
                                :required="!editando || !!form.senha"
                                autocomplete="new-password"
                                placeholder="••••••••"
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl py-3 pl-11 pr-12 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 font-sans"
                            />
                            <button type="button" @click="pwdVisibleConf = !pwdVisibleConf" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors">
                                <Icon :name="pwdVisibleConf ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PASSO 3: PROJETOS -->
        <div v-if="passoAtual === 3" class="animate-fade-in space-y-6 flex flex-col h-full">
            <div class="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h2 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                        <Icon name="fa7-solid:diagram-project" class="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                    </div>
                    PROJETOS ATRIBUÍDOS
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Selecione os projetos que este usuário poderá gerenciar.</p>
            </div>

            <!-- Barra de Controle -->
            <div class="flex flex-col sm:flex-row items-center gap-4 mb-2">
                <div class="flex-1 w-full">
                    <AppInputTexto 
                        v-model="filtroProjetos"
                        placeholder="Pesquisar por apelido ou descrição..."
                        icone="fa7-solid:magnifying-glass"
                        label=""
                        class="!mb-0"
                    />
                </div>

                <AppBotao 
                    :variacao="todosProjetosMarcados ? 'perigo' : 'sucesso'"
                    :icone="todosProjetosMarcados ? 'fa7-solid:xmark' : 'fa7-solid:check-double'" 
                    @click="marcarDesmarcarTodosProjetos"
                    class="!h-11 !px-6 !text-[10px] !rounded-xl shadow-sm w-full sm:w-auto uppercase font-black tracking-widest"
                >
                    {{ todosProjetosMarcados ? 'Desmarcar Todos' : 'Marcar Todos' }}
                </AppBotao>
                
                <span class="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    <Icon name="fa7-solid:list-check" class="text-emerald-500 w-3 h-3" />
                    {{ form.projetos.length }} selecionados
                </span>
            </div>

            <!-- Listagem Paginada - Removido o min-h fixo do container -->
            <div class="flex-1">
                <AppContainerListagem
                    :lista="projetosPaginados"
                    :carregando="carregandoTela"
                    :buscaRealizada="true"
                    :totalRegistros="projetosFiltrados.length"
                    :registroInicial="registroInicialProjetos"
                    :registroFinal="registroFinalProjetos"
                    :totalPaginas="totalPaginasProjetos"
                    :paginaAtual="paginaProjetos"
                    :itensPorPagina="itensPorPaginaProjetos"
                    :paginasExibidas="paginasExibidasProjetos"
                    class="mb-0"
                    @mudarPagina="mudarPaginaProjetos"
                    @mudarItensPorPagina="mudarItensPorPaginaProjetos"
                >
                    <template #cabecalho-tabela>
                        <th class="p-5 w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
                        <th class="p-5 text-gray-400 text-[10px] font-black uppercase tracking-widest">Projeto</th>
                        <th class="p-5 text-gray-400 hidden sm:table-cell text-[10px] font-black uppercase tracking-widest">Descrição</th>
                    </template>

                    <template #linhas-tabela="{ item }">
                        <td class="p-5 text-center cursor-pointer" @click.stop="alternarProjeto(item.codigo)">
                            <div class="flex items-center justify-center">
                                <AppCheckbox :modelValue="form.projetos.includes(item.codigo)" />
                            </div>
                        </td>
                        <td class="p-5">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 font-extrabold text-[11px] group-hover:scale-110 transition-transform">
                                    {{ item.apelido.charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-xs font-black text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">{{ item.apelido }}</span>
                                    <span class="text-[10px] font-bold text-gray-400 sm:hidden uppercase truncate max-w-[150px]">{{ item.descricao }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="p-5 hidden sm:table-cell text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                            {{ item.descricao }}
                        </td>
                    </template>
                </AppContainerListagem>
            </div>
            
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2 mt-2">
                <Icon name="fa7-solid:circle-info" class="w-3.5 h-3.5 text-emerald-500" />
                <span>Clique na linha para selecionar o projeto. Ao menos um é obrigatório.</span>
            </p>
        </div>

        <AppRodapeFormulario 
          :editando="editando && Number(form.ativo) === 1" 
          :carregandoGravar="salvando"
          :labelVoltar="passoAtual === 1 ? 'Retornar' : 'Anterior'"
          :labelGravar="passoAtual === totalPassos ? 'Finalizar Cadastro' : 'Continuar'"
          :iconeGravar="passoAtual === totalPassos ? 'fa7-solid:check-double' : 'fa7-solid:arrow-right'"
          labelExcluir="Inativar"
          iconeExcluir="fa7-solid:user-xmark"
          @voltar="voltarPasso"
          @excluir="modalExclusaoAberto = true"
          @limpar="limparFormulario"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modais Repetidos Omitidos Para Focar na Mudança de Layout -->
    <AppModal :isOpen="modalAlertaAberto" :title="modalAlertaTitulo" icon="fa7-solid:circle-exclamation" @close="fecharModalAlerta">
      <div class="p-6 text-center">
         <p class="text-base font-bold text-gray-700 dark:text-gray-200">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer><AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Entendi</AppBotao></template>
    </AppModal>

    <AppModal :isOpen="modalExclusaoAberto" title="Atenção: Inativação" icon="fa7-solid:user-xmark" tamanho="sm" rodapeEntre semScroll @close="modalExclusaoAberto = false">
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-22 h-22 bg-gradient-to-tr from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl"><Icon name="fa7-solid:user-slash" class="w-10 h-10 text-white" /></div>
        </div>
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter">Inativar Usuário?</h4>
        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px]">Deseja inativar o acesso de <strong class="text-gray-900 dark:text-gray-100">{{ form.nomeUsuario }}</strong>?</p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusaoAberto = false">Cancelar</AppBotao>
        <AppBotao variacao="perigo" icone="fa7-solid:user-slash" :carregando="carregandoExclusao" @click="excluirRegistro">Sim, inativar</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalSucessoAberto" title="Sucesso: Usuário Salvo" icon="fa7-solid:circle-check" semScroll @close="voltarParaLista">
      <div class="flex flex-col items-center py-6 text-center">
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div class="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl animate-success-pop"><Icon name="fa7-solid:check" class="w-12 h-12 text-white" /></div>
        </div>
        <h3 class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Sucesso!</h3>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-8">O usuário foi salvo corretamente.</p>
        <div class="w-full bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 text-left space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-[#1e2029] flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm"><Icon name="fa7-solid:user" class="text-gray-400" /></div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">Usuário</p>
              <p class="font-extrabold text-gray-800 dark:text-gray-200">{{ form.nomeUsuario }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer><AppBotao variacao="primario" @click="voltarParaLista" class="w-full h-14 text-lg rounded-2xl">Voltar para Listagem</AppBotao></template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const {
  carregandoTela, salvando, carregandoExclusao, modalExclusaoAberto, form, editando,
  senhaConfirma, projetosAtivos, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
  fecharModalAlerta, gravarRegistro, excluirRegistro, limparFormulario, voltarParaLista,
  passoAtual, totalPassos, avancarPasso, voltarPasso, modalSucessoAberto, erros,
  filtroProjetos, projetosPaginados, projetosFiltrados, paginaProjetos, 
  totalPaginasProjetos, itensPorPaginaProjetos, registroInicialProjetos,
  registroFinalProjetos, paginasExibidasProjetos, todosProjetosMarcados, 
  marcarDesmarcarTodosProjetos, mudarPaginaProjetos, mudarItensPorPaginaProjetos
} = useUsuarioFormulario()

const pwdVisible = ref(false)
const pwdVisibleConf = ref(false)

const alternarProjeto = (codigo: number) => {
    const index = form.projetos.indexOf(codigo)
    if (index > -1) form.projetos.splice(index, 1)
    else form.projetos.push(codigo)
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
.animate-shake :deep(input), .animate-shake :deep(select) { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
.animate-shimmer { animation: shimmer 2s infinite ease-in-out; }
.fade-blur-enter-active, .fade-blur-leave-active { transition: opacity 0.5s ease, backdrop-filter 0.5s ease; }
.fade-blur-enter-from, .fade-blur-leave-to { opacity: 0; backdrop-filter: blur(0px); }
.dark .animate-shake :deep(input) { background-color: rgba(239, 68, 68, 0.05) !important; }
</style>
