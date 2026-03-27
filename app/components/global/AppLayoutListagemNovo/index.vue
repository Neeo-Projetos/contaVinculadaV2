<template>
    <div class="flex flex-col gap-6 w-full py-4 min-h-[70vh] animate-fade-in">
        <!-- Optional Header Area inside Filtros wrapper -->
        <div v-if="titulo || $slots.acoes"
            class="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-2 mb-6">
            <div class="flex items-center gap-5">
                <div v-if="iconeTitulo"
                    class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-gray-200 dark:border-slate-700">
                    <Icon v-if="iconeTitulo.includes(':')" :name="iconeTitulo" class="w-8 h-8" />
                    <span v-else class="text-2xl font-black">{{ iconeTitulo }}</span>
                </div>
                <div>
                    <div v-if="breadcrumbs && breadcrumbs.length"
                        class="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 mb-1.5 tracking-[0.2em] uppercase">
                        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                            <NuxtLink v-if="crumb.to" :to="crumb.to"
                                class="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                {{ crumb.label }}
                            </NuxtLink>
                            <span v-else class="text-slate-500 dark:text-gray-400">
                                {{ crumb.label }}
                            </span>
                            <Icon v-if="idx < breadcrumbs.length - 1" name="fa7-solid:chevron-right"
                                class="h-2.5 w-2.5 opacity-30" />
                        </template>
                    </div>

                    <h1 v-if="titulo"
                        class="text-3xl md:text-[36px] font-black text-slate-900 dark:text-white transition-colors tracking-tighter leading-none">
                        {{ titulo }}
                    </h1>
                </div>
            </div>

            <!-- Actions Slot (New Button, Options, etc) -->
            <div v-if="$slots.acoes" class="flex items-center gap-4">
                <slot name="acoes" />
            </div>
        </div>

        <div
            class="bg-white dark:bg-[#1a202c] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80 transition-all duration-300">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <h2 class="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Filtros
                </h2>

                <div
                    class="flex items-center bg-gray-50/80 dark:bg-[#0f172a]/60 rounded-2xl p-1.5 self-start md:self-auto border border-gray-200/50 dark:border-slate-800">
                    <span
                        class="text-[10px] text-gray-400 dark:text-gray-500 font-black px-3 mr-1 hidden md:inline uppercase tracking-[0.2em]">Visualização:</span>

                    <button @click="$emit('update:viewMode', 'cards')"
                        :class="viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-gray-100 dark:border-slate-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'"
                        class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2">
                        <Icon name="fa7-solid:table-cells-large" class="h-3.5 w-3.5" />
                        Cards
                    </button>

                    <button @click="$emit('update:viewMode', 'lista')"
                        :class="viewMode === 'lista' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-gray-100 dark:border-slate-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'"
                        class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2">
                        <Icon name="fa7-solid:list" class="h-3.5 w-3.5" />
                        Lista
                    </button>

                    <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>

                    <button v-if="exibirFiltroAvancado" @click="$emit('openAdvancedFilter')"
                        class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-transparent"
                        title="Filtro Avançado">
                        <Icon name="fa7-solid:filter" class="h-3.5 w-3.5"
                            :class="{ 'text-blue-600 dark:text-blue-400 font-bold': advancedFilterActive }" />
                        <span class="hidden md:inline"
                            :class="{ 'text-blue-600 dark:text-blue-400 font-bold': advancedFilterActive }">Filtro
                            Avançado</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <template v-for="campo in campos" :key="campo.key">
                    <div v-if="campo.type === 'text'" class="flex flex-col gap-2.5">
                        <label
                            class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{
                            campo.label }}</label>
                        <input type="text" :id="campo.key" :value="(modelValue[campo.key] as string) || ''"
                            @input="e => atualizarModelo(campo.key, (e.target as HTMLInputElement).value)"
                            :placeholder="campo.placeholder"
                            class="w-full bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white text-sm rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 transition-all duration-300 outline-none"
                            @keyup.enter="$emit('buscar')" autocomplete="off" />
                    </div>

                    <div v-else-if="campo.type === 'autocomplete'" class="flex flex-col gap-2.5">
                        <label
                            class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{
                            campo.label }}</label>
                        <AppInputAutocomplete :modelValue="(modelValue[campo.key] as string) || ''"
                            @update:modelValue="val => atualizarModelo(campo.key, val)" :placeholder="campo.placeholder"
                            :sugestoes="campo.sugestoes || []" :buscando="campo.buscando || false"
                            :mostrarMenu="campo.mostrarMenu || false" @buscar="$emit('buscarSugestao', campo.key)"
                            @selecionar="val => $emit('selecionarSugestao', { key: campo.key, sugestao: val })"
                            @fechar="$emit('fecharSugestao', campo.key)" @enter="$emit('buscar')" />
                    </div>

                    <div v-else-if="campo.type === 'select'" class="flex flex-col gap-2.5">
                        <label
                            class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{
                            campo.label }}</label>
                        <div class="relative group">
                            <select :value="(modelValue[campo.key] as string) || ''"
                                @change="e => atualizarModelo(campo.key, (e.target as HTMLSelectElement).value)"
                                class="w-full bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white text-sm rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 pr-10 transition-all duration-300 appearance-none cursor-pointer font-bold outline-none">
                                <option value="" class="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{{
                                    campo.placeholder || 'Todos' }}
                                </option>
                                <option v-for="(opt, idx) in campo.options" :key="`opt-${idx}`"
                                    :value="typeof opt === 'object' ? opt.value : opt"
                                    class="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{{ typeof opt ===
                                        'object' ? opt.label : opt }}
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                                <Icon name="fa7-solid:chevron-down" class="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>
                </template>

                <div class="flex items-end pt-2 md:pt-0">
                    <button @click="$emit('buscar')" :disabled="pending"
                        class="items-center text-white font-bold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-2xl text-sm px-8 py-4 w-full shadow-lg shadow-blue-500/20 shadow-blue-600/20 transition-all active:scale-[0.98] flex justify-center gap-3 disabled:opacity-70 h-[52px] border border-blue-600">
                        <Icon :name="pending ? 'fa7-solid:spinner' : 'fa7-solid:magnifying-glass'"
                            :class="{ 'animate-spin': pending }" class="h-4 w-4" />
                        {{ pending ? 'Processando...' : 'Buscar' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Content Area Slot (Cards, Tabela, Skeletons) -->
        <div class="w-full relative mt-2">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type ValorCampo = string | number | boolean | null;

interface CampoFiltro {
    key: string;
    label: string;
    type: 'text' | 'select' | 'autocomplete';
    placeholder?: string;
    options?: any[]; // Para 'select'
    // Props para 'autocomplete' (mapeadas para AppInputAutocomplete)
    sugestoes?: any[];
    buscando?: boolean;
    mostrarMenu?: boolean;
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, ValorCampo>): void;
    (e: 'update:viewMode', value: 'lista' | 'cards'): void;
    (e: 'buscar'): void;
    (e: 'openAdvancedFilter'): void;
    (e: 'buscarSugestao', key: string): void;
    (e: 'selecionarSugestao', data: { key: string, sugestao: any }): void;
    (e: 'fecharSugestao', key: string): void;
}>();

const props = withDefaults(defineProps<{
    modelValue: Record<string, ValorCampo>;
    campos: CampoFiltro[];
    viewMode?: string;
    pending?: boolean;
    advancedFilterActive?: boolean;
    titulo?: string;
    descricao?: string;
    iconeTitulo?: string;
    breadcrumbs?: { label: string, to?: string }[];
    exibirFiltroAvancado?: boolean;
}>(), {
    viewMode: 'cards',
    pending: false,
    advancedFilterActive: false,
    breadcrumbs: () => [],
    exibirFiltroAvancado: true
});

const atualizarModelo = (key: string, valor: ValorCampo) => {
    emit('update:modelValue', { ...props.modelValue, [key]: valor });
};
</script>
