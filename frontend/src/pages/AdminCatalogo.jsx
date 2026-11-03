import ResumoConteudoAdmin from '../components/ResumoConteudoAdmin';

import { useEffect, useState } from 'react';

import {
    pesquisarNoTmdb,
    cadastrarNoCatalogo,
    listarCatalogo,
    atualizarConteudo,
    desativarConteudo
} from '../services/catalogoService';

import {
    listarMidiasPorConteudo,
    cadastrarMidia,
    atualizarMidia,
    desativarMidia
} from '../services/midiaService';

function AdminCatalogo() {
    const [tipo, setTipo] = useState('filme');
    const [consulta, setConsulta] = useState('');
    const [resultados, setResultados] = useState([]);

    const [catalogo, setCatalogo] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('');

    const [carregando, setCarregando] = useState(false);
    const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
    const [importando, setImportando] = useState(null);

    const [erro, setErro] = useState('');
    const [erroCatalogo, setErroCatalogo] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [editando, setEditando] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [desativando, setDesativando] = useState(null);

    const [conteudoSelecionado, setConteudoSelecionado] = useState(null);
    const [midias, setMidias] = useState([]);
    const [carregandoMidias, setCarregandoMidias] = useState(false);
    const [erroMidias, setErroMidias] = useState('');

    const [midiaEditando, setMidiaEditando] = useState(null);
    const [salvandoMidia, setSalvandoMidia] = useState(false);
    const [desativandoMidia, setDesativandoMidia] = useState(null);

    const formularioMidiaInicial = {
        titulo: '',
        descricao: '',
        google_drive_file_id: '',
        imagem_url: '',
        ordem: '1',
        temporada: '',
        episodio: ''
    };

    const [formularioMidia, setFormularioMidia] = useState(
        formularioMidiaInicial
    );

    async function carregarCatalogo() {
        setCarregandoCatalogo(true);
        setErroCatalogo('');

        try {
            const dados = await listarCatalogo(filtroTipo);

            if (!Array.isArray(dados)) {
                throw new Error('A API retornou um formato inesperado.');
            }

            setCatalogo(dados);
        } catch (erro) {
            setErroCatalogo(erro.message);
        } finally {
            setCarregandoCatalogo(false);
        }
    }

    useEffect(() => {
        let ativo = true;
        listarCatalogo(filtroTipo)
            .then(dados => {
                if (!Array.isArray(dados)) throw new Error('A API retornou um formato inesperado.');
                if (ativo) { setCatalogo(dados); setErroCatalogo(''); }
            })
            .catch(erro => { if (ativo) setErroCatalogo(erro.message); })
            .finally(() => { if (ativo) setCarregandoCatalogo(false); });
        return () => { ativo = false; };
    }, [filtroTipo]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!consulta.trim()) {
            setErro('Digite um título para pesquisar.');
            return;
        }

        setCarregando(true);
        setErro('');
        setMensagem('');
        setResultados([]);

        try {
            const dados = await pesquisarNoTmdb(tipo, consulta.trim());
            setResultados(dados);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    async function handleImportar(item) {
        setImportando(item.tmdb_id);
        setErro('');
        setMensagem('');

        try {
            await cadastrarNoCatalogo(item);

            setMensagem(
                `"${item.titulo}" foi adicionado ao catálogo com sucesso.`
            );

            await carregarCatalogo();
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setImportando(null);
        }
    }

    function iniciarEdicao(item) {
        setEditando({
            id: item.id,
            titulo: item.titulo || '',
            sinopse: item.sinopse || '',
            data_lancamento: item.data_lancamento
                ? item.data_lancamento.substring(0, 10)
                : '',
            poster_path: item.poster_path || '',
            nota_media: item.nota_media ?? ''
        });

        setErro('');
        setMensagem('');
    }

    function cancelarEdicao() {
        setEditando(null);
    }

    async function handleSalvarEdicao(event) {
        event.preventDefault();

        setSalvando(true);
        setErro('');
        setMensagem('');

        try {
            const dados = {
                titulo: editando.titulo,
                sinopse: editando.sinopse,
                data_lancamento: editando.data_lancamento || null,
                poster_path: editando.poster_path || null,
                nota_media: editando.nota_media === ''
                    ? null
                    : Number(editando.nota_media)
            };

            await atualizarConteudo(editando.id, dados);

            setMensagem(
                `"${editando.titulo}" foi atualizado com sucesso.`
            );

            setEditando(null);
            await carregarCatalogo();
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    }

    async function handleDesativar(item) {
        const confirmar = window.confirm(
            `Deseja realmente desativar "${item.titulo}"?`
        );

        if (!confirmar) {
            return;
        }

        setDesativando(item.id);
        setErro('');
        setMensagem('');

        try {
            await desativarConteudo(item.id);

            setMensagem(
                `"${item.titulo}" foi desativado com sucesso.`
            );

            if (editando?.id === item.id) {
                setEditando(null);
            }

            if (conteudoSelecionado?.id === item.id) {
                fecharGerenciamentoMidias();
            }

            await carregarCatalogo();
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setDesativando(null);
        }
    }

    async function abrirGerenciamentoMidias(item) {
        setConteudoSelecionado(item);
        setMidias([]);
        setErroMidias('');
        setFormularioMidia(formularioMidiaInicial);
        setMidiaEditando(null);
        setCarregandoMidias(true);

        try {
            const dados = await listarMidiasPorConteudo(item.id);

            if (!Array.isArray(dados)) {
                throw new Error('A API retornou uma lista de mídias inválida.');
            }

            setMidias(dados);
        } catch (erro) {
            setErroMidias(erro.message);
        } finally {
            setCarregandoMidias(false);
        }
    }

    function fecharGerenciamentoMidias() {
        setConteudoSelecionado(null);
        setMidias([]);
        setMidiaEditando(null);
        setFormularioMidia(formularioMidiaInicial);
        setErroMidias('');
    }

    function atualizarCampoMidia(campo, valor) {
        setFormularioMidia(atual => ({
            ...atual,
            [campo]: valor
        }));
    }

    function iniciarEdicaoMidia(midia) {
        setMidiaEditando(midia.id);

        setFormularioMidia({
            titulo: midia.titulo || '',
            descricao: midia.descricao || '',
            google_drive_file_id: midia.google_drive_file_id || '',
            imagem_url: midia.imagem_url || '',
            ordem: String(midia.ordem ?? 1),
            temporada: midia.temporada === null ||
                midia.temporada === undefined
                ? ''
                : String(midia.temporada),
            episodio: midia.episodio === null ||
                midia.episodio === undefined
                ? ''
                : String(midia.episodio)
        });

        setErroMidias('');
    }

    function cancelarEdicaoMidia() {
        setMidiaEditando(null);
        setFormularioMidia(formularioMidiaInicial);
        setErroMidias('');
    }

    async function handleSalvarMidia(event) {
        event.preventDefault();

        if (!conteudoSelecionado) {
            return;
        }

        setSalvandoMidia(true);
        setErroMidias('');

        try {
            const dados = {
                conteudo_id: conteudoSelecionado.id,
                titulo: formularioMidia.titulo.trim(),
                descricao: formularioMidia.descricao.trim() || null,
                google_drive_file_id:
                    formularioMidia.google_drive_file_id.trim(),
                imagem_url: formularioMidia.imagem_url.trim() || null,
                ordem: Number(formularioMidia.ordem)
            };

            if (conteudoSelecionado.tipo_conteudo === 'serie') {
                dados.temporada = Number(formularioMidia.temporada);
                dados.episodio = Number(formularioMidia.episodio);
            } else {
                dados.temporada = null;
                dados.episodio = null;
            }

            if (midiaEditando !== null) {
                await atualizarMidia(midiaEditando, dados);
            } else {
                await cadastrarMidia(dados);
            }

            setFormularioMidia(formularioMidiaInicial);
            setMidiaEditando(null);

            const atualizadas = await listarMidiasPorConteudo(
                conteudoSelecionado.id
            );

            setMidias(atualizadas);

            setMensagem(
                midiaEditando !== null
                    ? 'Mídia atualizada com sucesso.'
                    : 'Mídia cadastrada com sucesso.'
            );
        } catch (erro) {
            setErroMidias(erro.message);
        } finally {
            setSalvandoMidia(false);
        }
    }

    async function handleDesativarMidia(midia) {
        const confirmar = window.confirm(
            `Deseja realmente desativar a mídia "${midia.titulo}"?`
        );

        if (!confirmar) {
            return;
        }

        setDesativandoMidia(midia.id);
        setErroMidias('');

        try {
            await desativarMidia(midia.id);

            const atualizadas = await listarMidiasPorConteudo(
                conteudoSelecionado.id
            );

            setMidias(atualizadas);

            if (midiaEditando === midia.id) {
                cancelarEdicaoMidia();
            }

            setMensagem(
                `"${midia.titulo}" foi desativada com sucesso.`
            );
        } catch (erro) {
            setErroMidias(erro.message);
        } finally {
            setDesativandoMidia(null);
        }
    }

    return (
        <section className="admin-catalogo">
            <h1>Gerenciar catálogo</h1>

            <p>
                Pesquise filmes e séries no TMDB para importar para o CineMarvel.
            </p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="tipo">Tipo de conteúdo:</label>

                    <select
                        id="tipo"
                        value={tipo}
                        onChange={event => {
                            setTipo(event.target.value);
                            setResultados([]);
                            setErro('');
                            setMensagem('');
                        }}
                    >
                        <option value="filme">Filmes</option>
                        <option value="serie">Séries</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="consulta">Título:</label>

                    <input
                        id="consulta"
                        type="text"
                        value={consulta}
                        onChange={event => setConsulta(event.target.value)}
                        placeholder="Digite o nome do filme ou série"
                    />
                </div>

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Pesquisando...' : 'Pesquisar'}
                </button>
            </form>

            {erro && <p className="erro" role="alert">{erro}</p>}
            {mensagem && <p className="mensagem" role="status">{mensagem}</p>}

            {resultados.length > 0 && (
                <div>
                    <h2>Resultados encontrados</h2>

                    {resultados.map(item => (
                        <article className="admin-item" key={item.tmdb_id}>
                            <ResumoConteudoAdmin item={item}>
                                <button
                                    type="button"
                                    disabled={importando !== null}
                                    onClick={() => handleImportar(item)}
                                >
                                    {importando === item.tmdb_id
                                        ? 'Adicionando...'
                                        : 'Adicionar ao catálogo'}
                                </button>
                            </ResumoConteudoAdmin>
                        </article>
                    ))}
                </div>
            )}

            <hr />

            <section>
                <h2>Conteúdos cadastrados</h2>

                <div className="admin-filtros">
                    <label htmlFor="filtroTipo">
                        Filtrar por tipo:
                    </label>

                    <select
                        id="filtroTipo"
                        value={filtroTipo}
                        onChange={event => { setCarregandoCatalogo(true); setFiltroTipo(event.target.value); }}
                    >
                        <option value="">Todos</option>
                        <option value="filme">Filmes</option>
                        <option value="serie">Séries</option>
                    </select>

                    <button
                        type="button"
                        onClick={carregarCatalogo}
                        disabled={carregandoCatalogo}
                    >
                        Atualizar lista
                    </button>
                </div>

                {erroCatalogo && <p className="erro" role="alert">{erroCatalogo}</p>}

                {carregandoCatalogo ? (
                    <p>Carregando catálogo...</p>
                ) : catalogo.length === 0 ? (
                    <p>Nenhum conteúdo cadastrado.</p>
                ) : (
                    <div>
                        {catalogo.map(item => (
                            <article className="admin-item" key={item.id}>
                                <ResumoConteudoAdmin item={item} cadastrado>
                                    <button
                                        type="button"
                                        onClick={() => abrirGerenciamentoMidias(item)}
                                        disabled={carregandoMidias}
                                    >
                                        Gerenciar mídias
                                    </button>

                                <button
                                        type="button"
                                        onClick={() => iniciarEdicao(item)}
                                        disabled={
                                            editando !== null ||
                                            desativando !== null
                                        }
                                    >
                                        Editar
                                    </button>

                                <button
                                        type="button"
                                        onClick={() => handleDesativar(item)}
                                        disabled={
                                            salvando ||
                                            editando !== null ||
                                            desativando !== null
                                        }
                                    >
                                        {desativando === item.id
                                            ? 'Desativando...'
                                            : 'Desativar'}
                                    </button>

                                </ResumoConteudoAdmin>

                                {editando?.id === item.id && (
                                    <form onSubmit={handleSalvarEdicao}>
                                        <h3>Editando conteúdo</h3>

                                        <div>
                                            <label htmlFor="tituloEdicao">
                                                Título:
                                            </label>

                                            <input
                                                id="tituloEdicao"
                                                type="text"
                                                value={editando.titulo}
                                                onChange={event =>
                                                    setEditando({
                                                        ...editando,
                                                        titulo: event.target.value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="sinopseEdicao">
                                                Sinopse:
                                            </label>

                                            <textarea
                                                id="sinopseEdicao"
                                                value={editando.sinopse}
                                                onChange={event =>
                                                    setEditando({
                                                        ...editando,
                                                        sinopse: event.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="dataEdicao">
                                                Data de lançamento:
                                            </label>

                                            <input
                                                id="dataEdicao"
                                                type="date"
                                                value={editando.data_lancamento}
                                                onChange={event =>
                                                    setEditando({
                                                        ...editando,
                                                        data_lancamento: event.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="posterEdicao">
                                                Caminho do pôster:
                                            </label>

                                            <input
                                                id="posterEdicao"
                                                type="text"
                                                value={editando.poster_path}
                                                onChange={event =>
                                                    setEditando({
                                                        ...editando,
                                                        poster_path: event.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="notaEdicao">
                                                Nota média:
                                            </label>

                                            <input
                                                id="notaEdicao"
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={editando.nota_media}
                                                onChange={event =>
                                                    setEditando({
                                                        ...editando,
                                                        nota_media: event.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={salvando}
                                        >
                                            {salvando
                                                ? 'Salvando...'
                                                : 'Salvar alterações'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelarEdicao}
                                            disabled={salvando}
                                        >
                                            Cancelar
                                        </button>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {conteudoSelecionado && (
                <section>
                    <hr />

                    <h2>
                        Gerenciar mídias: {conteudoSelecionado.titulo}
                    </h2>

                    <p>
                        Tipo: {conteudoSelecionado.tipo_conteudo === 'filme'
                            ? 'Filme'
                            : 'Série'}
                    </p>

                    <button
                        type="button"
                        onClick={fecharGerenciamentoMidias}
                    >
                        Fechar gerenciamento
                    </button>

                    <h3>
                        {midiaEditando !== null
                            ? 'Editar mídia'
                            : 'Cadastrar nova mídia'}
                    </h3>

                    <form onSubmit={handleSalvarMidia}>
                        <div>
                            <label htmlFor="midiaTitulo">
                                Título da mídia:
                            </label>

                            <input
                                id="midiaTitulo"
                                type="text"
                                maxLength="255"
                                value={formularioMidia.titulo}
                                onChange={event =>
                                    atualizarCampoMidia(
                                        'titulo',
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="midiaDescricao">
                                Descrição:
                            </label>

                            <textarea
                                id="midiaDescricao"
                                maxLength="5000"
                                value={formularioMidia.descricao}
                                onChange={event =>
                                    atualizarCampoMidia(
                                        'descricao',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor="midiaDrive">
                                Link compartilhado do Google Drive ou ID do arquivo:
                            </label>

                            <input
                                id="midiaDrive"
                                type="text"
                                value={formularioMidia.google_drive_file_id}
                                onChange={event =>
                                    atualizarCampoMidia(
                                        'google_drive_file_id',
                                        event.target.value
                                    )
                                }
                                placeholder="https://drive.google.com/file/d/..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="midiaImagem">
                                URL da imagem (opcional):
                            </label>

                            <input
                                id="midiaImagem"
                                type="url"
                                value={formularioMidia.imagem_url}
                                onChange={event =>
                                    atualizarCampoMidia(
                                        'imagem_url',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor="midiaOrdem">
                                Ordem:
                            </label>

                            <input
                                id="midiaOrdem"
                                type="number"
                                min="1"
                                step="1"
                                value={formularioMidia.ordem}
                                onChange={event =>
                                    atualizarCampoMidia(
                                        'ordem',
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        {conteudoSelecionado.tipo_conteudo === 'serie' && (
                            <>
                                <div>
                                    <label htmlFor="midiaTemporada">
                                        Temporada:
                                    </label>

                                    <input
                                        id="midiaTemporada"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formularioMidia.temporada}
                                        onChange={event =>
                                            atualizarCampoMidia(
                                                'temporada',
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="midiaEpisodio">
                                        Episódio:
                                    </label>

                                    <input
                                        id="midiaEpisodio"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formularioMidia.episodio}
                                        onChange={event =>
                                            atualizarCampoMidia(
                                                'episodio',
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={salvandoMidia}
                        >
                            {salvandoMidia
                                ? 'Salvando...'
                                : midiaEditando !== null
                                    ? 'Salvar alterações'
                                    : 'Cadastrar mídia'}
                        </button>

                        {midiaEditando !== null && (
                            <button
                                type="button"
                                onClick={cancelarEdicaoMidia}
                                disabled={salvandoMidia}
                            >
                                Cancelar edição
                            </button>
                        )}
                    </form>

                    {erroMidias && <p className="erro" role="alert">{erroMidias}</p>}

                    <h3>Mídias cadastradas</h3>

                    {carregandoMidias ? (
                        <p>Carregando mídias...</p>
                    ) : midias.length === 0 ? (
                        <p>Nenhuma mídia cadastrada para este conteúdo.</p>
                    ) : (
                        <div>
                            {midias.map(midia => (
                                <article key={midia.id}>
                                    <h3>{midia.titulo}</h3>

                                    <p>
                                        <strong>ID da mídia:</strong> {midia.id}
                                    </p>

                                    {conteudoSelecionado.tipo_conteudo === 'serie' && (
                                        <p>
                                            Temporada {midia.temporada} -
                                            Episódio {midia.episodio}
                                        </p>
                                    )}

                                    <p>
                                        <strong>Ordem:</strong> {midia.ordem}
                                    </p>

                                    <p>
                                        {midia.descricao || 'Sem descrição.'}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => iniciarEdicaoMidia(midia)}
                                        disabled={
                                            salvandoMidia ||
                                            desativandoMidia !== null
                                        }
                                    >
                                        Editar mídia
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDesativarMidia(midia)}
                                        disabled={
                                            salvandoMidia ||
                                            desativandoMidia !== null
                                        }
                                    >
                                        {desativandoMidia === midia.id
                                            ? 'Desativando...'
                                            : 'Desativar mídia'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </section>
    );
}

export default AdminCatalogo;
