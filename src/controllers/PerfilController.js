
const service = require('../services/PerfilService');

// Consulta o perfil completo do usuário autenticado.
async function buscar(req, res, next) {
    try {
        const perfil = await service.buscarPerfil(
            req.session.usuario.id
        );

        return res.status(200).json({
            mensagem: 'Perfil carregado com sucesso.',
            ...perfil
        });
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    buscar
};
