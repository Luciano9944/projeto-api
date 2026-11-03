
import { useEffect, useState } from 'react';

import {
    buscarTemporada,
    buscarEpisodio,
    buscarElenco,
    buscarEquipe
} from '../services/serieService';

import {
    verificarFavorito,
    adicionarFavorito,
    removerFavorito,
    listarComentarios,
    criarComentario,
    atualizarComentario,
    excluirComentario
} from '../services/interacaoService';

import { buscarPerfil } from '../services/authService';

const IMAGEM_BASE = 'https://image.tmdb.org/t/p/w300';
const FOTO_BASE = 'https://image.tmdb.org/t/p/w185';

export default function DetalhesSerie({
    serie,
    midias = [],
    origemCatalogo = false,
    onVoltar
}) {
    const [midiaSelecionada, setMidiaSelecionada] = useState(null);

    const [temporada, setTemporada] = useState('1');
    const [dadosTemporada, setDadosTemporada] = useState(null);

    const [episodio, setEpisodio] = useState('1');
    const [dadosEpisodio, setDadosEpisodio] = useState(null);

    const [elenco, setElenco] = useState([]);
    const [equipe, setEquipe] = useState([]);
    const [mostrarElenco, setMostrarElenco] = useState(false);
    const [mostrarEquipe, setMostrarEquipe] = useState(false);
    const [carregandoElenco, setCarregandoElenco] = useState(false);
    const [carregandoEquipe, setCarregandoEquipe] = useState(false);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    // Estados de autenticação e favoritos.
    const [usuario, setUsuario] = useState(null);
    const [favoritado, setFavoritado] = useState(false);
    const [carregandoFavorito, setCarregandoFavorito] = useState(false);

    // Estados dos comentários.
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [comentarioEditando, setComentarioEditando] = useState(null);
    const [textoEdicao, setTextoEdicao] = useState('');
    const [carregandoComentarios, setCarregandoComentarios] = useState(true);
    const [erroComentario, setErroComentario] = useState('');
    const [comentariosRestritos, setComentariosRestritos] = useState(false);
    const [mensagemComentario, setMensagemComentario] = useState('');

    // Carrega usuário, favorito e comentários da série.
    useEffect(() => {
        if (!serie?.id) return;

        let ativo = true;

        async function carregarInteracoes() {
            setUsuario(null);
            setFavoritado(false);
            setComentarios([]);
            setErroComentario('');
            setMensagemComentario('');
            setComentarioEditando(null);

            try {
                const resultado = await listarComentarios('serie', serie.id);

                if (ativo) {
                    setComentarios(resultado.comentarios || []);
                    setCarregandoComentarios(false);
                }
            } catch (error) {
                if (ativo) {
                    if (error.status === 401) setComentariosRestritos(true);
                    else setErroComentario(error.message);
                    setCarregandoComentarios(false);
                }
            }

            try {
                const perfil = await buscarPerfil();

                if (!ativo) return;

                const usuarioAtual = perfil?.usuario || null;
                setUsuario(usuarioAtual);

                if (usuarioAtual) {
                    const resultadoFavorito = await verificarFavorito(
                        'serie',
                        serie.id
                    );

                    if (ativo) {
                        setFavoritado(resultadoFavorito.favoritado);
                    }
                }
            } catch {
                if (ativo) {
                    setUsuario(null);
                    setFavoritado(false);
                }
            }
        }

        carregarInteracoes();

        return () => {
            ativo = false;
        };
    }, [serie?.id]);

    async function carregarComentarios() {
        try {
            const resultado = await listarComentarios('serie', serie.id);
            setComentarios(resultado.comentarios || []);
            setErroComentario('');
        } catch (error) {
            setErroComentario(error.message);
        }
    }

    async function alternarFavorito() {
        if (!usuario || carregandoFavorito) return;

        setCarregandoFavorito(true);
        setErroComentario('');

        try {
            if (favoritado) {
                await removerFavorito('serie', serie.id);
                setFavoritado(false);
            } else {
                await adicionarFavorito('serie', serie.id);
                setFavoritado(true);
            }
        } catch (error) {
            setErroComentario(error.message);
        } finally {
            setCarregandoFavorito(false);
        }
    }

    async function publicarComentario(event) {
        event.preventDefault();
        if (enviandoComentario) return;

        if (!novoComentario.trim()) {
            setErroComentario('Digite um comentário antes de publicar.');
            return;
        }

        try {
            setEnviandoComentario(true);
            setErroComentario('');
            setMensagemComentario('');

            await criarComentario(
                'serie',
                serie.id,
                novoComentario.trim()
            );

            setNovoComentario('');
            setMensagemComentario('Comentário publicado com sucesso.');

            await carregarComentarios();
        } catch (error) {
            setErroComentario(error.message);
        } finally {
            setEnviandoComentario(false);
        }
    }

    function iniciarEdicao(comentario) {
        setComentarioEditando(comentario.id);
        setTextoEdicao(comentario.texto);
        setErroComentario('');
        setMensagemComentario('');
    }

    async function salvarEdicao(id) {
        if (!textoEdicao.trim()) {
            setErroComentario('O comentário não pode ficar vazio.');
            return;
        }

        try {
            await atualizarComentario(id, textoEdicao.trim());

            setComentarioEditando(null);
            setTextoEdicao('');
            setMensagemComentario('Comentário atualizado com sucesso.');
            setErroComentario('');

            await carregarComentarios();
        } catch (error) {
            setErroComentario(error.message);
        }
    }

    async function removerComentario(id) {
        const confirmar = window.confirm(
            'Tem certeza de que deseja excluir este comentário?'
        );

        if (!confirmar) return;

        try {
            await excluirComentario(id);

            setMensagemComentario('Comentário excluído com sucesso.');
            setErroComentario('');

            await carregarComentarios();
        } catch (error) {
            setErroComentario(error.message);
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
        if (mostrarElenco) {
            setMostrarElenco(false);
            return;
        }

        if (elenco.length > 0) {
            setMostrarElenco(true);
            return;
        }

        setCarregandoElenco(true);
        setErro('');

        try {
            const resultado = await buscarElenco(serie.id);
            setElenco(resultado.elenco || []);
            setMostrarElenco(true);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregandoElenco(false);
        }
    }

    async function carregarEquipe() {
        if (mostrarEquipe) {
            setMostrarEquipe(false);
            return;
        }

        if (equipe.length > 0) {
            setMostrarEquipe(true);
            return;
        }

        setCarregandoEquipe(true);
        setErro('');

        try {
            const resultado = await buscarEquipe(serie.id);
            setEquipe(resultado.equipe || []);
            setMostrarEquipe(true);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregandoEquipe(false);
        }
    }

    // Agrupa as mídias cadastradas por temporada.
    const midiasPorTemporada = midias.reduce((grupos, midia) => {
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
        <section className="detalhes-serie">
            <button onClick={onVoltar}>
                Voltar para a lista
            </button>

            <h1>{nomeSerie}</h1>

            {serie.poster_path && (
                <img width="300" height="450"
                    src={`${IMAGEM_BASE}${serie.poster_path}`}
                    alt={`Pôster de ${nomeSerie}`}
                    style={{
                        width: '200px',
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain'
                    }}
                />
            )}

            <p>{sinopse || 'Sinopse não disponível.'}</p>

            <p>
                Primeira exibição:{' '}
                {serie.data_estreia ||
                    serie.first_air_date ||
                    'Não informada'}
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
                {serie.episodios ??
                    serie.number_of_episodes ??
                    'Não informado'}
            </p>

            <p>
                Situação:{' '}
                {serie.situacao ||
                    serie.status ||
                    'Não informada'}
            </p>

            {/* Favoritos */}
            <h2>Favoritos</h2>

            {usuario ? (
                <button
                    type="button"
                    onClick={alternarFavorito} aria-pressed={favoritado}
                    disabled={carregandoFavorito}
                >
                    {carregandoFavorito
                        ? 'Aguarde…'
                        : favoritado
                            ? 'Remover dos favoritos'
                            : 'Adicionar aos favoritos'}
                </button>
            ) : (
                <p>Faça login para adicionar esta série aos favoritos.</p>
            )}

            {erro && (
                <p className="erro" role="alert">Erro: {erro}</p>
            )}

            {/* Comentários */}
            <section className="comentarios">
                <h2>Comentários</h2>

                {usuario ? (
                    <form onSubmit={publicarComentario}>
                        <label>
                            Escreva seu comentário:
                            <textarea aria-label="Comentário" name="comentario"
                                value={novoComentario}
                                onChange={event => setNovoComentario(event.target.value)}
                                maxLength={3000}
                                rows={4}
                                placeholder="O que você achou desta série?"
                            />
                        </label>

                        <p>{novoComentario.length}/3000 caracteres</p>

                        <button type="submit" disabled={enviandoComentario}>
                            {enviandoComentario ? 'Publicando…' : 'Publicar comentário'}
                        </button>
                    </form>
                ) : (
                    <p>{comentariosRestritos ? 'Entre na sua conta para ver e publicar comentários.' : 'Entre na sua conta para publicar comentários.'}</p>
                )}

                {erroComentario && (
                    <p className="erro" role="alert">{erroComentario}</p>
                )}

                {mensagemComentario && (
                    <p role="status">{mensagemComentario}</p>
                )}

                {carregandoComentarios ? (
                    <p role="status">Carregando comentários…</p>
                ) : comentarios.length > 0 ? (
                    comentarios.map(comentario => (
                        <article
                            className="comentario"
                            key={comentario.id}
                        >
                            <h3>{comentario.nome_usuario}</h3>

                            {comentarioEditando === comentario.id ? (
                                <>
                                    <textarea aria-label="Comentário" name="comentario"
                                        value={textoEdicao}
                                        onChange={event => setTextoEdicao(event.target.value)}
                                        maxLength={3000}
                                        rows={4}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => salvarEdicao(comentario.id)}
                                    >
                                        Salvar edição
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setComentarioEditando(null)}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <p>{comentario.texto}</p>
                            )}

                            {usuario &&
                                String(usuario.id) === String(comentario.usuario_id) &&
                                comentarioEditando !== comentario.id && (
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => iniciarEdicao(comentario)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => removerComentario(comentario.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                )}
                        </article>
                    ))
                ) : (
                    !comentariosRestritos && !erroComentario && <p>Nenhum comentário publicado para esta série.</p>
                )}
            </section>

            {origemCatalogo ? (
                <>
                    <h2>Episódios disponíveis no site</h2>

                    {temporadasCadastradas.length > 0 ? (
                        temporadasCadastradas.map(numeroTemporada => (
                            <div
                                className="temporada-catalogo"
                                key={numeroTemporada}
                            >
                                <h3>
                                    {Number(numeroTemporada) === 0
                                        ? 'Especiais'
                                        : `Temporada ${numeroTemporada}`}
                                </h3>

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
                        <p>
                            Nenhum episódio cadastrado no site para esta série.
                        </p>
                    )}

                    {midiaSelecionada && (
                        <div className="player-serie">
                            <h2>{midiaSelecionada.titulo}</h2>

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
                    <h2>Temporadas e episódios no TMDB</h2>

                    <label>
                        Temporada:{' '}
                        <select
                            value={temporada}
                            onChange={event => {
                                setTemporada(event.target.value);
                                setDadosTemporada(null);
                                setDadosEpisodio(null);
                            }}
                        >
                            {Array.from(
                                { length: numeroTemporadas + 1 },
                                (_, index) => index
                            ).map(numero => (
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
                            <h3>
                                {dadosTemporada.name ||
                                    `Temporada ${temporada}`}
                            </h3>

                            <p>
                                Episódios:{' '}
                                {dadosTemporada.episodes?.length ?? 0}
                            </p>

                            <ul>
                                {(dadosTemporada.episodes || []).map(item => (
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
                            onChange={event => setEpisodio(event.target.value)}
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
                            <h3>
                                Episódio {dadosEpisodio.episode_number}:{' '}
                                {dadosEpisodio.name}
                            </h3>

                            <p>
                                Exibição:{' '}
                                {dadosEpisodio.air_date || 'Não informada'}
                            </p>

                            <p>
                                {dadosEpisodio.overview ||
                                    'Sinopse não disponível.'}
                            </p>
                        </div>
                    )}

                    <h2>Elenco e equipe</h2>

                    <button
                        type="button"
                        onClick={carregarElenco} aria-expanded={mostrarElenco}
                        disabled={carregandoElenco}
                    >
                        {carregandoElenco
                            ? 'Carregando elenco…'
                            : mostrarElenco
                                ? 'Ocultar elenco'
                                : 'Consultar elenco'}
                    </button>

                    <button
                        type="button"
                        onClick={carregarEquipe} aria-expanded={mostrarEquipe}
                        disabled={carregandoEquipe}
                    >
                        {carregandoEquipe
                            ? 'Carregando equipe…'
                            : mostrarEquipe
                                ? 'Ocultar equipe técnica'
                                : 'Consultar equipe técnica'}
                    </button>

                    {mostrarElenco && (
                        <div className="elenco-serie">
                            <h3>Elenco</h3>

                            {elenco.length > 0 ? (
                                elenco.map((pessoa, index) => (
                                    <article key={`${pessoa.id}-${index}`}>
                                        {pessoa.foto && (
                                            <img width="80" height="110" loading="lazy"
                                                src={`${FOTO_BASE}${pessoa.foto}`}
                                                alt={pessoa.nome}

                                            />
                                        )}

                                        <p>
                                            <strong>{pessoa.nome}</strong>
                                        </p>

                                        <p>
                                            Personagem:{' '}
                                            {pessoa.personagem || 'Não informado'}
                                        </p>
                                    </article>
                                ))
                            ) : (
                                <p>Nenhuma informação de elenco disponível.</p>
                            )}
                        </div>
                    )}

                    {mostrarEquipe && (
                        <div className="equipe-serie">
                            <h3>Equipe técnica</h3>

                            {equipe.length > 0 ? (
                                equipe.map((pessoa, index) => (
                                    <article key={`${pessoa.id}-${pessoa.funcao}-${index}`}>
                                        {pessoa.foto && (
                                            <img width="80" height="110" loading="lazy"
                                                src={`${FOTO_BASE}${pessoa.foto}`}
                                                alt={pessoa.nome}

                                            />
                                        )}

                                        <p>
                                            <strong>{pessoa.nome}</strong>
                                        </p>

                                        <p>
                                            Função: {pessoa.funcao || 'Não informada'}
                                        </p>

                                        <p>
                                            Departamento: {pessoa.departamento || 'Não informado'}
                                        </p>
                                    </article>
                                ))
                            ) : (
                                <p>Nenhuma informação de equipe técnica disponível.</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
