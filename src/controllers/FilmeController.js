
const service = require('../services/FilmeService');

function criarController(operacao) {
    return async function (req, res, next) {
        try {
            const resultado = await operacao(req);
            res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    };
}

const listarPopulares = criarController(
    req => service.listarPopulares(req.query.page)
);

const buscarPorNome = criarController(
    req => service.buscarPorNome(
        req.query.query,
        req.query.page
    )
);

const listarMarvel = criarController(
    req => service.listarMarvel(req.query.page)
);

const buscarPorId = criarController(
    req => service.buscarPorId(req.params.id)
);

const buscarEmpresasMarvel = criarController(
    req => service.buscarEmpresasMarvel(
        req.query.query || 'Marvel',
        req.query.page
    )
);

const buscarPalavrasChaveMarvel = criarController(
    req => service.buscarPalavrasChaveMarvel(
        req.query.query || 'Marvel',
        req.query.page
    )
);

// Novo: consultar elenco de um filme
const buscarElenco = criarController(
    req => service.buscarElenco(req.params.id)
);

// Novo: consultar equipe técnica de um filme
const buscarEquipe = criarController(
    req => service.buscarEquipe(req.params.id)
);

module.exports = {
    listarPopulares,
    buscarPorNome,
    listarMarvel,
    buscarPorId,
    buscarEmpresasMarvel,
    buscarPalavrasChaveMarvel,
    buscarElenco,
    buscarEquipe
};
