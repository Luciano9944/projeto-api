
const repository = require('../repositories/ComentarioRepository');

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

// Valida o ID de um comentário.
function validarComentarioId(comentarioId) {
    const id = String(comentarioId ?? '').trim();

    if (!/^[1-9]\d*$/.test(id)) {
        const erro = new Error('Informe um ID de comentário válido.');
        erro.status = 400;
        throw erro;
    }

    return id;
}

// Valida o texto do comentário.
function validarTexto(texto) {
    if (typeof texto !== 'string') {
        const erro = new Error('O comentário deve ser um texto.');
        erro.status = 400;
        throw erro;
    }

    const textoValidado = texto.trim();

    if (textoValidado.length === 0) {
        const erro = new Error('O comentário não pode estar vazio.');
        erro.status = 400;
        throw erro;
    }

    if (textoValidado.length > 3000) {
        const erro = new Error(
            'O comentário deve ter no máximo 3000 caracteres.'
        );
        erro.status = 400;
        throw erro;
    }

    return textoValidado;
}

// Cria um comentário.
async function criar(usuarioId, tipoConteudo, conteudoId, texto) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    validarTipoConteudo(tipoConteudo);

    const conteudoValidado = validarConteudoId(conteudoId);
    const textoValidado = validarTexto(texto);

    return repository.criar(
        usuarioValidado,
        tipoConteudo,
        conteudoValidado,
        textoValidado
    );
}

// Lista todos os comentários de um conteúdo.
async function listarPorConteudo(tipoConteudo, conteudoId) {
    validarTipoConteudo(tipoConteudo);

    const conteudoValidado = validarConteudoId(conteudoId);

    return repository.listarPorConteudo(
        tipoConteudo,
        conteudoValidado
    );
}

// Lista os comentários do usuário autenticado.
async function listarPorUsuario(usuarioId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    return repository.listarPorUsuario(usuarioValidado);
}

// Atualiza um comentário do usuário.
async function atualizar(id, usuarioId, texto) {
    const comentarioId = validarComentarioId(id);
    const usuarioValidado = validarUsuarioId(usuarioId);
    const textoValidado = validarTexto(texto);

    const comentario = await repository.buscarPorId(comentarioId);

    if (!comentario) {
        const erro = new Error('Comentário não encontrado.');
        erro.status = 404;
        throw erro;
    }

    if (String(comentario.usuario_id) !== String(usuarioValidado)) {
        const erro = new Error(
            'Você não tem permissão para editar este comentário.'
        );
        erro.status = 403;
        throw erro;
    }

    return repository.atualizar(
        comentarioId,
        usuarioValidado,
        textoValidado
    );
}

// Remove um comentário do usuário.
async function remover(id, usuarioId) {
    const comentarioId = validarComentarioId(id);
    const usuarioValidado = validarUsuarioId(usuarioId);

    const comentario = await repository.buscarPorId(comentarioId);

    if (!comentario) {
        const erro = new Error('Comentário não encontrado.');
        erro.status = 404;
        throw erro;
    }

    if (String(comentario.usuario_id) !== String(usuarioValidado)) {
        const erro = new Error(
            'Você não tem permissão para excluir este comentário.'
        );
        erro.status = 403;
        throw erro;
    }

    await repository.remover(comentarioId, usuarioValidado);

    return {
        id: comentarioId
    };
}

module.exports = {
    criar,
    listarPorConteudo,
    listarPorUsuario,
    atualizar,
    remover
};
