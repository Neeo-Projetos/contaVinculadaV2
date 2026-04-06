<template>
  <div class="min-h-full flex flex-col p-4 md:p-10 animate-fade-in">
    
    <AppTrilhaNavegacao 
      icone="fa7-solid:briefcase" 
      class="mb-8"
      :links="[{ label: 'Projetos', to: '/cadastro/projeto' }]"
      :paginaAtual="editando ? form.apelido || 'Editando Registro' : 'Novo Registro'"
    />

    <div class="mb-8">
      <AppPassosFormulario :passos="['Dados Gerais', 'Endereço', 'Parâmetros']" :passoAtual="passoAtual" />
    </div>

    <AppCartaoFormulario class="py-10 px-8 sm:px-12">
      <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Carregando dados do projeto..." />

      <form v-if="!carregandoTela" @submit.prevent="!modoVisualizar && (passoAtual === 2 ? gravarRegistro() : avancarPasso())" class="space-y-10 relative z-0">
        
        <!-- Passo 0: Dados Gerais -->
        <div v-if="passoAtual === 0" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:file-lines">
            Identificação do Projeto
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div class="md:col-span-5" :class="{ 'animate-shake': erros.has('cnpj') }">
              <AppInputCnpj v-model="form.cnpj" label="CNPJ da Empresa" required @blur="verificarCnpj" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-3" :class="{ 'animate-shake': erros.has('apelido') }">
              <AppInputTexto v-model="form.apelido" label="Apelido / Sigla" placeholder="Ex: PROJ-X" required maxlength="20" icone="fa7-solid:tag" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-4" :class="{ 'animate-shake': erros.has('descricao') }">
              <AppInputTexto v-model="form.descricao" label="Descrição Resumida" placeholder="Resumo do projeto..." required maxlength="100" icone="fa7-solid:comment-dots" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-12 mt-2" :class="{ 'animate-shake': erros.has('razaoSocial') }">
              <AppInputTexto v-model="form.razaoSocial" label="Razão Social (Nome Empresarial)" placeholder="Nome empresarial oficial conforme contrato social..." required maxlength="100" icone="fa7-solid:building" :somenteLeitura="modoVisualizar" />
            </div>
          </div>
        </div>

        <!-- Passo 1: Endereço e Localização -->
        <div v-if="passoAtual === 1" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:location-dot">
            Localização e Endereço
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div class="md:col-span-3" :class="{ 'animate-shake': erros.has('cep') }">
              <AppInputCep v-model="form.cep" label="CEP Principal" required :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-7" :class="{ 'animate-shake': erros.has('logradouro') }">
              <AppInputTexto v-model="form.logradouro" label="Logradouro" placeholder="Avenida, Rua, Praça, etc..." required maxlength="100" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-2" :class="{ 'animate-shake': erros.has('numeroEndereco') }">
              <AppInputTexto v-model="form.numeroEndereco" label="Nº" placeholder="123" required maxlength="10" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-5" :class="{ 'animate-shake': erros.has('bairro') }">
              <AppInputTexto v-model="form.bairro" label="Bairro / Distrito" placeholder="Digite o bairro..." required maxlength="50" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-5" :class="{ 'animate-shake': erros.has('cidade') }">
              <AppInputTexto v-model="form.cidade" label="Município" placeholder="Digite a cidade..." required maxlength="50" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-2" :class="{ 'animate-shake': erros.has('uf') }">
              <AppInputTexto v-model="form.uf" label="UF (Estado)" placeholder="RJ" required maxlength="2" :somenteLeitura="modoVisualizar" />
            </div>
          </div>
        </div>

        <!-- Passo 2: Parâmetros e Regras -->
        <div v-if="passoAtual === 2" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:gears">
            Parâmetros Contratuais e Financeiros
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div class="md:col-span-3">
              <AppInputTexto v-model="form.numeroFuncionarios" label="Quantidade de Funcionários" type="number" icone="fa7-solid:users" placeholder="0" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-3">
              <AppInputTexto v-model="form.valorFaturamento" label="Expectativa de Faturamento" placeholder="R$ 0,00" icone="fa7-solid:money-bill-wave" :somenteLeitura="modoVisualizar" />
            </div>
            <div class="md:col-span-3" :class="{ 'animate-shake': erros.has('tipoDeCalculo') }">
              <AppSelect 
                v-model="form.tipoDeCalculo" 
                label="Metodologia de Cálculo" 
                :opcoes="[{ codigo: '1', descricao: 'Vencimento Padrão' }, { codigo: '2', descricao: 'Cálculo Extraordinário' }]" 
                required 
                :somenteLeitura="modoVisualizar"
              />
            </div>
            <div class="md:col-span-3" :class="{ 'animate-shake': erros.has('saldoOficio') }">
              <AppSelect 
                v-model="form.saldoOficio" 
                label="Habilitar Saldo Ofício?" 
                :opcoes="[{ codigo: '1', descricao: 'Sim, Ativado' }, { codigo: '0', descricao: 'Não, Desativado' }]" 
                required 
                :somenteLeitura="modoVisualizar"
              />
            </div>
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando && (Number(form.ativo) === 1 || form.ativo === true)" 
          :carregandoGravar="carregandoGravacao"
          :visualizar="modoVisualizar"
          :labelVoltar="passoAtual === 0 ? 'Cancelar' : 'Anterior'"
          :labelGravar="passoAtual === 2 ? 'Finalizar Cadastro' : 'Próxima Etapa'"
          :labelLimpar="passoAtual === 0 ? 'Limpar Dados' : ''"
          labelExcluir="Inativar"
          iconeExcluir="fa7-solid:ban"
          @voltar="voltarPasso"
          @excluir="abrirModalExclusao"
          @limpar="limparFormulario"
        >
          <template #extra-acoes-direita v-if="modoVisualizar">
            <AppBotao variacao="primario" icone="fa7-solid:pencil" @click="irParaEdicao">
              Editar
            </AppBotao>
          </template>
        </AppRodapeFormulario>
      </form>
    </AppCartaoFormulario>

    <!-- Modais de Exclusão e Alerta permanecem iguais -->
    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Inativação" 
      icon="fa7-solid:ban"
      tamanho="sm"
      rodapeEntre
      semScroll
      @close="fecharModal"
    >
      <div class="flex flex-col items-center py-2 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:lock" class="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Inativar Projeto
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Você está prestes a tornar <strong class="text-gray-800 dark:text-gray-200">{{ form.apelido }}</strong> inativo. Ele não aparecerá mais nas listagens principais.
        </p>
        
        <AppCampoObrigatorio class="mt-8">
          O registro permanecerá no histórico
        </AppCampoObrigatorio>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="fecharModal">
          Cancelar
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" :carregando="carregandoExclusao" @click="excluirRegistro">
          Sim, Inativar
        </AppBotao>
      </template>
    </AppModal>

    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="fecharModalAlerta"
    >
      <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
         <p class="text-base text-center font-medium">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full sm:w-auto">
          Entendi
        </AppBotao>
      </template>
    </AppModal>

    <!-- Modal de Sucesso com Resumo -->
    <AppModal 
      :isOpen="modalSucessoAberto" 
      title="Sucesso: Registro Salvo" 
      icon="fa7-solid:circle-check"
      semScroll
      @close="voltarParaLista"
    >
      <div class="flex flex-col items-center py-6 text-center">
        <!-- Ícone Animado -->
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div class="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl animate-success-pop">
            <Icon name="fa7-solid:check" class="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h3 class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          {{ editando ? 'Alterações Salvas!' : 'Projeto Criado!' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-8">O projeto foi {{ editando ? 'atualizado' : 'cadastrado' }} com sucesso no sistema.</p>

        <!-- Resumo dos Dados -->
        <div class="w-full bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 text-left space-y-4">
          <h4 class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Resumo do Registro</h4>
          
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-[#1e2029] flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <Icon name="fa7-solid:building" class="text-gray-400" />
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">Apelido / Sigla</p>
              <p class="font-extrabold text-gray-800 dark:text-gray-200">{{ form.apelido }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-[#1e2029] flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <Icon name="fa7-solid:address-card" class="text-gray-400" />
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400">CNPJ</p>
              <p class="font-bold text-gray-600 dark:text-gray-400">{{ form.cnpj }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="voltarParaLista" class="w-full h-14 text-lg rounded-2xl shadow-xl shadow-emerald-500/20">
          Voltar para Listagem
        </AppBotao>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const {
  passoAtual, avancarPasso, voltarPasso,
  carregandoTela, carregandoGravacao, carregandoExclusao, modalExclusaoAberto, form, editando,
  carregarDados, voltarParaLista, limparFormulario, verificarCnpj,
  abrirModalExclusao, fecharModal, gravarRegistro, excluirRegistro,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta,
  erros, modalSucessoAberto, modoVisualizar, irParaEdicao
} = useProjetoFormulario()

onMounted(() => { 
  carregarDados() 
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.animate-shake :deep(input),
.animate-shake :deep(select) {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

@keyframes success-pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-success-pop {
  animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.dark .animate-shake :deep(input) {
  background-color: rgba(239, 68, 68, 0.05) !important;
}
</style>

