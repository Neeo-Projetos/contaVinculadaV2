export const useDashboardData = () => {
    const stats = useState('dashboardStats', () => ({
        funcionariosAtivos: 0,
        funcionariosTotal: 0,
        totalContracheques: 0,
        totalLancamentosManuais: 0,
        totalReembolsos: 0,
    }))

    const chartData = useState('dashboardChartData', () => [] as any[])
    const isDataLoaded = useState('isDashboardDataLoaded', () => false)

    const fetchDashboardData = async (force = false) => {
        if (isDataLoaded.value && !force) return

        try {
            const [resStats, resChart] = await Promise.all([
                $fetch<any>('/api/dashboard/stats'),
                $fetch<any>('/api/dashboard/movimentacaoMensal'),
                // Mantemos o delay apenas no primeiro carregamento real
                new Promise(resolve => setTimeout(resolve, 1500))
            ])

            if (resStats?.status === 'success') stats.value = resStats.data
            if (resChart?.status === 'success') chartData.value = resChart.data
            
            isDataLoaded.value = true
        } catch (e) {
            console.error('Erro ao buscar dados do dashboard:', e)
            throw e
        }
    }

    return {
        stats,
        chartData,
        isDataLoaded,
        fetchDashboardData
    }
}
