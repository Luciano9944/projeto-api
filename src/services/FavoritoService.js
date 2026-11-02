
const repository = require('../repositories/FavoritoRepository');

// Valida o tipo de conteúdo.
function validarTipoConteudo(tipoConteudo) {
    if (!['filme', 'serie'].includes(tipoConteudo)) {
        const erro = new Error(
            'O tipo de conteúdo deve ser filme ou serie.'
        );
        erro.status = 400;
        throw erro;
    }
}

// Valida o ID do conteúdo do TMDB.
function validarConteudoId(conteudoId) {
    const id = String(conteudoId ?? '').trim();

    if (!/^[1-9]\d*$/.test(id)) {
        const erro = new Error('Informe um ID de conteúdo válido.');
        erro.status = 400;
        throw erro;
    }

    return id;
}

// Valida o ID do usuário autenticado.
function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(Number(usuarioId)) || Number(usuarioId) <= 0) {
        const erro = new Error('Usuário inválido.');
        erro.status = 401;
        throw erro;
    }

    return Number(usuarioId);
}

// Adiciona um conteúdo aos favoritos.
async function adicionar(usuarioId, tipoConteudo, conteudoId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    validarTipoConteudo(tipoConteudo);

    const conteudoValidado = validarConteudoId(conteudoId);

    const favorito = await repository.adicionar(
        usuarioValidado,
        tipoConteudo,
        conteudoValidado
    );

    return {
        favoritado: true,
        novo: Boolean(favorito),
        favorito: favorito || {
            usuario_id: usuarioValidado,
            tipo_conteudo: tipoConteudo,
            conteudo_id: conteudoValidado
        }
    };
}

// Remove um conteúdo dos favoritos.
async function remover(usuarioId, tipoConteudo, conteudoId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    validarTipoConteudo(tipoConteudo);

    const conteudoValidado = validarConteudoId(conteudoId);

    const favorito = await repository.remover(
        usuarioValidado,
        tipoConteudo,
        conteudoValidado
    );

    if (!favorito) {
        const erro = new Error('Este conteúdo não está nos seus favoritos.');
        erro.status = 404;
        throw erro;
    }

    return favorito;
}

// Lista os favoritos do usuário.
async function listarPorUsuario(usuarioId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    return repository.listarPorUsuario(usuarioValidado);
}

// Verifica se um conteúdo está favoritado.
async function verificar(usuarioId, tipoConteudo, conteudoId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    validarTipoConteudo(tipoConteudo);

    const conteudoValidado = validarConteudoId(conteudoId);

    const favorito = await repository.buscar(
        usuarioValidado,
        tipoConteudo,
        conteudoValidado
    );

    return {
        favoritado: Boolean(favorito)
    };
}

module.exports = {
    adicionar,
    remover,
    listarPorUsuario,
    verificar
};
