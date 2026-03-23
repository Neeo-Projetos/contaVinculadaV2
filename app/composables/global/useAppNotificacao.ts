import { ref } from 'vue'

export type TipoNotificacao = 'success' | 'error' | 'warning' | 'info'

interface Notificacao {
    id: number
    titulo: string
    mensagem: string
    tipo: TipoNotificacao
    visivel: boolean
}

const notificacaoAtiva = ref<Notificacao | null>(null)

export const useAppNotificacao = () => {
    const dispararAlerta = (titulo: string, mensagem: string, tipo: TipoNotificacao = 'info') => {
        const id = Date.now()
        notificacaoAtiva.value = { id, titulo, mensagem, tipo, visivel: true }
        
        // Auto-fechar após 5 segundos
        setTimeout(() => {
            if (notificacaoAtiva.value?.id === id) {
                notificacaoAtiva.value.visivel = false
            }
        }, 5000)
    }

    const fecharNotificacao = () => {
        if (notificacaoAtiva.value) {
            notificacaoAtiva.value.visivel = false
        }
    }

    return {
        notificacaoAtiva,
        dispararAlerta,
        fecharNotificacao
    }
}
