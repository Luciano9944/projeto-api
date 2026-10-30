import { useEffect, useState } from 'react';
import { buscarFilme } from '../services/filmeService';

const IMAGEM_BASE = 'https://image.tmdb.org/t/p/w500';

function DetalhesFilme({ id, onVoltar }) {
    const [filme, setFilme] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        async function carregarDetalhes() {
            try {
                setCarregando(true);
                setErro('');

                const dados = await buscarFilme(id);
                setFilme(dados);
            } catch (erro) {
                setErro(erro.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarDetalhes();
    }, [id]);

    if (carregando) {
        return (
            <section className="detalhes-filme">
                <button onClick={onVoltar}>Voltar ao catálogo</button>
                <p>Carregando detalhes do filme...</p>
            </section>
        );
    }

    if (erro || !filme) {
        return (
            <section className="detalhes-filme">
                <button onClick={onVoltar}>Voltar ao catálogo</button>
                <p className="erro">{erro || 'Filme não encontrado.'}</p>
            </section>
        );
    }

    return (
        <section className="detalhes-filme">
            <button onClick={onVoltar}>← Voltar ao catálogo</button>

            <div className="detalhes-conteudo">
                {filme.poster_path && (
                    <img
                        className="detalhes-poster"
                        src={`${IMAGEM_BASE}${filme.poster_path}`}
                        alt={`Pôster de ${filme.title}`}
                    />
                )}

                <div className="detalhes-informacoes">
                    <h2>{filme.title}</h2>

                    {filme.original_title &&
                        filme.original_title !== filme.title && (
                            <p>
                                <strong>Título original:</strong>{' '}
                                {filme.original_title}
                            </p>
                        )}

                    <p>
                        <strong>Lançamento:</strong>{' '}
                        {filme.release_date || 'Não informado'}
                    </p>

                    <p>
                        <strong>Nota:</strong>{' '}
                        {Number(filme.vote_average || 0).toFixed(1)}/10
                    </p>

                    <p>
                        <strong>Duração:</strong>{' '}
                        {filme.runtime
                            ? `${filme.runtime} minutos`
                            : 'Não informada'}
                    </p>

                    <p>
                        <strong>Idioma original:</strong>{' '}
                        {filme.original_language || 'Não informado'}
                    </p>

                    <p>
                        <strong>Gêneros:</strong>{' '}
                        {filme.genres?.length
                            ? filme.genres.map(genero => genero.name).join(', ')
                            : 'Não informados'}
                    </p>

                    <h3>Sinopse</h3>
                    <p>
                        {filme.overview || 'Sinopse não disponível.'}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default DetalhesFilme;