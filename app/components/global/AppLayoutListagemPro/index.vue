<template>
    <div class="flex flex-col gap-6 w-full py-4 min-h-[70vh] animate-fade-in relative">
        <!-- Background Accent (Subtle refined touch) -->
        <div class="absolute top-0 right-0 w-1/3 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>

        <!-- Refined Pro Header Wrapper -->
        <div v-if="titulo || $slots.acoes"
            class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.04)] mb-3 group/header relative overflow-hidden">
            
            <!-- Subtle Glow Effect -->
            <div class="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover/header:bg-emerald-500/20 transition-colors duration-700"></div>

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div class="flex-1">
                    <!-- Breadcrumbs Ultra-Refinado -->
                    <div v-if="breadcrumbs && breadcrumbs.length"
                        class="flex items-center gap-2 text-[10px] font-black text-emerald-500/50 dark:text-emerald-500/30 mb-4 tracking-[0.25em] uppercase">
                        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                            <NuxtLink v-if="crumb.to" :to="crumb.to"
                                class="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                {{ crumb.label }}
                            </NuxtLink>
                            <span v-else class="text-slate-900 dark:text-gray-100 font-black">
                                {{ crumb.label }}
                            </span>
                            <Icon v-if="idx < breadcrumbs.length - 1" name="fa7-solid:chevron-right"
                                class="h-2 w-2 opacity-20" />
                        </template>
                    </div>

                    <div class="flex items-center gap-6">
                        <div v-if="iconeTitulo" 
                            class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-emerald-500/10 border border-emerald-100/30 dark:border-slate-700 flex items-center justify-center text-emerald-600 transition-all duration-500 group-hover/header:rotate-6 group-hover/header:scale-105">
                            <Icon :name="iconeTitulo" class="w-7 h-7" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <h1 v-if="titulo"
                                class="text-2xl md:text-3xl font-black text-slate-900 dark:text-gray-50 transition-colors tracking-tighter leading-none">
                                {{ titulo }}
                            </h1>
                            <p v-if="descricao"
                                class="text-xs md:text-sm font-medium text-slate-500/70 dark:text-slate-400 max-w-2xl leading-relaxed">
                                {{ descricao }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Strategic Actions Slot -->
                <div v-if="$slots.acoes" class="flex flex-wrap items-center gap-3 bg-white/30 dark:bg-slate-800/30 p-2.5 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm backdrop-blur-md self-start lg:self-auto">
                    <slot name="acoes" />
                </div>
            </div>
        </div>

        <!-- Filters Section - Integrated Inline Grid -->
        <div
            class="bg-white dark:bg-[#1a202c] p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100/50 dark:border-slate-800/50 transition-all duration-500">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5 border-b border-slate-50 dark:border-slate-800/50 pb-6">
                <div class="flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/20"></div>
                    <h2 class="text-lg font-black text-slate-800 dark:text-gray-100 tracking-tight">
                        Gestão de Pesquisa
                    </h2>
                </div>

                <div
                    class="flex items-center bg-slate-50/50 dark:bg-[#0f172a]/40 rounded-xl p-1 border border-slate-200/40 dark:border-slate-800/50 transition-colors hover:border-emerald-500/10">
                    <span
                        class="text-[9px] text-slate-400 dark:text-gray-500 font-bold px-3 hidden md:inline uppercase tracking-[0.2em]">Estilo</span>

                    <div class="flex items-center gap-1">
                        <button @click="$emit('update:viewMode', 'cards')"
                            :class="viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-600' : 'text-slate-400 dark:text-gray-500 hover:text-emerald-600 transition-colors'"
                            class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2">
                            <Icon name="fa7-solid:table-cells-large" class="h-3.5 w-3.5" />
                            Grid
                        </button>

                        <button @click="$emit('update:viewMode', 'lista')"
                            :class="viewMode === 'lista' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-600' : 'text-slate-400 dark:text-gray-500 hover:text-emerald-600 transition-colors'"
                            class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2">
                            <Icon name="fa7-solid:list" class="h-3.5 w-3.5" />
                            Lista
                        </button>
                    </div>

                    <div v-if="exibirFiltroAvancado" class="w-px h-6 bg-slate-200 dark:bg-gray-700/50 mx-2"></div>

                    <button v-if="exibirFiltroAvancado" @click="$emit('openAdvancedFilter')"
                        class="text-slate-400 dark:text-gray-500 hover:text-emerald-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 group/btn"
                        title="Filtros Especializados">
                        <Icon name="fa7-solid:sliders" class="h-3.5 w-3.5 group-hover/btn:rotate-180 transition-transform duration-500"
                            :class="{ 'text-emerald-600 dark:text-emerald-400': advancedFilterActive }" />
                        <span class="hidden lg:inline"
                            :class="{ 'text-emerald-600 dark:text-emerald-400': advancedFilterActive }">Avançado</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <template v-for="campo in campos" :key="campo.key">
                    <div v-if="campo.type === 'text'" class="flex flex-col gap-3 group">
                        <label class="text-[10px] font-black text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.2em] px-1 group-focus-within:text-emerald-500 transition-colors">{{ campo.label }}</label>
                        <div class="relative">
                            <input type="text" :id="campo.key" :value="(modelValue[campo.key] as string) || ''"
                                @input="e => atualizarModelo(campo.key, (e.target as HTMLInputElement).value)"
                                :placeholder="campo.placeholder"
                                class="w-full bg-slate-50/30 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 block p-3.5 transition-all duration-300 outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
                                @keyup.enter="$emit('buscar')" autocomplete="off" />
                        </div>
                    </div>

                    <div v-else-if="campo.type === 'autocomplete'" class="flex flex-col gap-3 group">
                        <label class="text-[10px] font-black text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.2em] px-1 group-focus-within:text-emerald-500 transition-colors">{{ campo.label }}</label>
                        <AppInputAutocomplete 
                            :modelValue="(modelValue[campo.key] as string) || ''"
                            @update:modelValue="val => atualizarModelo(campo.key, val)"
                            :placeholder="campo.placeholder"
                            :sugestoes="campo.sugestoes || []"
                            :buscando="campo.buscando || false"
                            :mostrarMenu="campo.mostrarMenu || false"
                            @buscar="$emit('buscarSugestao', campo.key)"
                            @selecionar="val => $emit('selecionarSugestao', { key: campo.key, sugestao: val })"
                            @fechar="$emit('fecharSugestao', campo.key)"
                            @enter="$emit('buscar')"
                        />
                    </div>

                    <div v-else-if="campo.type === 'select'" class="flex flex-col gap-3 group">
                        <label class="text-[10px] font-black text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.2em] px-1 group-focus-within:text-emerald-500 transition-colors">{{ campo.label }}</label>
                        <div class="relative">
                            <select :value="(modelValue[campo.key] as string) || ''"
                                @change="e => atualizarModelo(campo.key, (e.target as HTMLSelectElement).value)"
                                class="w-full bg-slate-50/30 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 block p-3.5 pr-10 transition-all duration-300 appearance-none cursor-pointer font-bold outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                                <option value="" class="bg-white dark:bg-slate-800">{{ campo.placeholder || 'Todos' }}</option>
                                <option v-for="(opt, idx) in campo.options" :key="`opt-${idx}`"
                                    :value="typeof opt === 'object' ? opt.value : opt"
                                    class="bg-white dark:bg-slate-800">{{ typeof opt === 'object' ? opt.label : opt }}
                                </option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
                                <Icon name="fa7-solid:chevron-down" class="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>
                </template>

                <div class="flex items-end pb-1 lg:pb-0">
                    <button @click="$emit('buscar')" :disabled="pending"
                        class="relative overflow-hidden group/search flex items-center justify-center gap-3 w-full h-[54px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none border border-emerald-500">
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/search:animate-[shimmer_1.5s_infinite]"></div>
                        <Icon :name="pending ? 'fa7-solid:spinner' : 'fa7-solid:magnifying-glass'"
                            :class="{ 'animate-spin': pending }" class="h-4 w-4 relative z-10" />
                        <span class="relative z-10">{{ pending ? 'Processando...' : 'Pesquisar' }}</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="w-full relative mt-4">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
type ValorCampo = string | number | boolean | null;

interface CampoFiltro {
    key: string;
    label: string;
    type: 'text' | 'select' | 'autocomplete';
    placeholder?: string;
    options?: any[];
    sugestoes?: any[];
    buscando?: boolean;
    mostrarMenu?: boolean;
}

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
    viewMode: 'lista',
    pending: false,
    advancedFilterActive: false,
    breadcrumbs: () => [],
    exibirFiltroAvancado: true
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, ValorCampo>): void;
    (e: 'update:viewMode', value: 'lista' | 'cards'): void;
    (e: 'buscar'): void;
    (e: 'openAdvancedFilter'): void;
    (e: 'buscarSugestao', key: string): void;
    (e: 'selecionarSugestao', data: { key: string, sugestao: any }): void;
    (e: 'fecharSugestao', key: string): void;
}>();

const atualizarModelo = (key: string, valor: ValorCampo) => {
    emit('update:modelValue', { ...props.modelValue, [key]: valor });
};
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
