import { computed } from 'vue'

export const useTheme = () => {
    const colorMode = useColorMode()

    const isDark = computed(() => colorMode.value === 'dark')

    const toggleTheme = () => {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }

    return {
        isDark,
        toggleTheme,
        theme: computed(() => colorMode.value)
    }
}
