<template>
  <div class="pt-6 mt-8 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
    
    <!-- Ações à esquerda -->
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <AppBotao variacao="padrao" icone="fa7-solid:arrow-left" @click="$emit('voltar')">
        {{ labelVoltar }}
      </AppBotao>

      <AppBotao v-if="editando && !visualizar" variacao="perigo" :icone="iconeExcluir" :carregando="carregandoExclusao" @click="$emit('excluir')">
        {{ labelExcluir }}
      </AppBotao>

      <slot name="extra-acoes-esquerda" />
    </div>
    
    <!-- Ações à direita -->
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <slot name="extra-acoes-direita" />

      <template v-if="!visualizar">
        <AppBotao variacao="acao" icone="fa7-solid:file" @click="$emit('limpar')">
          {{ labelLimpar }}
        </AppBotao>
        
        <AppBotao nativeType="submit" variacao="primario" icone="fa7-solid:floppy-disk" :carregando="carregandoGravar" @click="$emit('gravar')">
          {{ labelGravar }}
        </AppBotao>
      </template>

      <template v-else>
        <AppBotao v-if="!ocultarEditar" variacao="primario" icone="fa7-solid:pen-to-square" @click="$emit('editar')">
          Editar Registro
        </AppBotao>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  editando: { type: Boolean, default: false },
  carregandoGravar: { type: Boolean, default: false },
  carregandoExclusao: { type: Boolean, default: false },
  labelVoltar: { type: String, default: 'Voltar' },
  labelExcluir: { type: String, default: 'Excluir' },
  iconeExcluir: { type: String, default: 'fa7-solid:trash-can' },
  labelLimpar: { type: String, default: 'Novo' },
  labelGravar: { type: String, default: 'Gravar' },
  visualizar: { type: Boolean, default: false },
  ocultarEditar: { type: Boolean, default: false }
})

defineEmits(['voltar', 'excluir', 'limpar', 'gravar', 'editar'])
</script>
