
const repository = require('../repositories/FilmeRepository');

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
            'Informe o nome do filme para pesquisar'
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

function validarTermoOpcional(termo) {
    if (termo === undefined || termo === null || termo === '') {
        return 'Marvel';
    }

    if (typeof termo !== 'string') {
        throw criarErro('O termo de pesquisa deve ser um texto');
    }

    const consulta = termo.trim();

    if (!consulta) {
        return 'Marvel';
    }

    if (consulta.length > 100) {
        throw criarErro(
            'O termo de pesquisa deve ter no máximo 100 caracteres'
        );
    }

    return consulta;
}

async function listarPopulares(pagina) {
    return repository.listarPopulares(
        validarPagina(pagina)
    );
}

async function buscarPorNome(query, pagina) {
    return repository.buscarPorNome(
        validarConsulta(query),
        validarPagina(pagina)
    );
}

async function listarMarvel(pagina) {
    return repository.listarMarvel(
        validarPagina(pagina)
    );
}

async function buscarPorId(id) {
    return repository.buscarPorId(
        validarId(id)
    );
}

async function buscarEmpresasMarvel(termo, pagina) {
    return repository.buscarEmpresasMarvel(
        validarTermoOpcional(termo),
        validarPagina(pagina)
    );
}

async function buscarPalavrasChaveMarvel(termo, pagina) {
    return repository.buscarPalavrasChaveMarvel(
        validarTermoOpcional(termo),
        validarPagina(pagina)
    );
}

async function buscarElenco(id) {
    const creditos = await repository.buscarCreditos(
        validarId(id)
    );

    return {
        filme_id: creditos.id,
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
        filme_id: creditos.id,
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
    listarPopulares,
    buscarPorNome,
    listarMarvel,
    buscarPorId,
    buscarEmpresasMarvel,
    buscarPalavrasChaveMarvel,
    buscarElenco,
    buscarEquipe
};
