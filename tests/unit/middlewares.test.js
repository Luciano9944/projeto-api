const exigeLogin = require('../../src/middlewares/exigeLogin');
const { rotaNaoEncontrada } = require('../../src/middlewares/trataErro');

describe('Testes dos Middlewares', () => {

    test('Deve bloquear quando não existir usuário na sessão', () => {
        const req = { session: {} };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        exigeLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('Deve permitir acesso quando existir usuário na sessão', () => {
        const req = {
            session: {
                usuario: {
                    id: 1,
                    email: 'luciano.teste@email.com'
                }
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        exigeLogin(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('Deve retornar erro quando a rota não existir', () => {
        const req = {
            method: 'GET',
            originalUrl: '/api/inexistente'
        };

        const res = {};
        const next = jest.fn();

        rotaNaoEncontrada(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Rota não encontrada: GET /api/inexistente',
                status: 404
            })
        );
    });

});