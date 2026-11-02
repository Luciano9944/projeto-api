
const express = require('express');
const controller = require('../controllers/PerfilController');
const exigeLogin = require('../middlewares/exigeLogin');

const router = express.Router();

// Consulta os dados, favoritos e comentários do usuário.
router.get(
    '/perfil/detalhado',
    exigeLogin,
    controller.buscar
);

module.exports = router;
