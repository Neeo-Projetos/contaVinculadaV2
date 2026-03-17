<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppTrilhaNavegacao 
      icone="fa7-solid:briefcase" 
      :links="[{ label: 'Projetos', to: '/cadastro/projeto' }]"
      :paginaAtual="editando ? form.apelido || 'Editando Registro' : 'Novo Registro'"
    />

    <AppPassosFormulario :passos="['Dados Gerais', 'Endereço', 'Parâmetros']" :passoAtual="passoAtual" />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Carregando dados do projeto..." />

      <form v-if="!carregandoTela" @submit.prevent="passoAtual === 2 ? gravarRegistro() : avancarPasso()" class="space-y-8 relative z-0">
        
        <!-- Passo 0: Dados Gerais -->
        <div v-if="passoAtual === 0" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:file-lines">
            Dados Gerais
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
            <div class="md:col-span-4">
              <AppInputCnpj v-model="form.cnpj" required @blur="verificarCnpj" />
            </div>
            <div class="md:col-span-4">
              <AppInputTexto v-model="form.apelido" label="Apelido/Sigla" placeholder="Ex: PROJ-X" required maxlength="20" icone="fa7-solid:tag" />
            </div>
            <div class="md:col-span-4">
              <AppInputTexto v-model="form.descricao" label="Descrição Curta" placeholder="Resumo do projeto..." required maxlength="100" icone="fa7-solid:comment-dots" />
            </div>
            <div class="md:col-span-12">
              <AppInputTexto v-model="form.razaoSocial" label="Razão Social" placeholder="Nome empresarial oficial..." required maxlength="100" icone="fa7-solid:building" />
            </div>
          </div>
        </div>

        <!-- Passo 1: Endereço e Contato -->
        <div v-if="passoAtual === 1" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:location-dot">
            Endereço e Contato
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
            <div class="md:col-span-3">
              <AppInputCep v-model="form.cep" required />
            </div>
            <div class="md:col-span-7">
              <AppInputTexto v-model="form.logradouro" label="Logradouro" placeholder="Rua, Av, etc..." required maxlength="100" />
            </div>
            <div class="md:col-span-2">
              <AppInputTexto v-model="form.numeroEndereco" label="Número" placeholder="123" required maxlength="10" />
            </div>
            <div class="md:col-span-4">
              <AppInputTexto v-model="form.bairro" label="Bairro" placeholder="Digite o bairro..." required maxlength="50" />
            </div>
            <div class="md:col-span-6">
              <AppInputTexto v-model="form.cidade" label="Cidade" placeholder="Digite a cidade..." required maxlength="50" />
            </div>
            <div class="md:col-span-2">
              <AppInputTexto v-model="form.uf" label="UF" placeholder="RJ" required maxlength="2" />
            </div>
          </div>
        </div>

        <!-- Passo 2: Parâmetros do Sistema -->
        <div v-if="passoAtual === 2" class="animate-fade-in">
          <AppFormularioSecao icone="fa7-solid:gears">
            Parâmetros do Sistema
          </AppFormularioSecao>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8">
            <AppInputTexto v-model="form.numeroFuncionarios" label="Nº Funcionários" type="number" icone="fa7-solid:users" />
            <AppInputTexto v-model="form.valorFaturamento" label="Faturamento" placeholder="R$ 0,00" icone="fa7-solid:money-bill-wave" />
            <AppSelect 
              v-model="form.tipoDeCalculo" 
              label="Tipo de Cálculo" 
              :opcoes="[{ codigo: '1', descricao: 'Vencimento' }, { codigo: '2', descricao: 'Extra' }]" 
              required 
            />
            <AppSelect 
              v-model="form.saldoOficio" 
              label="Saldo Ofício" 
              :opcoes="[{ codigo: '1', descricao: 'Sim' }, { codigo: '0', descricao: 'Não' }]" 
              required 
            />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando && (Number(form.ativo) === 1 || form.ativo === true)" 
          :carregandoGravar="carregandoGravacao"
          :labelVoltar="passoAtual === 0 ? 'Cancelar' : 'Anterior'"
          :labelGravar="passoAtual === 2 ? 'Finalizar Cadastro' : 'Próxima Etapa'"
          :labelLimpar="passoAtual === 0 ? 'Limpar Dados' : ''"
          labelExcluir="Inativar"
          iconeExcluir="fa7-solid:ban"
          @voltar="voltarPasso"
          @excluir="abrirModalExclusao"
          @limpar="limparFormulario"
        />
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
        
        <div class="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Icon name="fa7-solid:circle-info" class="w-5 h-5 shrink-0" />
          <span>O registro permanecerá no histórico</span>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const {
  passoAtual, avancarPasso, voltarPasso,
  carregandoTela, carregandoGravacao, carregandoExclusao, modalExclusaoAberto, form, editando,
  carregarDados, voltarParaLista, limparFormulario, verificarCnpj,
  abrirModalExclusao, fecharModal, gravarRegistro, excluirRegistro,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta 
} = useProjetoFormulario()

onMounted(() => { 
  carregarDados() 
})
</script>
