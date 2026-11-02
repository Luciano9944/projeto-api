
const service = require('../services/ComentarioService');

// Cria um comentário.
async function criar(req, res, next) {
    try {
        const { tipo_conteudo, conteudo_id, texto } = req.body;

        const comentario = await service.criar(
            req.session.usuario.id,
            tipo_conteudo,
            conteudo_id,
            texto
        );

        return res.status(201).json({
            mensagem: 'Comentário publicado com sucesso.',
            comentario
        });
    } catch (erro) {
        next(erro);
    }
}

// Lista todos os comentários de um conteúdo.
async function listarPorConteudo(req, res, next) {
    try {
        const { tipo, conteudoId } = req.params;

        const comentarios = await service.listarPorConteudo(
            tipo,
            conteudoId
        );

        return res.status(200).json({
            total: comentarios.length,
            comentarios
        });
    } catch (erro) {
        next(erro);
    }
}

// Lista os comentários do usuário autenticado.
async function listarPorUsuario(req, res, next) {
    try {
        const comentarios = await service.listarPorUsuario(
            req.session.usuario.id
        );

        return res.status(200).json({
            total: comentarios.length,
            comentarios
        });
    } catch (erro) {
        next(erro);
    }
}

// Atualiza um comentário do usuário.
async function atualizar(req, res, next) {
    try {
        const { id } = req.params;
        const { texto } = req.body;

        const comentario = await service.atualizar(
            id,
            req.session.usuario.id,
            texto
        );

        return res.status(200).json({
            mensagem: 'Comentário atualizado com sucesso.',
            comentario
        });
    } catch (erro) {
        next(erro);
    }
}

// Remove um comentário do usuário.
async function remover(req, res, next) {
    try {
        const { id } = req.params;

        await service.remover(
            id,
            req.session.usuario.id
        );

        return res.status(200).json({
            mensagem: 'Comentário removido com sucesso.'
        });
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    criar,
    listarPorConteudo,
    listarPorUsuario,
    atualizar,
    remover
};
