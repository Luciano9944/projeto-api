
const express = require('express');

const controller = require('../controllers/AuthController');
const exigeLogin = require('../middlewares/exigeLogin');

const router = express.Router();

// Cadastro público.
router.post('/api/cadastro', controller.cadastrar);

// Autenticação.
router.post('/api/login', controller.login);

// Consulta do perfil autenticado.
router.get('/api/perfil', exigeLogin, controller.perfil);

// Encerramento da sessão.
router.post('/api/logout', exigeLogin, controller.logout);

const exigeAdmin = require('../middlewares/exigeAdmin');

module.exports = router;
