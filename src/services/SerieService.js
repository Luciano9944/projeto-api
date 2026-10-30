
const repository = require('../repositories/SerieRepository');

function criarErro(mensagem) {
    const erro = new Error(mensagem);
    erro.status = 400;
    return erro;
}

function validarPagina(pagina) {
    if (pagina === undefined || pagina === null || pagina === '') {
        return 1;
    }

    const texto = String(pagina);

    if (!/^\d+$/.test(texto)) {
        throw criarErro(
            'A página deve ser um número inteiro positivo'
        );
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro(
            'A página deve ser um número inteiro positivo'
        );
    }

    return numero;
}

function validarId(id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
        throw criarErro('ID inválido');
    }

    const texto = String(id);

    if (!/^\d+$/.test(texto)) {
        throw criarErro('ID inválido');
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro('ID inválido');
    }

    return numero;
}

function validarConsulta(query) {
    if (typeof query !== 'string' || !query.trim()) {
        throw criarErro(
            'Informe o nome da série para pesquisar'
        );
    }

    const consulta = query.trim();

    if (consulta.length > 100) {
        throw criarErro(
            'A pesquisa deve ter no máximo 100 caracteres'
        );
    }

    return consulta;
}

async function listarMarvel(pagina) {
    return repository.listarMarvel(validarPagina(pagina));
}

async function listarPopulares(pagina) {
    return repository.listarPopulares(validarPagina(pagina));
}

async function buscarPorNome(query, pagina) {
    return repository.buscarPorNome(
        validarConsulta(query),
        validarPagina(pagina)
    );
}


async function buscarPorId(id) {
    const serie = await repository.buscarPorId(
        validarId(id)
    );

    return {
        id: serie.id,
        nome: serie.name,
        sinopse: serie.overview,
        data_estreia: serie.first_air_date,
        data_ultima_exibicao: serie.last_air_date,
        temporadas: serie.number_of_seasons,
        episodios: serie.number_of_episodes,
        situacao: serie.status,
        em_producao: serie.in_production
    };
}

function validarTemporada(temporada) {
    const texto = String(temporada);

    if (!/^\d+$/.test(texto)) {
        throw criarErro(
            'A temporada deve ser um número inteiro não negativo'
        );
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero < 0) {
        throw criarErro(
            'A temporada deve ser um número inteiro não negativo'
        );
    }

    return numero;
}

async function buscarTemporada(id, temporada) {
    return repository.buscarTemporada(
        validarId(id),
        validarTemporada(temporada)
    );
}

async function buscarEpisodio(id, temporada, episodio) {
    const serieId = validarId(id);
    const numeroTemporada = validarTemporada(temporada);
    const numeroEpisodio = validarTemporada(episodio);

    if (numeroEpisodio < 1) {
        throw criarErro(
            'O número do episódio deve ser maior que zero'
        );
    }

    return repository.buscarEpisodio(
        serieId,
        numeroTemporada,
        numeroEpisodio
    );
}

async function buscarElenco(id) {
    const creditos = await repository.buscarCreditos(
        validarId(id)
    );

    return {
        serie_id: creditos.id,
        elenco: (creditos.cast || []).map(ator => ({
            id: ator.id,
            nome: ator.name,
            personagem: ator.character,
            foto: ator.profile_path
        }))
    };
}

async function buscarEquipe(id) {
    const creditos = await repository.buscarCreditos(
        validarId(id)
    );

    return {
        serie_id: creditos.id,
        equipe: (creditos.crew || []).map(profissional => ({
            id: profissional.id,
            nome: profissional.name,
            departamento: profissional.department,
            funcao: profissional.job,
            foto: profissional.profile_path
        }))
    };
}



module.exports = {
    listarMarvel,
    listarPopulares,
    buscarPorNome,
    buscarPorId,
    buscarTemporada,
    buscarEpisodio,
    buscarElenco,
    buscarEquipe
};
