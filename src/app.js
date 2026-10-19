
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const { inicializarBanco } = require('./config/database');

const filmeRoutes = require('./routes/filmeRoutes');
const authRoutes = require('./routes/authRoutes');
const { limiteGeral } = require('./middlewares/limitaRequisicoes');
const helmet = require('helmet');

const {
    rotaNaoEncontrada,
    trataErro
} = require('./middlewares/trataErro');

const app = express();

app.use(helmet());
// CORS antes das rotas e das sessões.

const origemFrontend =
    process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: origemFrontend,
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Limita as requisições recebidas pela API.
app.use('/api', limiteGeral);

app.use(session({
    store: new SQLiteStore({
        db: 'sessoes.db',
        dir: path.join(__dirname, '../database')
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

app.use(authRoutes);
app.use('/api', filmeRoutes);

app.use(rotaNaoEncontrada);
app.use(trataErro);


module.exports = {
    app,
    inicializarBanco
};
