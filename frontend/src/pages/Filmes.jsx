import BarraCatalogo from '../components/BarraCatalogo';
import CartaoConteudo from '../components/CartaoConteudo';
import { useEffect, useState } from 'react';

import {
    listarPopulares,
    buscarFilmes,
    listarMarvel,
    listarFilmesCatalogo
} from '../services/filmeService';

import DetalhesFilme from '../components/DetalhesFilme';


function Filmes({ categoriaInicial = 'populares' }) {
    const [filmes, setFilmes] = useState([]);
    const [categoria, setCategoria] = useState(categoriaInicial);
    const [pesquisa, setPesquisa] = useState('');
    const [consultaAtiva, setConsultaAtiva] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filmeSelecionado, setFilmeSelecionado] = useState(null);

    useEffect(() => {
        let ativo = true;

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

                if (!ativo) return;

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
                if (!ativo) return;
                setErro(erro.message);
                setFilmes([]);
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarFilmes();
        return () => { ativo = false; };
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
        setPesquisa('');
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
                key={filmeSelecionado.id}
                id={filmeSelecionado.id}
                midias={filmeSelecionado.midias}
                origemCatalogo={filmeSelecionado.origemCatalogo}
                onVoltar={() => setFilmeSelecionado(null)}
            />
        );
    }

    return (
        <section className="catalogo">
            <BarraCatalogo
                tipo="filmes"
                categoria={categoria}
                consultaAtiva={consultaAtiva}
                consulta={pesquisa}
                onConsulta={setPesquisa}
                onPesquisar={pesquisar}
                onCategoria={mudarCategoria}
            />

            {carregando && <p className="sr-only" role="status">Carregando filmes…</p>}

            {erro && <p className="erro" role="alert">Erro: {erro}</p>}

            {!carregando && !erro && filmes.length === 0 && (
                <p>Nenhum filme encontrado. Tente outro título ou explore as categorias.</p>
            )}

            <div className="grade-filmes" aria-busy={carregando}>
                {carregando ? Array.from({ length: 6 }, (_, indice) => (
                    <div className="cartao-esqueleto" key={indice} aria-hidden="true"><div /><span /></div>
                )) : filmes.map((filme, indice) => (
                    <CartaoConteudo
                        key={filme.id}
                        titulo={filme.title}
                        poster={filme.poster_path}
                        data={filme.release_date}
                        nota={filme.vote_average}
                        prioridade={indice < 6}
                        onAbrir={() => abrirDetalhes(filme)}
                    />
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
