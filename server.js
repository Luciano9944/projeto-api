
require('dotenv').config();

const variaveisObrigatorias = [
    'SESSION_SECRET',
    'TMDB_BEARER_TOKEN'
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

const { app, inicializarBanco } = require('./src/app');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await inicializarBanco();

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (erro) {
        console.error(
            'Erro ao inicializar o servidor:',
            erro.message
        );

        process.exit(1);
    }
}

iniciarServidor();
