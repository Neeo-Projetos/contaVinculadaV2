<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Importação de" 
      tituloGrosso="Contracheques"
      descricao="Envie o arquivo TXT de retenções para processamento e aprovação" 
      icone="fa7-solid:file-arrow-up" 
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="importando" mensagem="Realizando upload e processando arquivo..." />

      <form v-if="!importando" @submit.prevent="importarArquivo" class="space-y-10 relative z-0" novalidate>
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10 mt-4">
            
            <div class="md:col-span-12 lg:col-span-8 flex flex-col gap-10">
                
                <div class="space-y-6">
                    <AppFormularioSecao icone="fa7-solid:calendar-check">
                        Informações da Remessa
                    </AppFormularioSecao>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/50">
                        <AppInputTexto v-model="form.ano" label="Mês/Ano de Referência" placeholder="MM/AAAA" v-maska="'##/####'" icone="fa7-solid:calendar-circle-exclamation" required />
                        
                        <div class="flex flex-col">
                            <label class="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Última Atividade</label>
                            <div class="px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5 text-emerald-500" />
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Última Importação</span>
                                    <span class="text-sm font-black text-gray-800 dark:text-gray-200">{{ ultimaImportacao }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <AppFormularioSecao icone="fa7-solid:file-import">
                        Arquivo de Retenções
                    </AppFormularioSecao>

                    <div class="relative group">
                        <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div class="relative">
                            <AppInputArquivo 
                                v-model="arquivoSelecionado" 
                                accept=".txt" 
                                label="Arquivo de RH (.txt)" 
                                icone="fa7-solid:file-circle-plus"
                                required 
                                @change="aoSelecionarArquivo"
                            />
                        </div>
                    </div>

                    <div class="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-transparent border border-amber-200/50 dark:border-amber-800/30 rounded-3xl shadow-sm flex gap-5 relative overflow-hidden group">
                        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        
                        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
                            <Icon name="fa7-solid:triangle-exclamation" class="w-6 h-6" />
                        </div>
                        <div class="relative z-10 flex-1">
                            <h5 class="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                Regras de Formatação Obrigatórias
                            </h5>
                            <p class="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-medium">
                                O arquivo deve ser formato <strong class="text-amber-950 dark:text-amber-300">texto simples (.txt)</strong> com codificação UTF-8. 
                                Certifique-se de que as colunas de <span class="bg-amber-500/10 px-1.5 py-0.5 rounded">Matrícula</span>, <span class="bg-amber-500/10 px-1.5 py-0.5 rounded">CPF</span> e <span class="bg-amber-500/10 px-1.5 py-0.5 rounded">Verbas</span> estão alinhadas conforme o layout padrão da prefeitura.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="md:col-span-12 lg:col-span-4 lg:sticky lg:top-8 self-start">
                <div class="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 space-y-8 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all duration-300 hover:shadow-2xl">
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
                       <h4 class="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                            <Icon name="fa7-solid:stairs" class="w-5 h-5" /> Fluxo de Trabalho
                        </h4>
                        <div class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                        </div>
                    </div>
                    
                    <div class="space-y-8 relative">
                        <div class="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/50 via-gray-200/50 to-gray-200/50 dark:via-gray-800 dark:to-gray-800 border-dashed border-l border-gray-300 dark:border-gray-700 ml-[-0.5px]"></div>

                        <div class="flex items-start gap-5 relative" :class="{ 'opacity-100': form.ano, 'opacity-60': !form.ano }">
                            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-black shadow-inner border border-emerald-500/20 shrink-0 z-10 bg-white">
                                <Icon v-if="form.ano" name="fa7-solid:check" class="scale-125" />
                                <span v-else>01</span>
                            </div>
                            <div class="flex flex-col gap-1 py-1">
                                <span class="text-sm font-black text-gray-800 dark:text-gray-200 leading-none">Referência</span>
                                <p class="text-[11px] text-gray-500 font-medium">Selecione o período das retenções.</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-5 relative opacity-60" :class="{ 'opacity-100': arquivoSelecionado }">
                            <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-sm font-black shadow-inner border border-gray-200 dark:border-gray-700 shrink-0 z-10" :class="{ 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-500/20': arquivoSelecionado }">
                                <Icon v-if="arquivoSelecionado" name="fa7-solid:check" class="scale-125" />
                                <span v-else>02</span>
                            </div>
                            <div class="flex flex-col gap-1 py-1">
                                <span class="text-sm font-black text-gray-800 dark:text-gray-200 leading-none">Upload</span>
                                <p class="text-[11px] text-gray-500 font-medium">Suba o arquivo e clique em importar.</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-5 relative opacity-40">
                            <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-sm font-black shadow-inner border border-gray-200 dark:border-gray-700 shrink-0 z-10">
                                03
                            </div>
                            <div class="flex flex-col gap-1 py-1">
                                <span class="text-sm font-black text-gray-800 dark:text-gray-200 leading-none">Processar</span>
                                <p class="text-[11px] text-gray-500 font-medium">Conclua o fluxo na tela de conferência.</p>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4">
                        <AppBotao variacao="padrao" icone="fa7-solid:list-check" @click="irParaProcessamento" class="w-full h-12 text-xs uppercase tracking-widest shadow-lg shadow-gray-200/10">
                            Fila de Processamento
                        </AppBotao>
                    </div>
                </div>
            </div>

        </div>

        <AppRodapeFormulario 
          labelVoltar="Voltar ao Início"
          labelGravar="Processar Importação"
          iconeGravar="fa7-solid:cloud-arrow-up"
          @voltar="navigateTo('/inicio')"
          @gravar="importarArquivo"
        />
      </form>
    </AppCartaoFormulario>

    <AppModal :isOpen="modalImportadosAberto" title="Importação Finalizada" icon="fa7-solid:cloud-check" tamanho="sm" @close="modalImportadosAberto = false" rodapeEntre>
      <div class="flex flex-col items-center py-6 text-center">
        <div class="relative mb-6 scale-125">
            <div class="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                <Icon name="fa7-solid:check" class="w-8 h-8 text-white" />
            </div>
        </div>
        
        <h4 class="text-xl font-black text-gray-900 dark:text-white mb-2">
          Sucesso!
        </h4>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[240px]">
          O arquivo foi importado e processado com êxito. Deseja conferir os dados para aprovação agora?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalImportadosAberto = false">Depois</AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:arrow-right" @click="irParaProcessamento">Sim, processar</AppBotao>
      </template>
    </AppModal>

    <AppModal 
      :isOpen="modalAlertaAberto" 
      tamanho="sm"
      @close="modalAlertaAberto = false"
      semCabecalho
    >
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a1c23] group transition-all duration-300">
        
        <div class="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20"></div>
        <div class="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20"></div>

        <button @click="modalAlertaAberto = false" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-rose-500 transition-all z-50 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <Icon name="fa7-solid:xmark" class="w-3.5 h-3.5" />
        </button>

        <div class="flex flex-col items-center">
            
            <div class="w-full pt-12 pb-6 flex flex-col items-center text-center px-8">
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-110"></div>
                    <div class="relative w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
                        <Icon name="fa7-solid:triangle-exclamation" class="w-8 h-8 text-white" />
                    </div>
                </div>

                <div class="space-y-1">
                    <span class="text-[9px] font-black text-amber-500 uppercase tracking-[0.35rem]">Notificação Crítica</span>
                    <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {{ modalAlertaTitulo }}
                    </h3>
                </div>
            </div>

            <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-800/80 to-transparent"></div>

            <div class="w-full py-10 px-10 text-center">
                <p class="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                    {{ modalAlertaMensagem }}
                </p>
            </div>

            <div class="w-full pb-10 flex flex-col items-center justify-center">
                <div class="w-full max-w-[180px]">
                    <AppBotao 
                        variacao="primario" 
                        @click="modalAlertaAberto = false" 
                        class="w-full h-11 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 rounded-xl"
                    >
                        <span>Entendido</span>
                        <Icon name="fa7-solid:check" class="w-3.5 h-3.5" />
                    </AppBotao>
                </div>
            </div>

        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  form, arquivoSelecionado, ultimaImportacao, importando, modalImportadosAberto,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
  aoSelecionarArquivo, importarArquivo, irParaProcessamento
} = useContrachequeImportacao()
</script>