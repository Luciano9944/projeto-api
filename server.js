require('dotenv').config();

const variaveisObrigatorias = [
    'SESSION_SECRET',
    'TMDB_BEARER_TOKEN',
    'DATABASE_URL_POOLED'
];

const variaveisAusentes = variaveisObrigatorias.filter(
    nome => !process.env[nome] || !process.env[nome].trim()
);

if (variaveisAusentes.length > 0) {
    console.error(
        'Erro: variáveis de ambiente obrigatórias ausentes:',
        variaveisAusentes.join(', ')
    );

    process.exit(1);
}

const app = require('./src/app');

const {
    testarConexao,
    pool
} = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await testarConexao();

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });

    } catch (erro) {
        console.error(
            'Erro ao conectar com PostgreSQL:',
            erro.message
        );

        await pool.end();

        process.exit(1);
    }
}

iniciarServidor();