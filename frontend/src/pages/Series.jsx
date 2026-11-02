
import { useEffect, useState } from 'react';

import {
    listarPopulares,
    listarMarvel,
    buscarPorNome,
    buscarPorId,
    listarSeriesCatalogo
} from '../services/serieService';

import DetalhesSerie from '../components/DetalhesSerie';

const IMAGENS = 'https://image.tmdb.org/t/p/w500';

export default function Series({ categoriaInicial = 'populares' }) {
    const [series, setSeries] = useState([]);
    const [consulta, setConsulta] = useState('');
    const [categoria, setCategoria] = useState(categoriaInicial);
    const [pagina, setPagina] = useState(1);
    const [consultaAtiva, setConsultaAtiva] = useState('');
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [serie, setSerie] = useState(null);
    const [midiasSerie, setMidiasSerie] = useState([]);
    const [origemCatalogo, setOrigemCatalogo] = useState(false);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let cancelado = false;

        async function carregarLista() {
            setCarregando(true);
            setErro('');

            try {
                let resposta;

                if (categoria === 'marvel') {
                    resposta = await listarMarvel(pagina);
                } else if (categoria === 'busca') {
                    resposta = await buscarPorNome(
                        consultaAtiva,
                        pagina
                    );
                } else if (categoria === 'catalogo') {
                    resposta = await listarSeriesCatalogo();
                } else {
                    resposta = await listarPopulares(pagina);
                }

                if (cancelado) return;

                if (categoria === 'catalogo') {
                    const seriesCatalogo = resposta
                        .filter(item =>
                            Array.isArray(item.midias) &&
                            item.midias.length > 0
                        )
                        .map(item => ({
                            ...item,
                            conteudoId: item.id,
                            id: item.tmdb_id,
                            name: item.titulo,
                            first_air_date: item.data_lancamento,
                            vote_average: item.nota_media
                        }));

                    setSeries(seriesCatalogo);
                    setTotalPaginas(1);
                } else {
                    setSeries(resposta.results || []);
                    setTotalPaginas(
                        Math.min(resposta.total_pages || 1, 500)
                    );
                }
            } catch (error) {
                if (cancelado) return;

                setErro(error.message);
                setSeries([]);
                setTotalPaginas(1);
            } finally {
                if (!cancelado) {
                    setCarregando(false);
                }
            }
        }

        carregarLista();

        return () => {
            cancelado = true;
        };
    }, [categoria, pagina, consultaAtiva]);

    function pesquisar(event) {
        event.preventDefault();

        const termo = consulta.trim();

        if (!termo) {
            setErro('Digite o nome de uma série para pesquisar.');
            return;
        }

        setPagina(1);
        setConsultaAtiva(termo);
        setCategoria('busca');
    }

    function mudarCategoria(novaCategoria) {
        setCategoria(novaCategoria);
        setPagina(1);
        setSerie(null);
        setMidiasSerie([]);
        setOrigemCatalogo(false);
        setErro('');
    }

    async function abrirSerie(item) {
        const veioDoCatalogo = categoria === 'catalogo';

        setCarregando(true);
        setErro('');
        setOrigemCatalogo(veioDoCatalogo);

        setMidiasSerie(
            veioDoCatalogo ? item.midias || [] : []
        );

        try {
            const resultado = await buscarPorId(item.id);
            setSerie(resultado);
        } catch (error) {
            setErro(error.message);
            setMidiasSerie([]);
            setOrigemCatalogo(false);
        } finally {
            setCarregando(false);
        }
    }

    function voltarParaLista() {
        setSerie(null);
        setMidiasSerie([]);
        setOrigemCatalogo(false);
        setErro('');
    }

    if (serie) {
        return (
            <DetalhesSerie
                serie={serie}
                midias={midiasSerie}
                origemCatalogo={origemCatalogo}
                onVoltar={voltarParaLista}
            />
        );
    }

    return (
        <section className="catalogo">
            <nav className="categorias-series">
                <button
                    type="button"
                    className={categoria === 'populares' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('populares')}
                >
                    Séries populares
                </button>

                <button
                    type="button"
                    className={categoria === 'marvel' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('marvel')}
                >
                    Séries Marvel
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
                    value={consulta}
                    onChange={event => setConsulta(event.target.value)}
                    placeholder="Buscar série pelo nome..."
                />

                <button type="submit">Pesquisar</button>
            </form>

            <h2>
                {categoria === 'marvel'
                    ? 'Séries Marvel'
                    : categoria === 'busca'
                        ? `Resultados para "${consultaAtiva}"`
                        : categoria === 'catalogo'
                            ? 'Disponíveis no site'
                            : 'Séries populares'}
            </h2>

            {erro && <p className="erro">Erro: {erro}</p>}
            {carregando && <p>Carregando séries...</p>}

            {!carregando && !erro && series.length === 0 && (
                <p>Nenhuma série encontrada.</p>
            )}

            <div className="grade-filmes">
                {series.map(item => (
                    <article className="cartao-filme" key={item.id}>
                        {item.poster_path ? (
                            <button
                                type="button"
                                className="filme-clicavel"
                                onClick={() => abrirSerie(item)}
                                aria-label={`Ver detalhes de ${item.name || item.original_name}`}
                            >
                                <img
                                    src={`${IMAGENS}${item.poster_path}`}
                                    alt={`Pôster de ${item.name || item.original_name}`}
                                    loading="lazy"
                                />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="filme-clicavel poster-indisponivel"
                                onClick={() => abrirSerie(item)}
                            >
                                Pôster indisponível
                            </button>
                        )}

                        <div className="informacoes-filme">
                            <h3>
                                <button
                                    type="button"
                                    className="filme-titulo-clicavel"
                                    onClick={() => abrirSerie(item)}
                                >
                                    {item.name || item.original_name}
                                </button>
                            </h3>

                            <p>
                                Ano: {item.first_air_date
                                    ? item.first_air_date.slice(0, 4)
                                    : 'Não informado'}
                            </p>

                            <p>
                                Nota: {Number(item.vote_average || 0).toFixed(1)}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            {categoria !== 'catalogo' &&
                !carregando &&
                series.length > 0 && (
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
