require('dotenv').config();

jest.mock('../../src/repositories/CatalogoRepository', () => ({
    cadastrar: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
    desativar: jest.fn()
}));

jest.mock('../../src/config/tmdb', () => ({
    requisitar: jest.fn()
}));

const repository = require('../../src/repositories/CatalogoRepository');
const CatalogoService = require('../../src/services/CatalogoService');

describe('Testes do CatalogoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        repository.cadastrar.mockImplementation(dados => Promise.resolve(dados));
    });

    test('aceitar filme válido', async () => {
        const resultado = await CatalogoService.cadastrar({
            tmdb_id: 22,
            tipo_conteudo: 'filme',
            titulo: 'Homem Lata',
            sinopse: 'Um cara de lata',
            data_lancamento: '2024-01-15',
            poster_path: '/homem-de-lata.jpg',
            nota_media: 9.78
        }, 1);

        expect(resultado.titulo).toBe('Homem Lata');
        expect(resultado.nota_media).toBe(9.78);
        expect(repository.cadastrar).toHaveBeenCalledTimes(1);
    });

    test('rejeitar filme com URL completa no poster_path', async () => {
        await expect(CatalogoService.cadastrar({
            tmdb_id: 22,
            tipo_conteudo: 'filme',
            titulo: 'Homem Lata',
            sinopse: 'Um cara de lata',
            poster_path: 'https://blogger.googleusercontent.com/img/b/Homem+de+Lata.jpg',
            nota_media: 9.78
        }, 1)).rejects.toThrow('O caminho do pôster é inválido.');
    });
});