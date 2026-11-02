
import { useEffect, useState } from 'react';

import { buscarPerfilDetalhado } from '../services/perfilService';
import { buscarFilme } from '../services/filmeService';
import { buscarPorId } from '../services/serieService';

function Perfil() {
    const [perfil, setPerfil] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        async function carregarPerfil() {
            try {
                const dados = await buscarPerfilDetalhado();

                // Junta favoritos e comentários para evitar consultas repetidas.
                const itens = [
                    ...dados.favoritos.itens,
                    ...dados.comentarios.itens
                ];

                const conteudosUnicos = [
                    ...new Map(
                        itens.map(item => [
                            `${item.tipo_conteudo}-${item.conteudo_id}`,
                            item
                        ])
                    ).values()
                ];

                // Busca os títulos dos filmes e das séries.
                const titulos = {};

                await Promise.all(
                    conteudosUnicos.map(async item => {
                        const chave = `${item.tipo_conteudo}-${item.conteudo_id}`;

                        try {
                            const conteudo = item.tipo_conteudo === 'filme'
                                ? await buscarFilme(item.conteudo_id)
                                : await buscarPorId(item.conteudo_id);

                            titulos[chave] =
                                conteudo.titulo ||
                                conteudo.title ||
                                conteudo.nome ||
                                conteudo.name ||
                                conteudo.original_name ||
                                `Conteúdo ${item.conteudo_id}`;
                        } catch {
                            titulos[chave] = `Conteúdo ${item.conteudo_id}`;
                        }
                    })
                );

                setPerfil({
                    ...dados,
                    titulos
                });
            } catch (erro) {
                setMensagem(erro.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarPerfil();
    }, []);

    if (carregando) {
        return <p>Carregando perfil...</p>;
    }

    if (mensagem) {
        return <p>{mensagem}</p>;
    }

    if (!perfil) {
        return <p>Não foi possível carregar o perfil.</p>;
    }

    function obterTitulo(item) {
        const chave = `${item.tipo_conteudo}-${item.conteudo_id}`;

        return perfil.titulos[chave] || `Conteúdo ${item.conteudo_id}`;
    }

    return (
        <section className="perfil">
            <h2>Meu perfil</h2>

            <section>
                <h3>Dados da conta</h3>

                <p>
                    <strong>Nome:</strong> {perfil.usuario.nome}
                </p>

                <p>
                    <strong>E-mail:</strong> {perfil.usuario.email}
                </p>

                <p>
                    <strong>Tipo de conta:</strong> {perfil.usuario.papel}
                </p>

                <p>
                    <strong>Cadastro:</strong>{' '}
                    {new Date(perfil.usuario.criado_em).toLocaleDateString('pt-BR')}
                </p>
            </section>

            <section>
                <h3>Meus favoritos ({perfil.favoritos.total})</h3>

                {perfil.favoritos.itens.length === 0 ? (
                    <p>Você ainda não possui favoritos.</p>
                ) : (
                    <ul>
                        {perfil.favoritos.itens.map(favorito => (
                            <li key={favorito.id}>
                                <strong>
                                    {favorito.tipo_conteudo === 'filme' ? 'Filme' : 'Série'}
                                </strong>
                                {' — '}
                                {obterTitulo(favorito)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h3>Meus comentários ({perfil.comentarios.total})</h3>

                {perfil.comentarios.itens.length === 0 ? (
                    <p>Você ainda não publicou comentários.</p>
                ) : (
                    <ul>
                        {perfil.comentarios.itens.map(comentario => (
                            <li key={comentario.id}>
                                <p>
                                    <strong>
                                        {comentario.tipo_conteudo === 'filme' ? 'Filme' : 'Série'}
                                    </strong>
                                    {' — '}
                                    {obterTitulo(comentario)}
                                </p>

                                <p>{comentario.texto}</p>

                                <small>
                                    Publicado em:{' '}
                                    {new Date(comentario.criado_em).toLocaleDateString('pt-BR')}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}

export default Perfil;
