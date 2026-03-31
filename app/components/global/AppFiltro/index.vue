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
                                class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
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
            class="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-gray-800/60 transition-all duration-300">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <h2 class="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                    Filtros
                </h2>

                <div
                    class="flex items-center bg-gray-50/80 dark:bg-[#0f172a]/60 rounded-2xl p-1.5 self-start md:self-auto border border-gray-200/50 dark:border-slate-800 shadow-inner">
                    <span
                        class="text-[9px] text-gray-400 dark:text-gray-500 font-black px-4 mr-0.5 hidden md:inline uppercase tracking-[0.25em]">Visualização:</span>

                    <button @click="$emit('update:viewMode', 'lista')"
                        :class="viewMode === 'lista' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-lg border border-gray-100 dark:border-slate-600' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 border border-transparent'"
                        class="px-5 h-[46px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 group">
                        <Icon name="fa7-solid:list" class="h-3.5 w-3.5 transition-transform" />
                        Lista
                    </button>

                    <button @click="$emit('update:viewMode', 'cards')"
                        :class="viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-lg border border-gray-100 dark:border-slate-600' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 border border-transparent'"
                        class="px-5 h-[46px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 group">
                        <Icon name="fa7-solid:table-cells-large"
                            class="h-3.5 w-3.5 transition-transform" />
                        Cards
                    </button>

                    <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2.5 hidden md:block opacity-50"></div>

                    <button v-if="exibirFiltroAvancado" @click="$emit('openAdvancedFilter')"
                        class="px-5 h-[46px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 bg-gray-100/50 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md active:scale-95 group"
                        :class="advancedFilterActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                        <Icon name="fa7-solid:filter" class="h-3.5 w-3.5 transition-transform"
                            :class="{ 'text-emerald-600 dark:text-emerald-400 font-bold': advancedFilterActive }" />
                        <span class="tracking-[0.15em]"
                            :class="{ 'text-emerald-600 dark:text-emerald-400 font-bold': advancedFilterActive }">Filtro
                            Avançado</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div :class="campo.type === 'select' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-6 lg:col-span-7'" v-for="campo in campos" :key="campo.key">
                    <AppInputTexto v-if="campo.type === 'text'" :modelValue="(modelValue[campo.key] as string) || ''"
                        @update:modelValue="val => atualizarModelo(campo.key, val)" :label="campo.label"
                        :placeholder="campo.placeholder" :icone="campo.icon" @keyup.enter="$emit('buscar')" />

                    <AppSelect v-else-if="campo.type === 'select'" :modelValue="(modelValue[campo.key] as string) || ''"
                        @update:modelValue="val => atualizarModelo(campo.key, val)" :label="campo.label"
                        :placeholder="campo.placeholder || 'Todos'" :opcoes="campo.options || []"
                        :itemValue="campo.itemValue || 'value'" :itemLabel="campo.itemLabel || 'label'" />

                    <div v-else-if="campo.type === 'autocomplete'" class="flex flex-col gap-2.5">
                        <label v-if="campo.label"
                            class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{
                                campo.label }}</label>
                        <AppInputAutocomplete :modelValue="(modelValue[campo.key] as string) || ''"
                            @update:modelValue="val => atualizarModelo(campo.key, val)" :placeholder="campo.placeholder"
                            :sugestoes="campo.sugestoes || []" :buscando="campo.buscando || false"
                            :mostrarMenu="campo.mostrarMenu || false" @buscar="$emit('buscarSugestao', campo.key)"
                            @selecionar="val => selecionarComBusca(campo, val)"
                            @fechar="$emit('fecharSugestao', campo.key)" @enter="$emit('buscar')" />
                    </div>
                </div>

                <div class="md:col-span-4 lg:col-span-3">
                    <button :disabled="pending" @click="$emit('buscar')"
                        class="items-center text-white font-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 rounded-2xl text-xs uppercase tracking-widest px-8 h-[46px] w-full shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex justify-center gap-3 disabled:opacity-70 border border-blue-500/50">
                        <Icon :name="pending ? 'fa7-solid:spinner' : 'fa6-solid:magnifying-glass'"
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
import { ref, nextTick } from 'vue';

type ValorCampo = string | number | boolean | null;

interface CampoFiltro {
    key: string;
    label: string;
    type: 'text' | 'select' | 'autocomplete';
    placeholder?: string;
    icon?: string;
    options?: any[]; // Para 'select'
    itemValue?: string; // Para 'select'
    itemLabel?: string; // Para 'select'
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

const selecionarComBusca = (campo: CampoFiltro, val: any) => {
    atualizarModelo(campo.key, val.descricao);
    emit('selecionarSugestao', { key: campo.key, sugestao: val });
    setTimeout(() => emit('buscar'), 100);
}
</script>
