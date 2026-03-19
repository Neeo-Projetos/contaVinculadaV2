<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <!-- HEADER HUB -->
    <div class="relative overflow-hidden rounded-3xl shadow-sm bg-white dark:bg-[#1a1c23] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 transition-all duration-500 group">
      <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
      <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:-translate-y-4 transition-all duration-700"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex flex-col gap-1">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 shadow-inner shrink-0 transform group-hover:rotate-6 transition-transform">
              <Icon name="fa7-solid:gears" class="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            Central de <span class="text-emerald-500 dark:text-emerald-400 drop-shadow-md">Configurações</span>
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium flex items-center gap-2 mt-1 sm:ml-16 opacity-90">
            Gestão de acessos, parâmetros globais e regras de negócio
          </p>
        </div>
      </div>
    </div>

    <!-- CONFIG CARDS GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <NuxtLink 
        v-for="(item, index) in itensConfig" 
        :key="index"
        :to="item.rota" 
        class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
        :class="item.borderHover"
      >
        <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" :class="item.bgShape"></div>

        <div class="flex items-start justify-between relative z-10">
          <div class="flex-1 pr-4">
            <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="item.bgTag">Segurança</span>
            </div>
            <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
              {{ item.titulo }}
            </h3>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
              {{ item.desc }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-105" :class="item.bgLight">
            <Icon :name="item.icone" class="w-6 h-6" :class="item.textIcon" />
          </div>
        </div>

        <div class="mt-6 flex items-center text-xs font-bold uppercase tracking-wider transition-colors relative z-10" :class="item.textIcon">
          <span>Abrir Configuração</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>

      </NuxtLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const itensConfig = ref([
  {
    titulo: 'Usuários',
    desc: 'Gestão de contas, dados pessoais e acesso dos colaboradores ao sistema.',
    icone: 'fa7-solid:user-gear',
    rota: '/configuracao/usuario',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    textIcon: 'text-blue-600 dark:text-blue-400',
    bgShape: 'bg-blue-500/10',
    bgTag: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
    borderHover: 'hover:border-blue-500/40'
  },
  {
    titulo: 'Permissões de Usuário',
    desc: 'Configuração de perfis e níveis de acesso granular para cada usuário.',
    icone: 'fa7-solid:shield-halved',
    rota: '/configuracao/permissaoUsuario',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    textIcon: 'text-amber-600 dark:text-amber-400',
    bgShape: 'bg-amber-500/10',
    bgTag: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
    borderHover: 'hover:border-amber-500/40'
  },
  {
    titulo: 'Parâmetros de Ofício',
    desc: 'Redações base e variáveis para geração automática de documentos oficiais.',
    icone: 'fa7-solid:file-signature',
    rota: '/configuracao/parametros/oficio',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    textIcon: 'text-emerald-600 dark:text-emerald-400',
    bgShape: 'bg-emerald-500/10',
    bgTag: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
    borderHover: 'hover:border-emerald-500/40'
  },
  {
    titulo: 'Interface e Acessibilidade',
    desc: 'Personalização do tema, escala visual e filtros de inclusão para daltonismo.',
    icone: 'fa7-solid:universal-access',
    rota: '/configuracao/interface',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    textIcon: 'text-purple-600 dark:text-purple-400',
    bgShape: 'bg-purple-500/10',
    bgTag: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
    borderHover: 'hover:border-purple-500/40'
  }
])
</script>

<style scoped src="./index.style.css"></style>
