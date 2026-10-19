
import { useEffect, useState } from 'react';

import {
    listarPopulares,
    buscarFilmes,
    listarMarvel
} from '../services/filmeService';

const IMAGEM_BASE = 'https://image.tmdb.org/t/p/w500';

function Filmes() {
    const [filmes, setFilmes] = useState([]);
    const [categoria, setCategoria] = useState('populares');
    const [pesquisa, setPesquisa] = useState('');
    const [consultaAtiva, setConsultaAtiva] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

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
                } else {
                    dados = await listarPopulares(pagina);
                }

                setFilmes(dados.results || []);
                setTotalPaginas(Math.min(dados.total_pages || 1, 500));
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
        setCategoria(novaCategoria);
        setPagina(1);
        setPesquisa('');
        setConsultaAtiva('');
        setErro('');
    }

    return (
        <section className="catalogo">
            <nav className="catalogo-menu">
                <button
                    className={categoria === 'populares' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('populares')}
                >
                    Populares
                </button>

                <button
                    className={categoria === 'marvel' ? 'ativo' : ''}
                    onClick={() => mudarCategoria('marvel')}
                >
                    Marvel
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
                    ? 'Filmes da Marvel'
                    : categoria === 'busca'
                        ? `Resultados para "${consultaAtiva}"`
                        : 'Filmes populares'}
            </h2>

            {carregando && <p>Carregando filmes...</p>}

            {erro && <p className="erro">{erro}</p>}

            {!carregando && !erro && filmes.length === 0 && (
                <p>Nenhum filme encontrado.</p>
            )}

            <div className="grade-filmes">
                {filmes.map((filme) => (
                    <article className="cartao-filme" key={filme.id}>
                        {filme.poster_path ? (
                            <img
                                src={`${IMAGEM_BASE}${filme.poster_path}`}
                                alt={`Pôster de ${filme.title}`}
                                loading="lazy"
                            />
                        ) : (
                            <div className="poster-indisponivel">
                                Pôster indisponível
                            </div>
                        )}

                        <div className="informacoes-filme">
                            <h3>{filme.title}</h3>

                            <p>
                                Ano: {filme.release_date
                                    ? filme.release_date.slice(0, 4)
                                    : 'Não informado'}
                            </p>

                            <p>
                                ⭐ {Number(filme.vote_average || 0).toFixed(1)}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            {!carregando && filmes.length > 0 && (
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
        </section>
    );
}

export default Filmes;
