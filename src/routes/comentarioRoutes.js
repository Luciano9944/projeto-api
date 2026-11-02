
const express = require('express');

const controller = require('../controllers/ComentarioController');
const exigeLogin = require('../middlewares/exigeLogin');

const router = express.Router();

// Lista todos os comentários de um filme ou série.
// Rota pública: não exige login.
router.get(
    '/comentarios/:tipo/:conteudoId',
    controller.listarPorConteudo
);

// Cria um comentário.
router.post(
    '/comentarios',
    exigeLogin,
    controller.criar
);

// Lista os comentários do usuário autenticado.
router.get(
    '/meus-comentarios',
    exigeLogin,
    controller.listarPorUsuario
);

// Atualiza um comentário do usuário.
router.put(
    '/comentarios/:id',
    exigeLogin,
    controller.atualizar
);

// Remove um comentário do usuário.
router.delete(
    '/comentarios/:id',
    exigeLogin,
    controller.remover
);

module.exports = router;
