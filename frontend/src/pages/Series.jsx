
import { useEffect, useState } from 'react';

import {
    listarPopulares,
    listarMarvel,
    buscarPorNome,
    buscarPorId,
    buscarTemporada,
    buscarEpisodio,
    buscarElenco,
    buscarEquipe,
    listarSeriesCatalogo
} from '../services/serieService';

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
    const [midiaSelecionada, setMidiaSelecionada] = useState(null);
    const [origemCatalogo, setOrigemCatalogo] = useState(false);

    const [temporada, setTemporada] = useState('1');
    const [dadosTemporada, setDadosTemporada] = useState(null);
    const [episodio, setEpisodio] = useState('1');
    const [dadosEpisodio, setDadosEpisodio] = useState(null);

    const [elenco, setElenco] = useState(null);
    const [equipe, setEquipe] = useState(null);
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
        setMidiaSelecionada(null);
        setOrigemCatalogo(false);
        setErro('');
    }

    async function abrirSerie(item) {
        const veioDoCatalogo = categoria === 'catalogo';

        setCarregando(true);
        setErro('');
        setDadosTemporada(null);
        setDadosEpisodio(null);
        setElenco(null);
        setEquipe(null);
        setTemporada('1');
        setEpisodio('1');
        setMidiaSelecionada(null);
        setOrigemCatalogo(veioDoCatalogo);

        // Guarda as mídias recebidas do catálogo interno.
        setMidiasSerie(veioDoCatalogo ? item.midias || [] : []);

        try {
            const resultado = await buscarPorId(item.id);
            setSerie(resultado);
        } catch (error) {
            setErro(error.message);
            setMidiasSerie([]);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarTemporada() {
        if (!serie) return;

        setCarregando(true);
        setErro('');
        setDadosEpisodio(null);

        try {
            const resultado = await buscarTemporada(
                serie.id,
                temporada
            );
            setDadosTemporada(resultado);
        } catch (error) {
            setErro(error.message);
            setDadosTemporada(null);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarEpisodio() {
        if (!serie) return;

        setCarregando(true);
        setErro('');

        try {
            const resultado = await buscarEpisodio(
                serie.id,
                temporada,
                episodio
            );
            setDadosEpisodio(resultado);
        } catch (error) {
            setErro(error.message);
            setDadosEpisodio(null);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarElenco() {
        setCarregando(true);
        setErro('');

        try {
            setElenco(await buscarElenco(serie.id));
            setEquipe(null);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarEquipe() {
        setCarregando(true);
        setErro('');

        try {
            setEquipe(await buscarEquipe(serie.id));
            setElenco(null);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    // Agrupa as mídias cadastradas por temporada.
    const midiasPorTemporada = midiasSerie.reduce((grupos, midia) => {
        const numeroTemporada = midia.temporada;

        if (numeroTemporada === null || numeroTemporada === undefined) {
            return grupos;
        }

        if (!grupos[numeroTemporada]) {
            grupos[numeroTemporada] = [];
        }

        grupos[numeroTemporada].push(midia);

        return grupos;
    }, {});

    const temporadasCadastradas = Object.keys(midiasPorTemporada)
        .sort((a, b) => Number(a) - Number(b));

    const nomeSerie = serie?.nome || serie?.name || serie?.original_name;
    const sinopse = serie?.sinopse || serie?.overview;
    const numeroTemporadas =
        serie?.temporadas ?? serie?.number_of_seasons ?? 0;

    return (
        <section className="catalogo">
            {!serie && (
                <>
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
                            onChange={(event) => setConsulta(event.target.value)}
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
                        {series.map((item) => (
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
                                    onClick={() => setPagina((atual) => atual - 1)}
                                    disabled={pagina <= 1}
                                >
                                    Anterior
                                </button>

                                <span>
                                    Página {pagina} de {totalPaginas}
                                </span>

                                <button
                                    onClick={() => setPagina((atual) => atual + 1)}
                                    disabled={pagina >= totalPaginas}
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                </>
            )}

            {serie && (
                <section>
                    <button
                        onClick={() => {
                            setSerie(null);
                            setMidiasSerie([]);
                            setMidiaSelecionada(null);
                            setOrigemCatalogo(false);
                            setDadosTemporada(null);
                            setDadosEpisodio(null);
                            setElenco(null);
                            setEquipe(null);
                            setErro('');
                        }}
                    >
                        Voltar para a lista
                    </button>

                    <h2>{nomeSerie}</h2>

                    {serie.poster_path && (
                        <img
                            src={`${IMAGENS}${serie.poster_path}`}
                            alt={`Pôster de ${nomeSerie}`}
                        />
                    )}

                    <p>{sinopse || 'Sinopse não disponível.'}</p>

                    <p>
                        Primeira exibição:{' '}
                        {serie.data_estreia || serie.first_air_date || 'Não informada'}
                    </p>

                    <p>
                        Última exibição:{' '}
                        {serie.data_ultima_exibicao ||
                            serie.last_air_date ||
                            'Não informada'}
                    </p>

                    <p>Temporadas: {numeroTemporadas}</p>

                    <p>
                        Episódios:{' '}
                        {serie.episodios ?? serie.number_of_episodes ?? 'Não informado'}
                    </p>

                    <p>
                        Situação: {serie.situacao || serie.status || 'Não informada'}
                    </p>

                    {origemCatalogo ? (
                        <>
                            <h3>Episódios disponíveis no site</h3>

                            {temporadasCadastradas.length > 0 ? (
                                temporadasCadastradas.map(numeroTemporada => (
                                    <div
                                        className="temporada-catalogo"
                                        key={numeroTemporada}
                                    >
                                        <h4>
                                            {Number(numeroTemporada) === 0
                                                ? 'Especiais'
                                                : `Temporada ${numeroTemporada}`}
                                        </h4>

                                        {midiasPorTemporada[numeroTemporada].map(midia => (
                                            <article
                                                className="midia-serie"
                                                key={midia.id}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setMidiaSelecionada(midia)}
                                                >
                                                    Episódio {midia.episodio}: {midia.titulo}
                                                </button>

                                                {midia.descricao && (
                                                    <p>{midia.descricao}</p>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p>Nenhum episódio cadastrado no site para esta série.</p>
                            )}

                            {midiaSelecionada && (
                                <div className="player-serie">
                                    <h3>{midiaSelecionada.titulo}</h3>

                                    <iframe
                                        src={midiaSelecionada.embed_url}
                                        title={midiaSelecionada.titulo}
                                        width="100%"
                                        height="480"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3>Temporadas e episódios no TMDB</h3>

                            <label>
                                Temporada:{' '}
                                <select
                                    value={temporada}
                                    onChange={(event) => {
                                        setTemporada(event.target.value);
                                        setDadosTemporada(null);
                                        setDadosEpisodio(null);
                                    }}
                                >
                                    {Array.from(
                                        { length: numeroTemporadas + 1 },
                                        (_, index) => index
                                    ).map((numero) => (
                                        <option key={numero} value={numero}>
                                            {numero === 0
                                                ? 'Especial (0)'
                                                : `Temporada ${numero}`}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                onClick={carregarTemporada}
                                disabled={carregando}
                            >
                                Consultar temporada
                            </button>

                            {dadosTemporada && (
                                <div>
                                    <h4>
                                        {dadosTemporada.name || `Temporada ${temporada}`}
                                    </h4>

                                    <p>
                                        Episódios: {dadosTemporada.episodes?.length ?? 0}
                                    </p>

                                    <ul>
                                        {(dadosTemporada.episodes || []).map((item) => (
                                            <li key={item.id}>
                                                Episódio {item.episode_number}: {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <label>
                                Número do episódio:{' '}
                                <input
                                    type="number"
                                    min="1"
                                    value={episodio}
                                    onChange={(event) => setEpisodio(event.target.value)}
                                />
                            </label>

                            <button
                                onClick={carregarEpisodio}
                                disabled={carregando || Number(episodio) < 1}
                            >
                                Consultar episódio
                            </button>

                            {dadosEpisodio && (
                                <div>
                                    <h4>
                                        Episódio {dadosEpisodio.episode_number}:{' '}
                                        {dadosEpisodio.name}
                                    </h4>

                                    <p>
                                        Exibição: {dadosEpisodio.air_date || 'Não informada'}
                                    </p>

                                    <p>
                                        {dadosEpisodio.overview || 'Sinopse não disponível.'}
                                    </p>
                                </div>
                            )}

                            <h3>Elenco e equipe</h3>

                            <button
                                onClick={carregarElenco}
                                disabled={carregando}
                            >
                                Consultar elenco
                            </button>

                            <button
                                onClick={carregarEquipe}
                                disabled={carregando}
                            >
                                Consultar equipe técnica
                            </button>

                            {elenco && (
                                <div>
                                    <h4>Elenco</h4>

                                    <ul>
                                        {(elenco.elenco || []).map((pessoa) => (
                                            <li key={pessoa.id}>
                                                {pessoa.nome} — personagem:{' '}
                                                {pessoa.personagem || 'Não informado'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {equipe && (
                                <div>
                                    <h4>Equipe técnica</h4>

                                    <ul>
                                        {(equipe.equipe || []).map((pessoa, index) => (
                                            <li key={`${pessoa.id}-${pessoa.funcao}-${index}`}>
                                                {pessoa.nome} — {pessoa.funcao}
                                                {pessoa.departamento
                                                    ? ` (${pessoa.departamento})`
                                                    : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </section>
    );
}
