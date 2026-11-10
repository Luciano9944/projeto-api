
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const helmet = require('helmet');

const { pool } = require('./config/database');

const filmeRoutes = require('./routes/filmeRoutes');
const serieRoutes = require('./routes/serieRoutes');
const authRoutes = require('./routes/authRoutes');
const midiaRoutes = require('./routes/midiaRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const { limiteGeral } = require('./middlewares/limitaRequisicoes');

const {
    rotaNaoEncontrada,
    trataErro
} = require('./middlewares/trataErro');

const app = express();

// Confia no proxy da Vercel para identificar o IP original.
app.set('trust proxy', 1);

app.use(helmet());

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

// Armazena as sessões no PostgreSQL.
app.use(session({
    store: new pgSession({
        pool,
        tableName: 'sessoes',
        createTableIfMissing: true
    }),

    name: 'cinecatalog.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production'
            ? 'none'
            : 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(authRoutes);
app.use('/api', filmeRoutes);
app.use('/api', serieRoutes);
app.use('/api', midiaRoutes);
app.use('/api', catalogoRoutes);
app.use('/api', favoritoRoutes);
app.use('/api', comentarioRoutes);
app.use('/api', perfilRoutes);

app.use(rotaNaoEncontrada);
app.use(trataErro);

module.exports = { app };
