
const BASE_URL = 'https://api.themoviedb.org/3';
const TEMPO_LIMITE_MS = 10000;

function criarErro(mensagem, status = 502) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarResposta(dados, endpoint) {
    const caminho = endpoint.split('?')[0];

    const endpointsDeLista = [
        '/movie/popular',
        '/search/movie',
        '/search/tv',
        '/search/company',
        '/search/keyword',
        '/discover/movie',
        '/discover/tv',
        '/tv/popular'
    ];

    if (endpointsDeLista.includes(caminho)) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            !Array.isArray(dados.results)
        ) {
            throw criarErro(
                'O TMDB retornou uma lista em formato inválido'
            );
        }

        return dados;
    }

    // Detalhes de um filme
    if (/^\/movie\/\d+$/.test(caminho)) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            Array.isArray(dados) ||
            !Number.isInteger(dados.id) ||
            typeof dados.title !== 'string' ||
            !dados.title.trim()
        ) {
            throw criarErro(
                'O TMDB retornou detalhes de filme em formato inválido'
            );
        }

        return dados;
    }

    // Detalhes de uma série
    if (/^\/tv\/\d+$/.test(caminho)) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            Array.isArray(dados) ||
            !Number.isInteger(dados.id) ||
            typeof dados.name !== 'string' ||
            !dados.name.trim()
        ) {
            throw criarErro(
                'O TMDB retornou detalhes de série em formato inválido'
            );
        }

        return dados;
    }

    // Detalhes de um episódio
    if (/^\/tv\/\d+\/season\/\d+\/episode\/\d+$/.test(caminho)) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            Array.isArray(dados) ||
            !Number.isInteger(dados.id) ||
            typeof dados.name !== 'string' ||
            !dados.name.trim() ||
            !Number.isInteger(dados.episode_number)
        ) {
            throw criarErro(
                'O TMDB retornou detalhes de episódio em formato inválido'
            );
        }

        return dados;
    }

    // Validação genérica para outros endpoints
    if (
        !dados ||
        typeof dados !== 'object' ||
        Array.isArray(dados)
    ) {
        throw criarErro(
            'O TMDB retornou uma resposta em formato inválido'
        );
    }

    return dados;
}

async function requisitar(endpoint) {
    const token = process.env.TMDB_BEARER_TOKEN;

    if (!token || !token.trim()) {
        throw criarErro(
            'Token do TMDB não configurado no servidor',
            500
        );
    }

    let resposta;

    try {
        resposta = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json'
            },
            signal: AbortSignal.timeout(TEMPO_LIMITE_MS)
        });
    } catch (causa) {
        const expirou =
            causa.name === 'TimeoutError' ||
            causa.name === 'AbortError';

        throw criarErro(
            expirou
                ? 'O TMDB demorou demais para responder'
                : 'Não foi possível conectar ao TMDB',
            expirou ? 504 : 502
        );
    }

    if (!resposta.ok) {
        let mensagem;
        let status;

        switch (resposta.status) {
            case 401:
            case 403:
                mensagem =
                    'Falha de autenticação ao consultar o TMDB';
                status = 502;
                break;

            case 404:
                mensagem =
                    'Filme, série ou recurso não encontrado no TMDB';
                status = 404;
                break;

            case 429:
                mensagem =
                    'Limite de requisições do TMDB atingido';
                status = 503;
                break;

            default:
                if (resposta.status >= 500) {
                    mensagem =
                        'O serviço do TMDB está indisponível';
                } else {
                    mensagem =
                        'Não foi possível concluir a consulta ao TMDB';
                }

                status = 502;
        }

        const erro = criarErro(mensagem, status);
        const retryAfter = resposta.headers.get('retry-after');

        if (retryAfter) {
            erro.retryAfter = retryAfter;
        }

        throw erro;
    }

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw criarErro(
            'O TMDB retornou uma resposta que não é JSON válido'
        );
    }

    return validarResposta(dados, endpoint);
}

module.exports = { requisitar };
