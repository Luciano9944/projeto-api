
const { pool } = require('../config/database');

// Adiciona um conteúdo aos favoritos do usuário.
async function adicionar(usuarioId, tipoConteudo, conteudoId) {
    const resultado = await pool.query(
        `INSERT INTO favoritos (
            usuario_id,
            tipo_conteudo,
            conteudo_id
         )
         VALUES ($1, $2, $3)
         ON CONFLICT (usuario_id, tipo_conteudo, conteudo_id)
         DO NOTHING
         RETURNING id, usuario_id, tipo_conteudo, conteudo_id, criado_em`,
        [usuarioId, tipoConteudo, conteudoId]
    );

    return resultado.rows[0] || null;
}

// Remove um conteúdo dos favoritos do usuário.
async function remover(usuarioId, tipoConteudo, conteudoId) {
    const resultado = await pool.query(
        `DELETE FROM favoritos
         WHERE usuario_id = $1
           AND tipo_conteudo = $2
           AND conteudo_id = $3
         RETURNING id, usuario_id, tipo_conteudo, conteudo_id`,
        [usuarioId, tipoConteudo, conteudoId]
    );

    return resultado.rows[0] || null;
}

// Lista os favoritos de um usuário.
async function listarPorUsuario(usuarioId) {
    const resultado = await pool.query(
        `SELECT
            id,
            usuario_id,
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

// Verifica se um conteúdo está nos favoritos do usuário.
async function buscar(usuarioId, tipoConteudo, conteudoId) {
    const resultado = await pool.query(
        `SELECT id, usuario_id, tipo_conteudo, conteudo_id
         FROM favoritos
         WHERE usuario_id = $1
           AND tipo_conteudo = $2
           AND conteudo_id = $3`,
        [usuarioId, tipoConteudo, conteudoId]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    adicionar,
    remover,
    listarPorUsuario,
    buscar
};
