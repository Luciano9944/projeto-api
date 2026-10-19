
const express = require('express');
const controller = require('../controllers/FilmeController');

const router = express.Router();

router.get('/filmes/populares', controller.listarPopulares);
router.get('/filmes/buscar', controller.buscarPorNome);
router.get('/filmes/marvel', controller.listarMarvel);
router.get('/filmes/empresas-marvel', controller.buscarEmpresasMarvel);
router.get('/filmes/palavras-chave-marvel',controller.buscarPalavrasChaveMarvel);
router.get('/filmes/:id', controller.buscarPorId);

module.exports = router;
