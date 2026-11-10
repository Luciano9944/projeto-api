require('dotenv').config();

const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/config/database');

describe('Testes de Integração', () => {

    afterAll(async () => {
        await pool.end();
    });

    test('Deve buscar os itens do catálogo', async () => {
        const res = await request(app).get('/api/catalogo');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Deve rejeitar um tipo de conteúdo inválido', async () => {
        const res = await request(app).get('/api/catalogo?tipo=anime');

        expect(res.status).toBe(400);

        expect(res.body).toEqual({
            erro: 'O tipo de conteúdo deve ser filme ou serie.'
        });
    });

    test('Deve bloquear cadastro no catálogo sem login', async () => {
        const res = await request(app)
            .post('/api/admin/catalogo')
            .send({
                tmdb_id: 22,
                tipo_conteudo: 'filme',
                titulo: 'Homem Lata'
            });

        expect(res.status).toBe(401);

        expect(res.body).toEqual({
            erro: 'É necessário estar autenticado para continuar.'
        });
    });

});
