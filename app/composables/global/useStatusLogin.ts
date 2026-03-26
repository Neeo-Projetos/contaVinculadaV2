export const useStatusLogin = () => {
    // Estado que indica se o usuário acabou de vir da tela de login
    const isPrimeiroAcessoAposLogin = useState('isPrimeiroAcessoAposLogin', () => false)
    
    // Estado que controla a visibilidade da cortina (pode ser fechada pela página)
    const isCurtainGlobal = useState('isCurtainGlobal', () => false)

    return {
        isPrimeiroAcessoAposLogin,
        isCurtainGlobal
    }
}
