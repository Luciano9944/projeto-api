
const { Pool } = require('pg');

if (!process.env.DATABASE_URL_POOLED) {
    throw new Error(
        'A variável DATABASE_URL_POOLED não foi configurada.'
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_POOLED,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (erro) => {
    console.error('Erro inesperado no pool PostgreSQL:', erro);
});

async function testarConexao() {
    const resultado = await pool.query('SELECT NOW() AS horario');

    console.log(
        'Conexão com PostgreSQL estabelecida!',
        resultado.rows[0].horario
    );
}

module.exports = {
    pool,
    testarConexao
};
