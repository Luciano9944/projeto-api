
const repository = require('../repositories/PerfilRepository');

// Valida o ID do usuário autenticado.
function validarUsuarioId(usuarioId) {
    if (
        !Number.isSafeInteger(Number(usuarioId)) ||
        Number(usuarioId) <= 0
    ) {
        const erro = new Error('Usuário inválido.');
        erro.status = 401;
        throw erro;
    }

    return Number(usuarioId);
}

// Busca todas as informações do perfil.
async function buscarPerfil(usuarioId) {
    const usuarioValidado = validarUsuarioId(usuarioId);

    // Executa as consultas em paralelo.
    const [usuario, favoritos, comentarios] = await Promise.all([
        repository.buscarUsuario(usuarioValidado),
        repository.listarFavoritos(usuarioValidado),
        repository.listarComentarios(usuarioValidado)
    ]);

    if (!usuario) {
        const erro = new Error('Usuário não encontrado ou desativado.');
        erro.status = 404;
        throw erro;
    }

    return {
        usuario,
        favoritos: {
            total: favoritos.length,
            itens: favoritos
        },
        comentarios: {
            total: comentarios.length,
            itens: comentarios
        }
    };
}

module.exports = {
    buscarPerfil
};
