import { useEffect, useState } from 'react';

import {
    listarPopulares,
    buscarFilmes,
    listarMarvel,
    listarFilmesCatalogo
} from '../services/filmeService';

import DetalhesFilme from '../components/DetalhesFilme';

const IMAGEM_BASE = 'https://image.tmdb.org/t/p/w500';

function Filmes({ categoriaInicial = 'populares' }) {
    const [filmes, setFilmes] = useState([]);
    const [categoria, setCategoria] = useState(categoriaInicial);
    const [pesquisa, setPesquisa] = useState('');
    const [consultaAtiva, setConsultaAtiva] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [filmeSelecionado, setFilmeSelecionado] = useState(null);

    useEffect(() => {
        async function carregarFilmes() {
            try {
                setCarregando(true);
                setErro('');

                let dados;

                if (categoria === 'marvel') {
                    dados = await listarMarvel(pagina);
                } else if (categoria === 'busca') {
                    dados = await buscarFilmes(consultaAtiva, pagina);
                } else if (categoria === 'catalogo') {
                    dados = await listarFilmesCatalogo();
                } else {
                    dados = await listarPopulares(pagina);
                }

                if (categoria === 'catalogo') {
                    const filmesCatalogo = dados
                        .filter(filme =>
                            Array.isArray(filme.midias) &&
                            filme.midias.length > 0
                        )
                        .map(filme => ({
                            ...filme,
                            conteudoId: filme.id,
                            id: filme.tmdb_id,
                            title: filme.titulo,
                            release_date: filme.data_lancamento,
                            vote_average: filme.nota_media
                        }));

                    setFilmes(filmesCatalogo);
                    setTotalPaginas(1);
                } else {
                    setFilmes(dados.results || []);
                    setTotalPaginas(
                        Math.min(dados.total_pages || 1, 500)
                    );
                }
            } catch (erro) {
                setErro(erro.message);
                setFilmes([]);
            } finally {
                setCarregando(false);
            }
        }

        carregarFilmes();
    }, [categoria, pagina, consultaAtiva]);

    function pesquisar(event) {
        event.preventDefault();

        const termo = pesquisa.trim();

        if (!termo) {
            setErro('Digite o nome de um filme para pesquisar.');
            return;
        }

        setPagina(1);
        setConsultaAtiva(termo);
        setCategoria('busca');
    }

    function mudarCategoria(novaCategoria) {
        setPagina(1);
        setCategoria(novaCategoria);
        setErro('');
        setFilmeSelecionado(null);
    }

    function abrirDetalhes(filme) {
        setFilmeSelecionado({
            id: filme.id,
            midias: filme.midias || [],
            origemCatalogo: categoria === 'catalogo'
        });
    }

    if (filmeSelecionado !== null) {
        return (
            <DetalhesFilme
                id={filmeSelecionado.id}
                midias={filmeSelecionado.midias}
                origemCatalogo={filmeSelecionado.origemCatalogo}
                onVoltar={() => setFilmeSelecionado(null)}
            />
        );
    }

    return (
        <section className="catalogo">
            <nav className="categorias-filmes">
                <button
                    type="button"
                    className={categoria === 'populares' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('populares')}
                >
                    Filmes populares
                </button>

                <button
                    type="button"
                    className={categoria === 'marvel' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('marvel')}
                >
                    Filmes Marvel
                </button>

                <button
                    type="button"
                    className={categoria === 'catalogo' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('catalogo')}
                >
                    Disponíveis no site
                </button>
            </nav>

            <form className="formulario-busca" onSubmit={pesquisar}>
                <input
                    type="text"
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Pesquisar filme pelo título..."
                />

                <button type="submit">Pesquisar</button>
            </form>

            <h2>
                {categoria === 'marvel'
                    ? 'Filmes Marvel'
                    : categoria === 'busca'
                        ? `Resultados para "${consultaAtiva}"`
                        : categoria === 'catalogo'
                            ? 'Disponíveis no site'
                            : 'Filmes populares'}
            </h2>

            {carregando && <p>Carregando filmes...</p>}

            {erro && <p className="erro">Erro: {erro}</p>}

            {!carregando && !erro && filmes.length === 0 && (
                <p>Nenhum filme encontrado.</p>
            )}

            <div className="grade-filmes">
                {filmes.map((filme) => (
                    <article className="cartao-filme" key={filme.id}>
                        {filme.poster_path ? (
                            <button
                                type="button"
                                className="filme-clicavel"
                                onClick={() => abrirDetalhes(filme)}
                                aria-label={`Ver detalhes de ${filme.title}`}
                            >
                                <img
                                    src={`${IMAGEM_BASE}${filme.poster_path}`}
                                    alt={`Pôster de ${filme.title}`}
                                    loading="lazy"
                                />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="filme-clicavel poster-indisponivel"
                                onClick={() => abrirDetalhes(filme)}
                            >
                                Pôster indisponível
                            </button>
                        )}

                        <div className="informacoes-filme">
                            <h3>
                                <button
                                    type="button"
                                    className="filme-titulo-clicavel"
                                    onClick={() => abrirDetalhes(filme)}
                                >
                                    {filme.title}
                                </button>
                            </h3>

                            <p>
                                Ano: {filme.release_date
                                    ? filme.release_date.slice(0, 4)
                                    : 'Não informado'}
                            </p>

                            <p>
                                Nota: {Number(
                                    filme.vote_average || 0
                                ).toFixed(1)}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            {!carregando &&
                filmes.length > 0 &&
                categoria !== 'catalogo' && (
                    <div className="paginacao">
                        <button
                            onClick={() => setPagina(atual => atual - 1)}
                            disabled={pagina <= 1}
                        >
                            Anterior
                        </button>

                        <span>
                            Página {pagina} de {totalPaginas}
                        </span>

                        <button
                            onClick={() => setPagina(atual => atual + 1)}
                            disabled={pagina >= totalPaginas}
                        >
                            Próxima
                        </button>
                    </div>
                )}
        </section>
    );
}

export default Filmes;