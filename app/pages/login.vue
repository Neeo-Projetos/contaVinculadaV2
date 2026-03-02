<template>
  <!-- Botão de tema fixo no canto superior direito -->
  <button
    @click="toggleTheme"
    class="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300"
    :class="isDark
      ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700'
      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
    :title="isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
  >
    <Transition name="theme-icon" mode="out-in">
      <Icon v-if="isDark" key="sun" name="fa7-solid:sun" class="w-4 h-4" />
      <Icon v-else key="moon" name="fa7-solid:moon" class="w-4 h-4" />
    </Transition>
  </button>

  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black px-4 transition-colors duration-500 relative overflow-hidden"
  >
    <!-- Fundo de Partículas -->
    <ClientOnly>
      <FundoParticulas :color="isDark ? '#3b82f6' : '#3276b1'" :count="80" />
    </ClientOnly>

    <!-- Card com v-motion (entrada spring, igual ao eventosNTL) -->
    <div
      class="bg-white dark:bg-gray-800/90 backdrop-blur-md max-w-md w-full relative z-10 p-8 pt-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      v-motion
      :initial="{ opacity: 0, y: 50, scale: 0.9 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 500, type: 'spring' } }"
    >

      <!-- Header com v-motion em delay -->
      <div
        class="flex flex-col items-center text-center mb-8"
        v-motion
        :initial="{ opacity: 0, y: -20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"
      >
        <h1 class="text-4xl font-bold tracking-tight text-[#3276b1] dark:text-[#539ce0]">
          Conta<span class="font-light text-gray-500 dark:text-gray-400">Vinculada</span>
        </h1>
        <p class="mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Acesso ao Sistema Corporativo
        </p>
      </div>

      <!-- Form com v-motion em delay maior -->
      <form
        @submit.prevent="handleLogin"
        class="space-y-6"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 400, duration: 400 } }"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário / CPF</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Icon name="fa7-solid:user" class="h-4 w-4" />
            </div>
            <input
              v-model="form.login"
              type="text"
              class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#3276b1] dark:focus:ring-[#539ce0] focus:border-transparent transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Digite seu usuário"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Icon name="fa7-solid:lock" class="h-4 w-4" />
            </div>
            <input
              v-model="form.senha"
              type="password"
              class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#3276b1] dark:focus:ring-[#539ce0] focus:border-transparent transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Digite sua senha"
              required
            />
          </div>
        </div>

        <div
          v-if="error"
          class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{ opacity: 1, x: 0 }"
        >
          <Icon name="fa7-solid:circle-exclamation" class="h-4 w-4 shrink-0" />
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-[#3276b1] to-blue-700 dark:from-[#539ce0] dark:to-[#3276b1] hover:from-blue-700 hover:to-blue-800 dark:hover:from-[#3276b1] dark:hover:to-[#275b89] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          <span v-if="!loading">Entrar</span>
          <span v-else class="flex items-center justify-center gap-2">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Entrando...
          </span>
        </button>
      </form>

      <div class="mt-8 text-center">
        <a href="#" class="text-sm text-gray-500 dark:text-gray-400 hover:text-[#3276b1] dark:hover:text-[#539ce0] transition-colors">
          Esqueceu sua senha?
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  pageTransition: {
    name: 'login-page',
    mode: 'out-in'
  }
})

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

onMounted(() => {
  const token = useCookie('token')
  if (token.value) router.push('/')
})

const form = ref({ login: '', senha: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    setTimeout(() => {
      if (form.value.login.length > 2 && form.value.senha.length > 2) {
        const userData = {
          login: form.value.login,
          nome: form.value.login,
          token: 'token-dummy-' + Date.now()
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        
        const tokenCookie = useCookie('token')
        tokenCookie.value = userData.token
        
        router.push('/')
      } else {
        error.value = 'Usuário ou senha incorretos'
      }
      loading.value = false
    }, 1200)
  } catch (err: any) {
    console.error('Erro no login:', err)
    error.value = 'Erro ao conectar-se com o servidor.'
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Troca de ícone do tema (sol/lua) ─────────────────────── */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.theme-icon-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
.theme-icon-enter-to   { opacity: 1; transform: rotate(0deg) scale(1); }
.theme-icon-leave-from { opacity: 1; transform: rotate(0deg) scale(1); }
.theme-icon-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.5); }

/* ── Transição da página de login ─────────────────────────── */
.login-page-enter-active { transition: opacity 350ms ease, transform 350ms ease; }
.login-page-leave-active  { transition: opacity 200ms ease, transform 200ms ease; }
.login-page-enter-from { opacity: 0; transform: scale(1.03); }
.login-page-enter-to   { opacity: 1; transform: scale(1); }
.login-page-leave-from { opacity: 1; transform: scale(1); }
.login-page-leave-to   { opacity: 0; transform: scale(0.97); }
</style>
