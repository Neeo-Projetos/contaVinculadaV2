<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:users-gear" 
      :links="[{ label: 'Usuários', to: '/configuracao/usuario' }]"
      :paginaAtual="editando ? form.nomeUsuario || 'Editando Registro' : 'Novo Registro'"
    />

    <div class="mb-2">
      <AppPassosFormulario 
        :passos="['Dados Pessoais', 'Dados de Acesso', 'Projetos Vinculados']" 
        :passoAtual="passoAtual - 1" 
      />
    </div>

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela || salvando" :mensagem="salvando ? 'Gravando dados...' : 'Carregando informações...'" />

      <form v-if="!carregandoTela" @submit.prevent="avancarPasso" class="space-y-12 relative z-0">
        
        <!-- PASSO 1: DADOS PESSOAIS -->
        <div v-if="passoAtual === 1" class="animate-fade-in space-y-8">
            <AppFormularioSecao icone="fa7-solid:user-tag">
                Dados Pessoais
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
                <div class="md:col-span-8">
                    <AppInputTexto v-model="form.nomeUsuario" label="Nome Completo" placeholder="Digite o nome do usuário..." required maxlength="60" icone="fa7-solid:user" />
                </div>
                
                <div class="md:col-span-4">
                    <AppInputCpf v-model="form.cpf" required />
                </div>

                <div class="md:col-span-6">
                    <AppInputEmail v-model="form.email" required maxlength="50" />
                </div>

                <div class="md:col-span-6">
                    <AppInputTexto v-model="form.telefone" label="Telefone" placeholder="(00) 00000-0000" icone="fa7-solid:phone" v-maska="'(##) #####-####'" />
                </div>
            </div>
        </div>

        <!-- PASSO 2: ACESSO -->
        <div v-if="passoAtual === 2" class="animate-fade-in space-y-8">
            <AppFormularioSecao icone="fa7-solid:shield-halved">
                Configurações de Acesso
            </AppFormularioSecao>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
                <div class="md:col-span-6">
                    <AppInputTexto v-model="form.login" label="Login (Username)" placeholder="Digite o login de acesso..." required maxlength="100" icone="fa7-solid:id-badge" />
                </div>

                <div class="md:col-span-6">
                    <AppSelect 
                        v-model="form.restauraSenha" 
                        label="Forçar Troca de Senha no 1º Acesso?" 
                        placeholder="Selecione..." 
                        :opcoes="[{codigo: 1, descricao: 'Sim, obrigatório'}, {codigo: 0, descricao: 'Não, manter atual'}]" 
                        itemValue="codigo" 
                        itemLabel="descricao" 
                        required 
                    />
                </div>

                <div class="md:col-span-6">
                    <div class="w-full relative">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Senha {{ editando ? '(Opcional/Alterar)' : '*' }}
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
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl py-3 pl-11 pr-12 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400"
                            />
                            <button type="button" @click="pwdVisible = !pwdVisible" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors">
                                <Icon :name="pwdVisible ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-6">
                    <div class="w-full relative">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Confirmar Nova Senha
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
                                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl py-3 pl-11 pr-12 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400"
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
        <div v-if="passoAtual === 3" class="animate-fade-in space-y-8">
            <AppFormularioSecao icone="fa7-solid:diagram-project">
                Projetos Atribuídos
            </AppFormularioSecao>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label v-for="p in projetosAtivos" :key="p.codigo" 
                    class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-emerald-500/30 hover:bg-white dark:hover:bg-gray-800/80 transition-all group shadow-sm">
                    <div class="relative flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            :value="p.codigo" 
                            v-model="form.projetos"
                            class="w-5 h-5 rounded-lg border-gray-200 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500/50 cursor-pointer transition-all"
                        >
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ p.apelido }}</span>
                        <span class="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">{{ p.descricao }}</span>
                    </div>
                </label>
            </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando" 
          :carregandoGravar="salvando"
          :labelVoltar="passoAtual === 1 ? 'Retornar' : 'Anterior'"
          :labelGravar="passoAtual === totalPassos ? 'Finalizar Cadastro' : 'Continuar'"
          :iconeGravar="passoAtual === totalPassos ? 'fa7-solid:check-double' : 'fa7-solid:arrow-right'"
          @voltar="voltarPasso"
          @excluir="modalExclusaoAberto = true"
          @limpar="limparFormulario"
          @gravar="avancarPasso"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Alerta -->
    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="fecharModalAlerta"
    >
      <div class="p-6 text-center">
         <p class="text-base font-bold text-gray-700 dark:text-gray-200">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Entendi</AppBotao>
      </template>
    </AppModal>

    <!-- Modal de Exclusão -->
    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Exclusão" 
      icon="fa7-solid:user-xmark"
      tamanho="sm"
      rodapeEntre
      @close="modalExclusaoAberto = false"
    >
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
                <Icon name="fa7-solid:user-slash" class="w-10 h-10 text-white" />
            </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Remover Usuário?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px]">
          Você está prestes a remover <strong class="text-gray-900 dark:text-gray-100">{{ form.nomeUsuario }}</strong>.
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusaoAberto = false">Cancelar</AppBotao>
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" :carregando="carregandoExclusao" @click="excluirRegistro">Sim, remover</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, salvando, carregandoExclusao, modalExclusaoAberto, form, editando,
  senhaConfirma, projetosAtivos, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
  fecharModalAlerta, gravarRegistro, excluirRegistro, limparFormulario, voltarParaLista,
  passoAtual, totalPassos, avancarPasso, voltarPasso
} = useUsuarioFormulario()

const pwdVisible = ref(false)
const pwdVisibleConf = ref(false)
</script>
