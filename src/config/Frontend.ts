/**
 * ARQUIVO: Frontend.ts
 * 
 * PROPÓSITO: Este arquivo centraliza todas as configurações do frontend da aplicação.
 * É como um "painel de controle" onde ficam guardadas as informações importantes
 * que o app precisa para rodar corretamente (URLs, ambiente, etc).
 * 
 * POR QUE USAR? Ao invés de espalhar URLs e configurações por toda a aplicação,
 * guardamos tudo aqui num único lugar. Assim, se precisar mudar algo, muda apenas aqui.
 */

/**
 * FUNÇÃO: getEnv(key)
 * 
 * O QUE FAZ: Procura por uma variável de ambiente (vem do arquivo .env)
 * 
 * EXEMPLO DE USO:
 * - Você cria um arquivo .env com: VITE_API_URL=http://localhost:3000
 * - Depois chama: getEnv('VITE_API_URL')
 * - Ela retorna: 'http://localhost:3000'
 * 
 * PROTEÇÃO: Se a variável não existir, gera um erro claríssimo para ajudar o dev a arrumar
 * 
 * PARÂMETRO:
 * - key: O nome da variável que você quer procurar (ex: 'VITE_API_URL')
 * 
 * RETORNO:
 * - A string com o valor da variável (ex: 'http://localhost:3000')
 */
const getEnv = (key: string): string => {
    // import.meta.env é um objeto especial do Vite que contém as variáveis de ambiente
    const value = import.meta.env[key];

    // Validação: Se a variável não foi definida ou está vazia, para tudo e mostra erro
    if (!value) {
        throw new Error(
            `Configuração obrigatória faltando: ${key}. Verifique seus arquivos .env`
        );
    }

    // Se chegou aqui, significa que a variável existe e tem um valor. Retorna ela!
    return value;
};

/**
 * OBJETO: FrontendConfig
 * 
 * O QUE É: Um objeto (caixa de ferramentas) que exporta todas as configurações
 * que o frontend precisa para funcionar corretamente
 * 
 * COMO USAR EM OUTRO ARQUIVO:
 * import { FrontendConfig } from '@/config/Frontend';
 * console.log(FrontendConfig.api.baseUrl); // Mostra a URL do backend
 */
export const FrontendConfig = {
    /**
     * SEÇÃO: api
     * Configurações relacionadas ao servidor backend
     */
    api: {
        /**
         * baseUrl: A URL principal do servidor backend
         * 
         * EXEMPLO: Se o backend está rodando em http://localhost:3000
         * então baseUrl será 'http://localhost:3000'
         * 
         * PARA ONDE VAI? Qualquer requisição HTTP que o frontend fizer
         * usa essa URL como base. Ex: baseUrl + '/users' = 'http://localhost:3000/users'
         */
        baseUrl: getEnv('VITE_API_URL'),
    },

    /**
     * SEÇÃO: Detecção de Ambiente
     * Essas variáveis dizem se a aplicação está rodando em desenvolvimento ou produção
     */

    /**
     * isProduction: Booleano (true/false) que diz se estamos em ambiente de produção
     * 
     * QUANDO É TRUE:
     * - App foi compilado para produção (npm run build)
     * - Está sendo servido para usuários reais
     * - Devemos usar URLs reais do servidor
     * 
     * QUANDO É FALSE:
     * - Estamos desenvolvendo (npm run dev)
     * - Podemos usar dados de teste
     */
    isProduction: import.meta.env.PROD,

    /**
     * isDevelopment: Booleano (true/false) que diz se estamos em ambiente de desenvolvimento
     * 
     * QUANDO É TRUE:
     * - Estamos rodando npm run dev
     * - Podemos ativar logs extras, debug tools, dados fake, etc
     * 
     * QUANDO É FALSE:
     * - App foi construído para produção
     */
    isDevelopment: import.meta.env.DEV,
};