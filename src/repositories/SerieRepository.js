
const tmdb = require('../config/tmdb');

const EMPRESAS_MARVEL = '420|11106';

async function listarMarvel(pagina = 1) {
    const parametros = new URLSearchParams({
        with_companies: EMPRESAS_MARVEL,
        sort_by: 'popularity.desc',
        page: String(pagina)
    });

    return tmdb.requisitar(`/discover/tv?${parametros}`);
}

async function listarPopulares(pagina = 1) {
    return tmdb.requisitar(`/tv/popular?page=${pagina}`);
}

async function buscarPorNome(query, pagina = 1) {
    const parametros = new URLSearchParams({
        query,
        page: String(pagina)
    });

    return tmdb.requisitar(`/search/tv?${parametros}`);
}

async function buscarPorId(id) {
    return tmdb.requisitar(`/tv/${id}`);
}


async function buscarTemporada(id, temporada) {
    return tmdb.requisitar(
        `/tv/${id}/season/${temporada}`
    );
}

async function buscarEpisodio(id, temporada, episodio) {
    return tmdb.requisitar(
        `/tv/${id}/season/${temporada}/episode/${episodio}`
    );
}

async function buscarCreditos(id) {
    return tmdb.requisitar(`/tv/${id}/credits`);
}


module.exports = {
    listarMarvel,
    listarPopulares,
    buscarPorNome,
    buscarPorId,
    buscarTemporada,
    buscarEpisodio,
    buscarCreditos
};
