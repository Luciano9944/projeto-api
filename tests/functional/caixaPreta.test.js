require('dotenv').config();

jest.mock('../../src/repositories/CatalogoRepository', () => ({
    cadastrar: jest.fn()
}));

jest.mock('../../src/config/tmdb', () => ({
    requisitar: jest.fn()
}));

const repository = require('../../src/repositories/CatalogoRepository');
const CatalogoService = require('../../src/services/CatalogoService');

describe('Testes Funcionais (Caixa-Preta: Partição de Equivalência e Valor Limite)', () => {
    const filmeBase = {
        tmdb_id: 22,
        tipo_conteudo: 'filme',
        titulo: 'Homem Lata',
        nota_media: 8
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository.cadastrar.mockImplementation(dados => Promise.resolve(dados));
    });

    // 1. Partição de Equivalência (tipo_conteudo: 'filme' ou 'serie')
    test('Partição Válida: deve aceitar tipo_conteudo "serie"', async () => {
        const res = await CatalogoService.cadastrar({
            ...filmeBase,
            tipo_conteudo: 'serie'
        }, 1);

        expect(res.tipo_conteudo).toBe('serie');
    });

    test('Partição Inválida: deve rejeitar tipo_conteudo "novela"', async () => {
        await expect(CatalogoService.cadastrar({
            ...filmeBase,
            tipo_conteudo: 'novela'
        }, 1)).rejects.toThrow('O tipo de conteúdo deve ser filme ou serie.');
    });

    test('Valor Limite Inferior Inválido: deve rejeitar nota -0.1', async () => {
        await expect(CatalogoService.cadastrar({
            ...filmeBase,
            nota_media: -0.1
        }, 1)).rejects.toThrow('A nota média deve estar entre 0 e 10.');
    });

    test('Valor Limite Inferior Válido: deve aceitar nota 0', async () => {
        const res = await CatalogoService.cadastrar({
            ...filmeBase,
            nota_media: 0
        }, 1);

        expect(res.nota_media).toBe(0);
    });

    test('Valor Limite Superior Válido: deve aceitar nota 10', async () => {
        const res = await CatalogoService.cadastrar({
            ...filmeBase,
            nota_media: 10
        }, 1);

        expect(res.nota_media).toBe(10);
    });

    test('Valor Limite Superior Inválido: deve rejeitar nota 10.1', async () => {
        await expect(CatalogoService.cadastrar({
            ...filmeBase,
            nota_media: 10.1
        }, 1)).rejects.toThrow('A nota média deve estar entre 0 e 10.');
    });
});