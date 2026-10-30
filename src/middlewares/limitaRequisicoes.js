
const { rateLimit } = require('express-rate-limit');

const limiteGeral = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 100, // Até 100 requisições por IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,

    message: {
        erro: 'Muitas requisições. Tente novamente mais tarde.'
    },

    handler(req, res, next, options) {
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = { limiteGeral };
