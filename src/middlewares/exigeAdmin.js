
const usuarios = require('../repositories/UsuarioRepository');

async function exigeAdmin(req, res, next) {
    try {
        // Verifica se existe um usuário autenticado.
        if (!req.session || !req.session.usuario) {
            return res.status(401).json({
                erro: 'É necessário estar autenticado para continuar.'
            });
        }

        const usuarioId = req.session.usuario.id;

        // Consulta as permissões atuais no banco.
        const usuario = await usuarios.buscarPermissoes(usuarioId);

        if (!usuario || !usuario.ativo) {
            return req.session.destroy(() => {
                res.status(401).json({
                    erro: 'Usuário não encontrado ou conta desativada.'
                });
            });
        }

        // Verifica se o usuário possui papel administrativo.
        if (usuario.papel !== 'admin') {
            return res.status(403).json({
                erro: 'Acesso permitido somente para administradores.'
            });
        }

        // Atualiza o papel armazenado na sessão.
        req.session.usuario.papel = usuario.papel;

        next();

    } catch (erro) {
        next(erro);
    }
}

module.exports = exigeAdmin;
