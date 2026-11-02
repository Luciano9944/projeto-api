
const { pool } = require('../config/database');

// Cria um comentário publicado automaticamente.
async function criar(usuarioId, tipoConteudo, conteudoId, texto) {
    const resultado = await pool.query(
        `INSERT INTO comentarios (
            usuario_id,
            tipo_conteudo,
            conteudo_id,
            texto
         )
         VALUES ($1, $2, $3, $4)
         RETURNING
            id,
            usuario_id,
            tipo_conteudo,
            conteudo_id,
            texto,
            status,
            criado_em`,
        [usuarioId, tipoConteudo, conteudoId, texto]
    );

    return resultado.rows[0];
}

// Lista todos os comentários de um conteúdo.
async function listarPorConteudo(tipoConteudo, conteudoId) {
    const resultado = await pool.query(
        `SELECT
            c.id,
            c.usuario_id,
            u.nome AS nome_usuario,
            c.tipo_conteudo,
            c.conteudo_id,
            c.texto,
            c.criado_em,
            c.atualizado_em
         FROM comentarios c
         INNER JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.tipo_conteudo = $1
           AND c.conteudo_id = $2
         ORDER BY c.criado_em DESC`,
        [tipoConteudo, conteudoId]
    );

    return resultado.rows;
}

// Lista todos os comentários feitos por um usuário.
async function listarPorUsuario(usuarioId) {
    const resultado = await pool.query(
        `SELECT
            id,
            usuario_id,
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

// Busca um comentário pelo ID.
async function buscarPorId(id) {
    const resultado = await pool.query(
        `SELECT
            id,
            usuario_id,
            tipo_conteudo,
            conteudo_id,
            texto,
            status,
            moderado_por,
            moderado_em,
            criado_em,
            atualizado_em
         FROM comentarios
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0] || null;
}

// Atualiza o texto de um comentário.
async function atualizar(id, usuarioId, texto) {
    const resultado = await pool.query(
        `UPDATE comentarios
         SET texto = $1,
             status = 'aprovado',
             moderado_por = NULL,
             moderado_em = NULL,
             atualizado_em = NOW()
         WHERE id = $2
           AND usuario_id = $3
         RETURNING
            id,
            usuario_id,
            tipo_conteudo,
            conteudo_id,
            texto,
            status,
            atualizado_em`,
        [texto, id, usuarioId]
    );

    return resultado.rows[0] || null;
}

// Exclui um comentário pertencente ao usuário.
async function remover(id, usuarioId) {
    const resultado = await pool.query(
        `DELETE FROM comentarios
         WHERE id = $1
           AND usuario_id = $2
         RETURNING id`,
        [id, usuarioId]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    criar,
    listarPorConteudo,
    listarPorUsuario,
    buscarPorId,
    atualizar,
    remover
};
