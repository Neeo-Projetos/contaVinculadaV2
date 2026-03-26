<template>
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
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-[#0f172a] px-4 relative overflow-hidden"
  >
    <ClientOnly>
      <FundoParticulas :color="isDark ? '#10b981' : '#64748b'" :count="60" :speed="0.4" />
    </ClientOnly>

    <div
      class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl max-w-md w-full relative z-10 p-8 pt-10 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/50 transition-colors duration-300 hover:shadow-emerald-500/10 animate-fade-in"
    >

      <div
        class="flex flex-col items-center text-center mb-10"
      >
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 transform -rotate-6">
          <Icon name="fa7-solid:building-columns" class="text-white w-8 h-8 transform rotate-6" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
          Conta<span class="font-light text-emerald-600 dark:text-emerald-400">Vinculada</span>
        </h1>
        <p class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
          Acesso Corporativo
        </p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="space-y-6"
      >
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-600 dark:text-emerald-400/90 uppercase tracking-wider pl-1">Usuário / CPF</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Icon name="fa7-solid:user" class="h-4 w-4" />
            </div>
            <input
              v-model="form.login"
              type="text"
              class="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700/70 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-400 shadow-sm"
              placeholder="Digite seu usuário"
              required
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-600 dark:text-emerald-400/90 uppercase tracking-wider pl-1">Senha</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Icon name="fa7-solid:lock" class="h-4 w-4" />
            </div>
            <input
              v-model="form.senha"
              type="password"
              class="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700/70 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-400 shadow-sm"
              placeholder="Digite sua senha"
              required
            />
          </div>
        </div>

        <div
          v-if="error"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm"
        >
          <Icon name="fa7-solid:triangle-exclamation" class="h-5 w-5 shrink-0" />
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
          :disabled="loading"
        >
          <span v-if="!loading" class="flex items-center justify-center gap-2">
            Acessar Sistema
            <Icon name="fa7-solid:arrow-right-to-bracket" />
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <Icon name="fa7-solid:circle-notch" class="animate-spin w-5 h-5" />
            Autenticando...
          </span>
        </button>
      </form>

      <div class="mt-8 text-center">
        <a href="#" class="text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
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
        
        if (process.client) {
          localStorage.setItem('user', JSON.stringify(userData))
        }
        
        const tokenCookie = useCookie('token')
        tokenCookie.value = userData.token
        
        router.push('/')
      } else {
        error.value = 'Usuário ou senha incorretos. Tente novamente.'
      }
      loading.value = false
    }, 1000)
  } catch (err: any) {
    console.error('Erro no login:', err)
    error.value = 'Erro de conexão com o servidor de autenticação.'
    loading.value = false
  }
}
</script>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.theme-icon-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
.theme-icon-enter-to   { opacity: 1; transform: rotate(0deg) scale(1); }
.theme-icon-leave-from { opacity: 1; transform: rotate(0deg) scale(1); }
.theme-icon-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.5); }

.login-page-enter-active { transition: opacity 350ms ease, transform 350ms ease; }
.login-page-leave-active  { transition: opacity 200ms ease, transform 200ms ease; }
.login-page-enter-from { opacity: 0; transform: scale(1.03); }
.login-page-enter-to   { opacity: 1; transform: scale(1); }
.login-page-leave-from { opacity: 1; transform: scale(1); }
.login-page-leave-to   { opacity: 0; transform: scale(0.97); }

input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active{
    -webkit-box-shadow: 0 0 0 30px transparent inset !important;
    -webkit-text-fill-color: #ffffff !important;
    transition: background-color 5000s ease-in-out 0s;
}

@media (prefers-color-scheme: light) {
    input:-webkit-autofill {
        -webkit-text-fill-color: #111827 !important;
    }
}
</style>