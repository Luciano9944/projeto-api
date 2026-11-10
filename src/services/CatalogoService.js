
const repository = require('../repositories/CatalogoRepository');
const tmdb = require('../config/tmdb');

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(id) {
    const texto = String(id);

    if (!/^\d+$/.test(texto)) {
        throw criarErro('ID do conteúdo inválido.');
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro('ID do conteúdo inválido.');
    }

    return numero;
}

function validarTipo(tipo) {
    if (!['filme', 'serie'].includes(tipo)) {
        throw criarErro(
            'O tipo de conteúdo deve ser filme ou serie.'
        );
    }

    return tipo;
}

function validarTmdbId(id) {
    if (typeof id !== 'number' && (typeof id !== 'string' || !/^\d+$/.test(id.trim()))) {
        throw criarErro('ID do TMDB inválido.');
    }

    const numero = Number(id);

    if (
        !Number.isSafeInteger(numero) ||
        numero < 1
    ) {
        throw criarErro('ID do TMDB inválido.');
    }

    return numero;
}

function validarTitulo(titulo) {
    if (typeof titulo !== 'string') {
        throw criarErro('Informe um título válido.');
    }

    const texto = titulo.trim();

    if (!texto || texto.length > 255) {
        throw criarErro(
            'O título deve possuir entre 1 e 255 caracteres.'
        );
    }

    return texto;
}

function validarSinopse(sinopse) {
    if (sinopse === undefined || sinopse === null) {
        return null;
    }

    if (typeof sinopse !== 'string') {
        throw criarErro('A sinopse deve ser um texto.');
    }

    const texto = sinopse.trim();

    if (texto.length > 10000) {
        throw criarErro(
            'A sinopse deve ter no máximo 10000 caracteres.'
        );
    }

    return texto || null;
}

function validarData(data) {
    if (data === undefined || data === null || data === '') {
        return null;
    }

    if (
        typeof data !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        throw criarErro('A data de lançamento é inválida.');
    }

    const dataValida = new Date(`${data}T00:00:00.000Z`);

    if (
        Number.isNaN(dataValida.getTime()) ||
        dataValida.toISOString().slice(0, 10) !== data
    ) {
        throw criarErro('A data de lançamento é inválida.');
    }

    return data;
}

function validarPoster(poster) {
    if (poster === undefined || poster === null || poster === '') {
        return null;
    }

    if (
        typeof poster !== 'string' ||
        !poster.startsWith('/')
    ) {
        throw criarErro('O caminho do pôster é inválido.');
    }

    return poster;
}

function validarNota(nota) {
    if (nota === undefined || nota === null || nota === '') {
        return null;
    }

    const numero = Number(nota);

    if (
        !Number.isFinite(numero) ||
        numero < 0 ||
        numero > 10
    ) {
        throw criarErro(
            'A nota média deve estar entre 0 e 10.'
        );
    }

    return numero;
}

function validarDados(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw criarErro('Informe os dados do conteúdo.');
    }

    return {
        tipo_conteudo: validarTipo(dados.tipo_conteudo),
        tmdb_id: validarTmdbId(dados.tmdb_id),
        titulo: validarTitulo(dados.titulo),
        sinopse: validarSinopse(dados.sinopse),
        data_lancamento: validarData(dados.data_lancamento),
        poster_path: validarPoster(dados.poster_path),
        nota_media: validarNota(dados.nota_media)
    };
}

// Pesquisa filmes ou séries no TMDB.
async function pesquisarNoTmdb(tipo, consulta) {
    validarTipo(tipo);

    if (typeof consulta !== 'string' || !consulta.trim()) {
        throw criarErro('Informe um termo para pesquisa.');
    }

    const termo = consulta.trim();

    if (termo.length > 150) {
        throw criarErro(
            'O termo de pesquisa deve ter no máximo 150 caracteres.'
        );
    }

    const endpoint = tipo === 'filme'
        ? '/search/movie'
        : '/search/tv';

    const parametros = new URLSearchParams({
        query: termo,
        language: 'pt-BR',
        page: '1',
        include_adult: 'false'
    });

    const resposta = await tmdb.requisitar(
        `${endpoint}?${parametros.toString()}`
    );

    return resposta.results.map(item => ({
        tmdb_id: item.id,
        tipo_conteudo: tipo,
        titulo: tipo === 'filme' ? item.title : item.name,
        sinopse: item.overview || null,
        data_lancamento: tipo === 'filme'
            ? item.release_date || null
            : item.first_air_date || null,
        poster_path: item.poster_path || null,
        nota_media: Number.isFinite(item.vote_average)
            ? item.vote_average
            : null
    }));
}

async function listarTodos(tipo) {
    if (tipo !== undefined && tipo !== null && tipo !== '') {
        validarTipo(tipo);
    }

    return repository.listarTodos(tipo || null);
}

async function buscarPorId(id) {
    const conteudoId = validarId(id);

    const conteudo = await repository.buscarPorId(conteudoId);

    if (!conteudo) {
        throw criarErro('Conteúdo não encontrado.', 404);
    }

    return conteudo;
}

async function cadastrar(dados, usuarioId) {
    const conteudo = validarDados(dados);

    try {
        return await repository.cadastrar({
            ...conteudo,
            criado_por: usuarioId
        });
    } catch (erro) {
        if (erro.code === '23505' && erro.constraint === 'conteudo_tmdb_unico') {
            throw criarErro('Este título já está registrado no catálogo.', 409);
        }

        throw erro;
    }
}

async function atualizar(id, dados) {
    const conteudoId = validarId(id);

    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw criarErro('Informe os dados para atualização.');
    }

    const titulo = validarTitulo(dados.titulo);
    const sinopse = validarSinopse(dados.sinopse);
    const dataLancamento = validarData(dados.data_lancamento);
    const posterPath = validarPoster(dados.poster_path);
    const notaMedia = validarNota(dados.nota_media);

    const conteudo = await repository.atualizar(conteudoId, {
        titulo,
        sinopse,
        data_lancamento: dataLancamento,
        poster_path: posterPath,
        nota_media: notaMedia
    });

    if (!conteudo) {
        throw criarErro('Conteúdo não encontrado.', 404);
    }

    return conteudo;
}

async function desativar(id) {
    const conteudoId = validarId(id);

    const conteudo = await repository.desativar(conteudoId);

    if (!conteudo) {
        throw criarErro('Conteúdo não encontrado.', 404);
    }

    return {
        mensagem: 'Conteúdo desativado com sucesso.',
        conteudo
    };
}

module.exports = {
    pesquisarNoTmdb,
    listarTodos,
    buscarPorId,
    cadastrar,
    atualizar,
    desativar
};
