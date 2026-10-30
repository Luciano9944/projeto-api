
const express = require('express');
const controller = require('../controllers/SerieController');

const router = express.Router();

router.get('/series/marvel', controller.listarMarvel);
router.get('/series/populares', controller.listarPopulares);
router.get('/series/buscar', controller.buscarPorNome);

router.get('/series/:id/temporadas/:temporada',controller.buscarTemporada);

router.get(
    '/series/:id/temporadas/:temporada/episodios/:episodio',
    controller.buscarEpisodio
);

router.get(
    '/series/:id/elenco',
    controller.buscarElenco
);

router.get(
    '/series/:id/equipe',
    controller.buscarEquipe
);


router.get('/series/:id', controller.buscarPorId);
router.get('/series/:id/elenco', controller.buscarElenco);
router.get('/series/:id/equipe', controller.buscarEquipe);

module.exports = router;
