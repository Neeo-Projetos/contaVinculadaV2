import { useLocalStorage } from '@vueuse/core'

/**
 * Composable para gerenciar as configurações de interface e acessibilidade.
 * "Fiz o gerenciamento centralizado das preferências do usuário para garantir consistência em todo o sistema."
 */
export const useInterfaceSettings = () => {
  // Configurações persistidas no localStorage
  const settings = useLocalStorage('cv-interface-settings', {
    tema: 'system', // 'light', 'dark', 'system'
    daltonismo: 'normal', // 'normal', 'protanopia', 'deuteranopia', 'tritanopia'
    escalaFonte: 100, // 80, 100, 120, 150
    reduzirMovimento: false,
    altoContraste: false
  })

  // Aplica as configurações no nível global (html/body)
  const aplicarConfiguracoes = () => {
    if (process.server) return

    const el = document.documentElement
    
    // Limpamos classes anteriores de daltonismo
    el.classList.remove('mode-protanopia', 'mode-deuteranopia', 'mode-tritanopia')
    
    // 1. Daltonismo (Classes CSS)
    if (settings.value.daltonismo !== 'normal') {
      el.classList.add(`mode-${settings.value.daltonismo}`)
    }

    // 2. Escala de Fonte (Variável CSS)
    el.style.setProperty('--cv-font-scale', `${settings.value.escalaFonte}%`)

    // 3. Reduzir Movimento
    if (settings.value.reduzirMovimento) {
      el.classList.add('reduce-motion')
    } else {
      el.classList.remove('reduce-motion')
    }

    // 4. Alto Contraste
    if (settings.value.altoContraste) {
      el.classList.add('high-contrast')
    } else {
      el.classList.remove('high-contrast')
    }
  }

  // Observa mudanças e aplica
  watch(settings, () => {
    aplicarConfiguracoes()
  }, { deep: true, immediate: true })

  return {
    settings,
    aplicarConfiguracoes
  }
}
