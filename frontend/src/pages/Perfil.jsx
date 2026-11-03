import { useEffect, useState } from 'react';
import { buscarPerfilDetalhado } from '../services/perfilService';
import { buscarFilme } from '../services/filmeService';
import { buscarPorId } from '../services/serieService';
import { obterLinkConteudo } from '../utils/navegacao';

function ReferenciaConteudo({ item, conteudo, children }) {
    const [imagemFalhou, setImagemFalhou] = useState(false);
    const titulo = conteudo?.titulo || `Conteúdo ${item.conteudo_id}`;
    const link = obterLinkConteudo(item);
    const Link = link ? 'a' : 'span';

    return (
        <div className="referencia-conteudo">
            <Link href={link || undefined} className="referencia-poster" aria-label={`Ver detalhes de ${titulo}`}>
                {conteudo?.poster && !imagemFalhou ? (
                    <img src={`https://image.tmdb.org/t/p/w185${conteudo.poster}`} alt="" width="72" height="108" loading="lazy" onError={() => setImagemFalhou(true)} />
                ) : (
                    <span className="referencia-sem-poster" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
                            <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M7 3v18m10-18v18M3 8h4m10 0h4M3 16h4m10 0h4" />
                        </svg>
                    </span>
                )}
            </Link>
            <div className="referencia-texto">
                <span className="referencia-tipo">{item.tipo_conteudo === 'filme' ? 'Filme' : 'Série'}</span>
                <Link href={link || undefined} className="referencia-titulo">{titulo}</Link>
                {children}
            </div>
        </div>
    );
}

export default function Perfil() {
    const [perfil, setPerfil] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        let ativo = true;
        async function carregarPerfil() {
            try {
                const dados = await buscarPerfilDetalhado();
                if (!ativo) return;
                setPerfil({ ...dados, conteudos: {} });
                setCarregando(false);

                const itens = [...dados.favoritos.itens, ...dados.comentarios.itens];
                const conteudosUnicos = [...new Map(itens.map(item => [`${item.tipo_conteudo}-${item.conteudo_id}`, item])).values()];
                const conteudos = {};

                await Promise.all(conteudosUnicos.map(async item => {
                    const chave = `${item.tipo_conteudo}-${item.conteudo_id}`;
                    try {
                        const conteudo = item.tipo_conteudo === 'filme'
                            ? await buscarFilme(item.conteudo_id)
                            : await buscarPorId(item.conteudo_id);
                        conteudos[chave] = {
                            titulo: conteudo.titulo || conteudo.title || conteudo.nome || conteudo.name || conteudo.original_name || `Conteúdo ${item.conteudo_id}`,
                            poster: conteudo.poster_path || null,
                        };
                    } catch {
                        conteudos[chave] = { titulo: `Conteúdo ${item.conteudo_id}`, poster: null };
                    }
                }));

                if (ativo) setPerfil({ ...dados, conteudos });
            } catch (erro) {
                if (ativo) setMensagem(erro.message);
            } finally {
                if (ativo) setCarregando(false);
            }
        }
        carregarPerfil();
        return () => { ativo = false; };
    }, []);

    if (carregando) return <p role="status">Carregando perfil…</p>;
    if (mensagem) return <p className="erro" role="alert">{mensagem}</p>;
    if (!perfil) return <p>Não foi possível carregar o perfil.</p>;

    function obterConteudo(item) {
        return perfil.conteudos[`${item.tipo_conteudo}-${item.conteudo_id}`];
    }

    return (
        <section className="perfil">
            <h1>Meu perfil</h1>
            <section>
                <h2>Dados da conta</h2>
                <p><strong>Nome:</strong> {perfil.usuario.nome}</p>
                <p><strong>E-mail:</strong> {perfil.usuario.email}</p>
                <p><strong>Tipo de conta:</strong> {perfil.usuario.papel}</p>
                <p><strong>Cadastro:</strong> {new Date(perfil.usuario.criado_em).toLocaleDateString('pt-BR')}</p>
            </section>
            <section>
                <h2>Meus favoritos ({perfil.favoritos.total})</h2>
                {perfil.favoritos.itens.length === 0 ? (
                    <p>Você ainda não possui favoritos.</p>
                ) : (
                    <ul>
                        {perfil.favoritos.itens.map(item => (
                            <li key={item.id}><ReferenciaConteudo item={item} conteudo={obterConteudo(item)} /></li>
                        ))}
                    </ul>
                )}
            </section>
            <section>
                <h2>Meus comentários ({perfil.comentarios.total})</h2>
                {perfil.comentarios.itens.length === 0 ? (
                    <p>Você ainda não publicou comentários.</p>
                ) : (
                    <ul>
                        {perfil.comentarios.itens.map(item => (
                            <li key={item.id}>
                                <ReferenciaConteudo item={item} conteudo={obterConteudo(item)}>
                                    <p className="texto-comentario-perfil">{item.texto}</p>
                                    <small>Publicado em: {new Date(item.criado_em).toLocaleDateString('pt-BR')}</small>
                                </ReferenciaConteudo>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}
