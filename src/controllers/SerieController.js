
const service = require('../services/SerieService');

function criarController(operacao) {
    return async (req, res, next) => {
        try {
            const resultado = await operacao(req);
            res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    };
}

module.exports = {
    listarMarvel: criarController(
        req => service.listarMarvel(req.query.page)
    ),

    listarPopulares: criarController(
        req => service.listarPopulares(req.query.page)
    ),

    buscarPorNome: criarController(
        req => service.buscarPorNome(
            req.query.query,
            req.query.page
        )
    ),

    buscarPorId: criarController(
        req => service.buscarPorId(req.params.id)
    ),
    
    buscarTemporada: criarController(
        req => service.buscarTemporada(
            req.params.id,
            req.params.temporada
        )
    ),
    
    buscarEpisodio: criarController(
        req => service.buscarEpisodio(
            req.params.id,
            req.params.temporada,
            req.params.episodio
        )
    ),
    
    buscarElenco: criarController(
        req => service.buscarElenco(req.params.id)
    ),

    buscarEquipe: criarController(
        req => service.buscarEquipe(req.params.id)
    )


};
