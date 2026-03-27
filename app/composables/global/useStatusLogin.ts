export const useStatusLogin = () => {
    const primeiroAcessoLogin = useState('primeiroAcessoLogin', () => false)
    
    const isCurtainGlobal = useState('isCurtainGlobal', () => false)

    return {
        primeiroAcessoLogin,
        isCurtainGlobal
    }
}
