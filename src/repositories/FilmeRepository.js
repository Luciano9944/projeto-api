
const tmdb = require('../config/tmdb');

const CACHE_TTL = 30 * 60 * 1000;

let cacheMarvel = {
    filmes: null,
    atualizadoEm: 0
};

// Compartilha o carregamento entre requisições simultâneas.
let carregamentoMarvel = null;

const idsIgnoradosMarvel = new Set([
    244888, // Jack Kirby: Story Teller
    52462,  // The Pet
    39037,  // The Good Guy
    14612,  // Candleshoe
    33997,  // Desert Flower
    200505, // Draft Day
    246355  // Saw (Jogos Mortais)
]);

async function listarPopulares(pagina = 1) {
    return tmdb.requisitar(
        `/movie/popular?language=pt-BR&page=${pagina}`
    );
}

async function buscarPorNome(query, pagina = 1) {
    const consulta = encodeURIComponent(query);

    return tmdb.requisitar(
        `/search/movie?query=${consulta}&language=pt-BR&page=${pagina}`
    );
}

async function buscarPorId(id) {
    return tmdb.requisitar(
        `/movie/${id}?language=pt-BR`
    );
}

async function carregarFilmesMarvel() {
    const filmesUnicos = new Map();

    // 1. Busca a primeira página de filmes da Marvel Studios.
    const primeiraPagina = await tmdb.requisitar(
        '/discover/movie?with_companies=420&sort_by=popularity.desc&language=pt-BR&page=1'
    );

    const totalPaginas = Math.max(
        1,
        Math.min(primeiraPagina.total_pages || 1, 10)
    );

    for (const filme of primeiraPagina.results) {
        filmesUnicos.set(filme.id, filme);
    }

    // 2. Busca as páginas restantes em paralelo.
    const resultadosPaginas = await Promise.allSettled(
        Array.from({ length: totalPaginas - 1 }, (_, i) =>
            tmdb.requisitar(
                `/discover/movie?with_companies=420&sort_by=popularity.desc&language=pt-BR&page=${i + 2}`
            )
        )
    );

    for (const resultado of resultadosPaginas) {
        // Uma falha não interrompe o processamento das outras páginas.
        if (resultado.status !== 'fulfilled') {
            continue;
        }

        for (const filme of resultado.value.results) {
            filmesUnicos.set(filme.id, filme);
        }
    }

    // 3. IDs conhecidos de adaptações Marvel de diferentes produtoras.
    const idsFilmesConhecidos = [
        // Homem-Aranha — Tobey Maguire
        557, 558, 559,

        // Homem-Aranha — Andrew Garfield
        1930, 102382,

        // X-Men e Wolverine
        36657, 36658, 36668, 2080, 49538,
        76170, 127585, 263115, 320288, 340102,

        // Deadpool
        293660, 383498,

        // Blade
        36647, 36586, 36648,

        // Motoqueiro Fantasma
        1250, 71676,

        // Quarteto Fantástico
        9738, 1979, 166424,

        // Demolidor, Elektra e Justiceiro
        9480, 9947, 7220, 13056,

        // Venom
        335983,

        // Animações do Aranhaverso
        324857, 569094,

        // Outras animações baseadas em personagens Marvel
        177572, 33997, 16237, 39037, 52462,
        200505, 246355, 14609, 14611, 16236, 14612
    ];

    // 4. Busca os detalhes dos filmes conhecidos.
    const detalhesFilmes = await Promise.allSettled(
        idsFilmesConhecidos.map(id =>
            tmdb.requisitar(`/movie/${id}?language=pt-BR`)
        )
    );

    for (const resultado of detalhesFilmes) {
        if (resultado.status !== 'fulfilled') {
            continue;
        }

        const filme = resultado.value;

        if (filme.id && filme.title && !filme.adult) {
            filmesUnicos.set(filme.id, filme);
        }
    }

    // 5. Filtra os filmes e ordena por popularidade.
    return [...filmesUnicos.values()]
        .filter(filme =>
            filme.id &&
            filme.title &&
            filme.poster_path &&
            !filme.adult &&
            !idsIgnoradosMarvel.has(filme.id)
        )
        .sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );
}

async function listarMarvel(pagina = 1) {
    const agora = Date.now();

    const cacheValido =
        cacheMarvel.filmes !== null &&
        agora - cacheMarvel.atualizadoEm < CACHE_TTL;

    let filmes;

    if (cacheValido) {
        // Reutiliza os filmes já carregados.
        filmes = cacheMarvel.filmes;
    } else {
        // Só inicia uma carga se não existir outra em andamento.
        if (!carregamentoMarvel) {
            carregamentoMarvel = carregarFilmesMarvel()
                .then(filmesCarregados => {
                    cacheMarvel = {
                        filmes: filmesCarregados,
                        atualizadoEm: Date.now()
                    };

                    return filmesCarregados;
                })
                .finally(() => {
                    carregamentoMarvel = null;
                });
        }

        // Requisições simultâneas aguardam a mesma carga.
        filmes = await carregamentoMarvel;
    }

    // 6. Pagina a lista consolidada.
    const porPagina = 20;
    const inicio = (pagina - 1) * porPagina;

    return {
        page: pagina,
        results: filmes.slice(inicio, inicio + porPagina),
        total_pages: Math.ceil(filmes.length / porPagina),
        total_results: filmes.length
    };
}

async function buscarEmpresasMarvel(termo = 'Marvel', pagina = 1) {
    return tmdb.requisitar(
        `/search/company?query=${encodeURIComponent(termo)}&page=${pagina}`
    );
}

async function buscarPalavrasChaveMarvel(termo = 'Marvel', pagina = 1) {
    return tmdb.requisitar(
        `/search/keyword?query=${encodeURIComponent(termo)}&page=${pagina}`
    );
}

module.exports = {
    listarPopulares,
    buscarPorNome,
    buscarPorId,
    listarMarvel,
    buscarEmpresasMarvel,
    buscarPalavrasChaveMarvel
};
