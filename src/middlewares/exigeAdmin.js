
const { pool } = require('../config/database');

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
        const resultado = await pool.query(
            `SELECT papel, ativo
             FROM usuarios
             WHERE id = $1`,
            [usuarioId]
        );

        if (resultado.rowCount === 0 || !resultado.rows[0].ativo) {
            return req.session.destroy(() => {
                res.status(401).json({
                    erro: 'Usuário não encontrado ou conta desativada.'
                });
            });
        }

        const usuario = resultado.rows[0];

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
