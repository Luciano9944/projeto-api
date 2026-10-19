
function rotaNaoEncontrada(req, res, next) {
    const erro = new Error(
        `Rota não encontrada: ${req.method} ${req.originalUrl}`
    );

    erro.status = 404;
    next(erro);
}

function trataErro(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    const erroJsonInvalido = erro.type === 'entity.parse.failed';

    const status = erroJsonInvalido
        ? 400
        : (erro.status || erro.statusCode || 500);

    let mensagem;

    if (erroJsonInvalido) {
        mensagem = 'JSON inválido no corpo da requisição';
    } else if (status >= 500) {
        mensagem = 'Erro interno do servidor';
    } else {
        mensagem = erro.message || 'Ocorreu um erro na requisição';
    }

    // Registra informações úteis para diagnóstico.
    const registro = {
        data: new Date().toISOString(),
        metodo: req.method,
        rota: req.originalUrl,
        status,
        erro: erro.message
    };

    if (status >= 500) {
        console.error('[ERRO]', JSON.stringify(registro));
    } else {
        console.warn('[REQUISIÇÃO INVÁLIDA]', JSON.stringify(registro));
    }

    res.status(status).json({
        erro: mensagem
    });
}

module.exports = {
    rotaNaoEncontrada,
    trataErro
};
