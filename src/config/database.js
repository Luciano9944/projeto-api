const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const caminhoBanco = path.join(__dirname, '../../database/app.db');

// Singleton: uma única conexão com o banco
const db = new sqlite3.Database(caminhoBanco);

function inicializarBanco() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS filmes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                ano INTEGER NOT NULL
            )
        `, (erro) => {
            if (erro) {
                reject(erro);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    inicializarBanco
};