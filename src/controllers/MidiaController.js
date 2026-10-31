
const service = require('../services/MidiaService');

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

// Lista todas as mídias ativas.
const listarTodas = criarController(
    () => service.listarTodas()
);

// Lista as mídias de um conteúdo específico.
const listarPorConteudo = criarController(
    req => service.listarPorConteudo(req.params.conteudoId)
);

// Busca uma mídia pelo ID.
const buscarPorId = criarController(
    req => service.buscarPorId(req.params.id)
);

// Cadastra uma nova mídia.
const cadastrar = criarController(
    req => service.cadastrar(
        req.body,
        req.session.usuario.id
    ),
    201
);

// Atualiza uma mídia existente.
const atualizar = criarController(
    req => service.atualizar(
        req.params.id,
        req.body
    )
);

// Desativa uma mídia.
const desativar = criarController(
    req => service.desativar(req.params.id)
);

module.exports = {
    listarTodas,
    listarPorConteudo,
    buscarPorId,
    cadastrar,
    atualizar,
    desativar
};
