
const { pool } = require('../config/database');

// Busca os dados básicos do usuário.
async function buscarUsuario(usuarioId) {
    const resultado = await pool.query(
        `SELECT
            id,
            nome,
            email,
            papel,
            criado_em
         FROM usuarios
         WHERE id = $1
           AND ativo = TRUE`,
        [usuarioId]
    );

    return resultado.rows[0] || null;
}

// Busca os favoritos do usuário.
async function listarFavoritos(usuarioId) {
    const resultado = await pool.query(
        `SELECT
            id,
            tipo_conteudo,
            conteudo_id,
            criado_em
         FROM favoritos
         WHERE usuario_id = $1
         ORDER BY criado_em DESC`,
        [usuarioId]
    );

    return resultado.rows;
}

// Busca os comentários do usuário.
async function listarComentarios(usuarioId) {
    const resultado = await pool.query(
        `SELECT
            id,
            tipo_conteudo,
            conteudo_id,
            texto,
            status,
            criado_em,
            atualizado_em
         FROM comentarios
         WHERE usuario_id = $1
         ORDER BY criado_em DESC`,
        [usuarioId]
    );

    return resultado.rows;
}

module.exports = {
    buscarUsuario,
    listarFavoritos,
    listarComentarios
};
