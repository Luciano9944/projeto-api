
const service = require('../services/CatalogoService');

function criarController(operacao, statusSucesso = 200) {
    return async function (req, res, next) {
        try {
            const resultado = await operacao(req);

            return res.status(statusSucesso).json(resultado);
        } catch (erro) {
            next(erro);
        }
    };
}

// Lista todos os conteúdos ativos.
const listarTodos = criarController(
    req => service.listarTodos(req.query.tipo)
);

// Busca um conteúdo pelo ID interno.
const buscarPorId = criarController(
    req => service.buscarPorId(req.params.id)
);

// Cadastra um filme ou uma série.
const cadastrar = criarController(
    req => service.cadastrar(
        req.body,
        req.session.usuario.id
    ),
    201
);

// Atualiza um conteúdo.
const atualizar = criarController(
    req => service.atualizar(
        req.params.id,
        req.body
    )
);

// Desativa um conteúdo.
const desativar = criarController(
    req => service.desativar(req.params.id)
);

// Pesquisa filmes ou séries no TMDB.
const pesquisarNoTmdb = criarController(
    req => service.pesquisarNoTmdb(
        req.query.tipo,
        req.query.consulta
    )
);

module.exports = {
    pesquisarNoTmdb,
    listarTodos,
    buscarPorId,
    cadastrar,
    atualizar,
    desativar
};
