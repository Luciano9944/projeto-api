import BarraCatalogo from '../components/BarraCatalogo';
import CartaoConteudo from '../components/CartaoConteudo';

import { useEffect, useState } from 'react';

import {
    listarPopulares,
    listarMarvel,
    buscarPorNome,
    buscarPorId,
    listarSeriesCatalogo
} from '../services/serieService';

import DetalhesSerie from '../components/DetalhesSerie';


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

    const [carregando, setCarregando] = useState(true);
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
        setConsulta('');
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
                key={serie.id}
                serie={serie}
                midias={midiasSerie}
                origemCatalogo={origemCatalogo}
                onVoltar={voltarParaLista}
            />
        );
    }

    return (
        <section className="catalogo">
            <BarraCatalogo
                tipo="series"
                categoria={categoria}
                consultaAtiva={consultaAtiva}
                consulta={consulta}
                onConsulta={setConsulta}
                onPesquisar={pesquisar}
                onCategoria={mudarCategoria}
            />

            {erro && <p className="erro" role="alert">Erro: {erro}</p>}
            {carregando && <p className="sr-only" role="status">Carregando séries…</p>}

            {!carregando && !erro && series.length === 0 && (
                <p>Nenhuma série encontrada. Tente outro título ou explore as categorias.</p>
            )}

            <div className="grade-filmes" aria-busy={carregando}>
                {carregando ? Array.from({ length: 6 }, (_, indice) => (
                    <div className="cartao-esqueleto" key={indice} aria-hidden="true"><div /><span /></div>
                )) : series.map((item, indice) => (
                    <CartaoConteudo
                        key={item.id}
                        titulo={item.name || item.original_name}
                        poster={item.poster_path}
                        data={item.first_air_date}
                        nota={item.vote_average}
                        prioridade={indice < 6}
                        onAbrir={() => abrirSerie(item)}
                    />
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
