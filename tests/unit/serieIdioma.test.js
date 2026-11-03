jest.mock('../../src/config/tmdb', () => ({ requisitar: jest.fn() }));

const tmdb = require('../../src/config/tmdb');
const repository = require('../../src/repositories/SerieRepository');
const service = require('../../src/services/SerieService');

beforeEach(() => jest.clearAllMocks());

test.each([
    ['populares', () => repository.listarPopulares(2), '/tv/popular'],
    ['Marvel', () => repository.listarMarvel(2), '/discover/tv'],
    ['busca', () => repository.buscarPorNome('Lei & Ordem', 2), '/search/tv'],
    ['detalhes', () => repository.buscarPorId(456), '/tv/456'],
    ['temporada', () => repository.buscarTemporada(456, 0), '/tv/456/season/0'],
    ['episódio', () => repository.buscarEpisodio(456, 1, 2), '/tv/456/season/1/episode/2'],
])('%s solicita português do Brasil e preserva o retorno do TMDB', async (_nome, operacao, caminho) => {
    const resposta = { id: 456, name: 'Os Simpsons' };
    tmdb.requisitar.mockResolvedValue(resposta);

    expect(await operacao()).toBe(resposta);
    const url = new URL(tmdb.requisitar.mock.calls[0][0], 'https://api.themoviedb.org');
    expect(url.pathname).toBe(caminho);
    expect(url.searchParams.get('language')).toBe('pt-BR');
    if (['/tv/popular', '/discover/tv', '/search/tv'].includes(caminho)) {
        expect(url.searchParams.get('page')).toBe('2');
    }
    if (caminho === '/search/tv') expect(url.searchParams.get('query')).toBe('Lei & Ordem');
    if (caminho === '/discover/tv') {
        expect(url.searchParams.get('with_companies')).toBe('420|11106');
        expect(url.searchParams.get('sort_by')).toBe('popularity.desc');
    }
});

test('o serviço entrega o nome localizado sem alterar o contrato de detalhes', async () => {
    tmdb.requisitar.mockResolvedValue({ id: 456, name: 'Os Simpsons', overview: 'Sinopse em português.', number_of_seasons: 1 });
    const serie = await service.buscarPorId('456');
    expect(serie.id).toBe(456);
    expect(serie.nome).toBe('Os Simpsons');
    expect(serie.sinopse).toBe('Sinopse em português.');
    expect(serie.temporadas).toBe(1);
    expect(serie).not.toHaveProperty('name');
});
