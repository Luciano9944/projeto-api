
const service = require('../services/FavoritoService');

// Adiciona um favorito.
async function adicionar(req, res, next) {
    try {
        const { tipo_conteudo, conteudo_id } = req.body;

        const resultado = await service.adicionar(
            req.session.usuario.id,
            tipo_conteudo,
            conteudo_id
        );

        return res.status(resultado.novo ? 201 : 200).json({
            mensagem: resultado.novo
                ? 'Conteúdo adicionado aos favoritos.'
                : 'Este conteúdo já está nos seus favoritos.',
            ...resultado
        });
    } catch (erro) {
        next(erro);
    }
}

// Remove um favorito.
async function remover(req, res, next) {
    try {
        const { tipo, conteudoId } = req.params;

        await service.remover(
            req.session.usuario.id,
            tipo,
            conteudoId
        );

        return res.status(200).json({
            mensagem: 'Conteúdo removido dos favoritos.'
        });
    } catch (erro) {
        next(erro);
    }
}

// Lista os favoritos do usuário autenticado.
async function listar(req, res, next) {
    try {
        const favoritos = await service.listarPorUsuario(
            req.session.usuario.id
        );

        return res.status(200).json({
            total: favoritos.length,
            favoritos
        });
    } catch (erro) {
        next(erro);
    }
}

// Verifica se um conteúdo está favoritado.
async function verificar(req, res, next) {
    try {
        const { tipo, conteudoId } = req.params;

        const resultado = await service.verificar(
            req.session.usuario.id,
            tipo,
            conteudoId
        );

        return res.status(200).json(resultado);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    adicionar,
    remover,
    listar,
    verificar
};
