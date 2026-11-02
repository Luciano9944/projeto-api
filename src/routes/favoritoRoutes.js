
const express = require('express');

const controller = require('../controllers/FavoritoController');
const exigeLogin = require('../middlewares/exigeLogin');

const router = express.Router();

// Todas as rotas exigem autenticação.
router.use(exigeLogin);

// Adiciona um conteúdo aos favoritos.
router.post('/favoritos', controller.adicionar);

// Lista os favoritos do usuário autenticado.
router.get('/favoritos', controller.listar);

// Verifica se um conteúdo está favoritado.
router.get('/favoritos/:tipo/:conteudoId', controller.verificar);

// Remove um conteúdo dos favoritos.
router.delete('/favoritos/:tipo/:conteudoId', controller.remover);

module.exports = router;
