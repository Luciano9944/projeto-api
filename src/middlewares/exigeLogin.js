
function exigeLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            erro: 'É necessário estar autenticado para continuar.'
        });
    }

    next();
}

module.exports = exigeLogin;
