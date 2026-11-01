require('dotenv').config();

const request = require('supertest');
const { app } = require('../../src/app');

describe('Testes da API', () => {

    test('Deve retornar 404 para uma rota inexistente', async () => {
        const res = await request(app).get('/api/rota-inexistente');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('erro');
    });

    test('Deve retornar 400 para um JSON inválido', async () => {
        const res = await request(app)
            .post('/api/login')
            .set('Content-Type', 'application/json')
            .send('{"email": "incompleto"');

        expect(res.status).toBe(400);
        expect(res.body.erro).toBe('JSON inválido no corpo da requisição');
    });

    test('Deve bloquear acesso ao perfil sem login', async () => {
        const res = await request(app).get('/api/perfil');

        expect(res.status).toBe(401);
        expect(res.body.erro).toBe('É necessário estar autenticado para continuar.');
    });

    test('Deve retornar erro quando não informar o filme', async () => {
        const res = await request(app).get('/api/filmes/buscar');

        expect(res.status).toBe(400);
        expect(res.body.erro).toBe('Informe o nome do filme para pesquisar');
    });

    test('Deve rejeitar cadastro com senha pequena', async () => {
        const res = await request(app)
            .post('/api/cadastro')
            .send({
                nome: 'Luciano',
                email: 'luciano.teste@email.com',
                senha: '123'
            });

        expect(res.status).toBe(400);
        expect(res.body.erro).toBe('A senha deve possuir pelo menos 8 caracteres.');
    });

});