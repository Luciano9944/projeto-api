const { pool } = require('../config/database');

async function buscarIdPorEmail(email) {
    const resultado = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
    );

    return resultado.rows[0]?.id ?? null;
}

async function cadastrar({ nome, email, senhaHash }) {
    const resultado = await pool.query(
        `INSERT INTO usuarios (nome, email, senha_hash, papel)
         VALUES ($1, $2, $3, 'usuario')
         RETURNING id, nome, email, papel, criado_em`,
        [nome, email, senhaHash]
    );

    return resultado.rows[0];
}

async function buscarParaLogin(email) {
    const resultado = await pool.query(
        `SELECT id, nome, email, senha_hash, papel, ativo
         FROM usuarios
         WHERE email = $1`,
        [email]
    );

    return resultado.rows[0] || null;
}

async function buscarPermissoes(id) {
    const resultado = await pool.query(
        `SELECT papel, ativo
         FROM usuarios
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    buscarIdPorEmail,
    cadastrar,
    buscarParaLogin,
    buscarPermissoes
};
