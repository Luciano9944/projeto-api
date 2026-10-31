
const express = require('express');

const controller = require('../controllers/CatalogoController');

const exigeLogin = require('../middlewares/exigeLogin');
const exigeAdmin = require('../middlewares/exigeAdmin');

const router = express.Router();

// Rotas públicas.
router.get('/catalogo', controller.listarTodos);
router.get('/catalogo/:id', controller.buscarPorId);

// Pesquisa filmes e séries no TMDB.
router.get(
    '/admin/catalogo/pesquisar',
    exigeLogin,
    exigeAdmin,
    controller.pesquisarNoTmdb
);
// Rotas administrativas.
router.post(
    '/admin/catalogo',
    exigeLogin,
    exigeAdmin,
    controller.cadastrar
);

router.put(
    '/admin/catalogo/:id',
    exigeLogin,
    exigeAdmin,
    controller.atualizar
);

router.delete(
    '/admin/catalogo/:id',
    exigeLogin,
    exigeAdmin,
    controller.desativar
);

module.exports = router;
