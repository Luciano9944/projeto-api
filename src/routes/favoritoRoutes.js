
const express = require('express');

const controller = require('../controllers/FavoritoController');
const exigeLogin = require('../middlewares/exigeLogin');

const router = express.Router();

// Adiciona um conteúdo aos favoritos.
router.post('/favoritos', exigeLogin, controller.adicionar);

// Lista os favoritos do usuário autenticado.
router.get('/favoritos', exigeLogin, controller.listar);

// Verifica se um conteúdo está favoritado.
router.get('/favoritos/:tipo/:conteudoId', exigeLogin, controller.verificar);

// Remove um conteúdo dos favoritos.
router.delete('/favoritos/:tipo/:conteudoId', exigeLogin, controller.remover);

module.exports = router;
