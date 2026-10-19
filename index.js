const express = require('express');

const app = express();

app.use(express.json());
app.use(express.static('public'));

let filmes = [
    {
        id: 1,
        titulo: 'Homem de Ferro',
        ano: 2008
    },
    {
        id: 2,
        titulo: 'Os Vingadores',
        ano: 2012
    },
    {
        id: 3,
        titulo: 'Vingadores: Ultimato',
        ano: 2019
    }
];


// GET /filmes
// Retorna todos os filmes
app.get('/filmes', (req, res) => {
    res.status(200).json(filmes);
});


// GET /filmes/:id
// Retorna um filme específico
app.get('/filmes/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const filme = filmes.find(filme => filme.id === id);

    if (!filme) {
        return res.status(404).json({
            erro: 'Filme não encontrado'
        });
    }

    res.status(200).json(filme);
});


// POST /filmes
// Cria um novo filme
app.post('/filmes', (req, res) => {
    const { titulo, ano } = req.body;

    if (!titulo || !ano) {
        return res.status(400).json({
            erro: 'Título e ano são obrigatórios'
        });
    }

    const novoFilme = {
        id: filmes.length > 0 ? filmes[filmes.length - 1].id + 1 : 1,
        titulo: titulo,
        ano: ano
    };

    filmes.push(novoFilme);

    res.status(201).json(novoFilme);
});


// PUT /filmes/:id
// Atualiza um filme
app.put('/filmes/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const filme = filmes.find(filme => filme.id === id);

    if (!filme) {
        return res.status(404).json({
            erro: 'Filme não encontrado'
        });
    }

    const { titulo, ano } = req.body;

    if (!titulo || !ano) {
        return res.status(400).json({
            erro: 'Título e ano são obrigatórios'
        });
    }

    filme.titulo = titulo;
    filme.ano = ano;

    res.status(200).json(filme);
});


// DELETE /filmes/:id
// Remove um filme
app.delete('/filmes/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const indice = filmes.findIndex(filme => filme.id === id);

    if (indice === -1) {
        return res.status(404).json({
            erro: 'Filme não encontrado'
        });
    }

    filmes.splice(indice, 1);

    res.status(204).send();
});


// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});