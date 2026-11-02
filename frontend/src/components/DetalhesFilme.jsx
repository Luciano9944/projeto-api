
import { useEffect, useState } from 'react';
import {
    buscarFilme,
    buscarElenco,
    buscarEquipe
} from '../services/filmeService';
import { buscarPerfil } from '../services/authService';
import {
    verificarFavorito,
    adicionarFavorito,
    removerFavorito,
    listarComentarios,
    criarComentario,
    atualizarComentario,
    excluirComentario
} from '../services/interacaoService';

const IMAGEM_BASE = 'https://image.tmdb.org/t/p/w500';
const FOTO_BASE = 'https://image.tmdb.org/t/p/w185';

function DetalhesFilme({
    id,
    midias = [],
    origemCatalogo = false,
    onVoltar
}) {
    const [filme, setFilme] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [usuario, setUsuario] = useState(null);
    const [favoritado, setFavoritado] = useState(false);
    const [carregandoFavorito, setCarregandoFavorito] = useState(false);

    const [elenco, setElenco] = useState([]);
    const [equipe, setEquipe] = useState([]);
    const [mostrarElenco, setMostrarElenco] = useState(false);
    const [mostrarEquipe, setMostrarEquipe] = useState(false);
    const [carregandoElenco, setCarregandoElenco] = useState(false);
    const [carregandoEquipe, setCarregandoEquipe] = useState(false);
    const [erroCreditos, setErroCreditos] = useState('');

    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [carregandoComentarios, setCarregandoComentarios] = useState(true);
    const [erroComentario, setErroComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const [comentarioEditando, setComentarioEditando] = useState(null);
    const [textoEdicao, setTextoEdicao] = useState('');

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

    useEffect(() => {
        async function verificarUsuario() {
            try {
                const dados = await buscarPerfil();
                setUsuario(dados.usuario);

                const favorito = await verificarFavorito('filme', id);
                setFavoritado(favorito.favoritado);
            } catch {
                setUsuario(null);
                setFavoritado(false);
            }
        }

        verificarUsuario();
    }, [id]);

    async function carregarComentarios() {
        try {
            setCarregandoComentarios(true);
            setErroComentario('');

            const dados = await listarComentarios('filme', id);
            setComentarios(dados.comentarios || []);
        } catch (erro) {
            setErroComentario(erro.message);
        } finally {
            setCarregandoComentarios(false);
        }
    }

    useEffect(() => {
        carregarComentarios();
    }, [id]);

    async function carregarElenco() {
        if (elenco.length > 0) {
            setMostrarElenco(!mostrarElenco);
            return;
        }

        try {
            setCarregandoElenco(true);
            setErroCreditos('');

            const dados = await buscarElenco(id);
            setElenco(dados.elenco || []);
            setMostrarElenco(true);
        } catch (erro) {
            setErroCreditos(erro.message);
        } finally {
            setCarregandoElenco(false);
        }
    }

    async function carregarEquipe() {
        if (equipe.length > 0) {
            setMostrarEquipe(!mostrarEquipe);
            return;
        }

        try {
            setCarregandoEquipe(true);
            setErroCreditos('');

            const dados = await buscarEquipe(id);
            setEquipe(dados.equipe || []);
            setMostrarEquipe(true);
        } catch (erro) {
            setErroCreditos(erro.message);
        } finally {
            setCarregandoEquipe(false);
        }
    }

    async function alternarFavorito() {
        if (!usuario) {
            setErroComentario('Entre na sua conta para adicionar favoritos.');
            return;
        }

        try {
            setCarregandoFavorito(true);

            if (favoritado) {
                await removerFavorito('filme', id);
                setFavoritado(false);
            } else {
                await adicionarFavorito('filme', id);
                setFavoritado(true);
            }
        } catch (erro) {
            setErroComentario(erro.message);
        } finally {
            setCarregandoFavorito(false);
        }
    }

    async function publicarComentario(event) {
        event.preventDefault();

        if (!usuario) {
            setErroComentario('Entre na sua conta para comentar.');
            return;
        }

        if (!novoComentario.trim()) {
            setErroComentario('Digite um comentário antes de publicar.');
            return;
        }

        try {
            setEnviandoComentario(true);
            setErroComentario('');

            await criarComentario('filme', id, novoComentario);

            setNovoComentario('');
            await carregarComentarios();
        } catch (erro) {
            setErroComentario(erro.message);
        } finally {
            setEnviandoComentario(false);
        }
    }

    function iniciarEdicao(comentario) {
        setComentarioEditando(comentario.id);
        setTextoEdicao(comentario.texto);
        setErroComentario('');
    }

    async function salvarEdicao(idComentario) {
        if (!textoEdicao.trim()) {
            setErroComentario('O comentário não pode ficar vazio.');
            return;
        }

        try {
            setErroComentario('');

            await atualizarComentario(idComentario, textoEdicao);

            setComentarioEditando(null);
            setTextoEdicao('');

            await carregarComentarios();
        } catch (erro) {
            setErroComentario(erro.message);
        }
    }

    async function removerComentario(idComentario) {
        try {
            setErroComentario('');

            await excluirComentario(idComentario);
            await carregarComentarios();
        } catch (erro) {
            setErroComentario(erro.message);
        }
    }

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

                    <button
                        onClick={alternarFavorito}
                        disabled={!usuario || carregandoFavorito}
                    >
                        {carregandoFavorito
                            ? 'Aguarde...'
                            : favoritado
                                ? 'Remover dos favoritos'
                                : 'Adicionar aos favoritos'}
                    </button>

                    {!usuario && (
                        <p>Entre na sua conta para favoritar este filme.</p>
                    )}
                </div>
            </div>

            <section className="creditos-filme">
                <h3>Elenco e equipe técnica</h3>

                <button
                    onClick={carregarElenco}
                    disabled={carregandoElenco}
                >
                    {carregandoElenco
                        ? 'Carregando elenco...'
                        : mostrarElenco
                            ? 'Ocultar elenco'
                            : 'Ver elenco'}
                </button>

                <button
                    onClick={carregarEquipe}
                    disabled={carregandoEquipe}
                >
                    {carregandoEquipe
                        ? 'Carregando equipe...'
                        : mostrarEquipe
                            ? 'Ocultar equipe técnica'
                            : 'Ver equipe técnica'}
                </button>

                {erroCreditos && (
                    <p className="erro">{erroCreditos}</p>
                )}

                {mostrarElenco && (
                    <div className="elenco-filme">
                        <h4>Elenco</h4>

                        {elenco.length > 0 ? (
                            elenco.map(ator => (
                                <article key={ator.id}>
                                    {ator.foto && (
                                        <img
                                            src={`${FOTO_BASE}${ator.foto}`}
                                            alt={ator.nome}
                                            width="80"
                                        />
                                    )}

                                    <p><strong>{ator.nome}</strong></p>
                                    <p>Personagem: {ator.personagem || 'Não informado'}</p>
                                </article>
                            ))
                        ) : (
                            <p>Nenhuma informação de elenco disponível.</p>
                        )}
                    </div>
                )}

                {mostrarEquipe && (
                    <div className="equipe-filme">
                        <h4>Equipe técnica</h4>

                        {equipe.length > 0 ? (
                            equipe.map(profissional => (
                                <article key={`${profissional.id}-${profissional.funcao}`}>
                                    {profissional.foto && (
                                        <img
                                            src={`${FOTO_BASE}${profissional.foto}`}
                                            alt={profissional.nome}
                                            width="80"
                                        />
                                    )}

                                    <p><strong>{profissional.nome}</strong></p>
                                    <p>
                                        Departamento: {profissional.departamento || 'Não informado'}
                                    </p>
                                    <p>
                                        Função: {profissional.funcao || 'Não informada'}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <p>Nenhuma informação de equipe técnica disponível.</p>
                        )}
                    </div>
                )}
            </section>

            {origemCatalogo && (
                <section className="midias-filme">
                    <h3>Assistir filme</h3>

                    {midias.length > 0 ? (
                        midias.map(midia => (
                            <article
                                className="midia-filme"
                                key={midia.id}
                            >
                                <h4>{midia.titulo}</h4>

                                {midia.descricao && (
                                    <p>{midia.descricao}</p>
                                )}

                                <iframe
                                    src={midia.embed_url}
                                    title={midia.titulo}
                                    width="100%"
                                    height="480"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            </article>
                        ))
                    ) : (
                        <p>Nenhum vídeo disponível para este filme.</p>
                    )}
                </section>
            )}

            <section className="comentarios-filme">
                <h3>Comentários</h3>

                {usuario ? (
                    <form onSubmit={publicarComentario}>
                        <textarea
                            value={novoComentario}
                            onChange={event => setNovoComentario(event.target.value)}
                            placeholder="Escreva seu comentário..."
                            maxLength={3000}
                            rows={4}
                        />

                        <button type="submit" disabled={enviandoComentario}>
                            {enviandoComentario
                                ? 'Publicando...'
                                : 'Publicar comentário'}
                        </button>
                    </form>
                ) : (
                    <p>Entre na sua conta para publicar comentários.</p>
                )}

                {erroComentario && (
                    <p className="erro">{erroComentario}</p>
                )}

                {carregandoComentarios ? (
                    <p>Carregando comentários...</p>
                ) : comentarios.length > 0 ? (
                    comentarios.map(comentario => (
                        <article
                            className="comentario"
                            key={comentario.id}
                        >
                            <h4>{comentario.nome_usuario}</h4>

                            {comentarioEditando === comentario.id ? (
                                <>
                                    <textarea
                                        value={textoEdicao}
                                        onChange={event => setTextoEdicao(event.target.value)}
                                        maxLength={3000}
                                        rows={4}
                                    />

                                    <button
                                        onClick={() => salvarEdicao(comentario.id)}
                                    >
                                        Salvar
                                    </button>

                                    <button
                                        onClick={() => setComentarioEditando(null)}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <p>{comentario.texto}</p>
                            )}

                            <small>
                                {new Date(comentario.criado_em).toLocaleString('pt-BR')}
                            </small>

                            {usuario &&
                                String(usuario.id) === String(comentario.usuario_id) &&
                                comentarioEditando !== comentario.id && (
                                    <div>
                                        <button
                                            onClick={() => iniciarEdicao(comentario)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => removerComentario(comentario.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                )}
                        </article>
                    ))
                ) : (
                    <p>Nenhum comentário publicado ainda.</p>
                )}
            </section>
        </section>
    );
}

export default DetalhesFilme;
