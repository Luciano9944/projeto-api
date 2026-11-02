const { rateLimit } = require('express-rate-limit');

const limiteGeral = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    limit: 500, // Até 500 requisições por IP

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