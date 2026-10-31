
const express = require('express');

const controller = require('../controllers/MidiaController');

const exigeLogin = require('../middlewares/exigeLogin');
const exigeAdmin = require('../middlewares/exigeAdmin');

const router = express.Router();

// Rotas públicas.
router.get('/midias', controller.listarTodas);

router.get(
    '/midias/conteudo/:conteudoId',
    controller.listarPorConteudo
);

router.get('/midias/:id', controller.buscarPorId);

// Rotas administrativas.
router.post(
    '/admin/midias',
    exigeLogin,
    exigeAdmin,
    controller.cadastrar
);

router.put(
    '/admin/midias/:id',
    exigeLogin,
    exigeAdmin,
    controller.atualizar
);

router.delete(
    '/admin/midias/:id',
    exigeLogin,
    exigeAdmin,
    controller.desativar
);

module.exports = router;
