
import { useEffect, useState } from 'react';

import Filmes from './pages/Filmes';
import Series from './pages/Series';
import AdminCatalogo from './pages/AdminCatalogo';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';
import Conteudo from './pages/Conteudo';
import { lerRota } from './utils/navegacao';

import {
    buscarPerfil,
    realizarLogout
} from './services/authService';

function App() {
    const [rota, setRota] = useState(lerRota);
    const catalogo = rota.pagina;
    useEffect(() => {
        const atualizar = () => {
            const pagina = location.hash.slice(1);
            if (['conteudo', 'acervo'].includes(pagina)) return;
            const proximaRota = lerRota();
            setRota(proximaRota);
            if (proximaRota.conteudoId) window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', atualizar);
        return () => window.removeEventListener('hashchange', atualizar);
    }, []);
    function navegar(pagina) { location.hash = pagina; setRota(lerRota()); }
    const [erroSessao, setErroSessao] = useState('');
    const [saindo, setSaindo] = useState(false);
    const [avisoConta, setAvisoConta] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [verificandoSessao, setVerificandoSessao] = useState(true);

    useEffect(() => {
        async function verificarSessao() {
            try {
                const dados = await buscarPerfil();

                if (dados.autenticado && dados.usuario) {
                    setUsuario(dados.usuario);
                }
            } catch {
                setUsuario(null);
            } finally {
                setVerificandoSessao(false);
            }
        }

        verificarSessao();
    }, []);

    async function handleLogout() {
        setSaindo(true);
        setErroSessao('');
        try {
            await realizarLogout();
            setUsuario(null);
            navegar('filmes');
        } catch (erro) {
            setErroSessao(erro.message + ' Tente sair novamente.');
        } finally {
            setSaindo(false);
        }
    }

    function handleLogin(dadosUsuario) {
        setUsuario(dadosUsuario);
        setErroSessao('');
        setAvisoConta('');
        navegar('perfil');
    }

    function handleCadastro() {
        navegar('cadastro');
    }

    function handleCadastroConcluido() {
        setAvisoConta('Conta criada! Entre com seu e-mail e sua senha.');
        navegar('login');
    }

    return (
        <div className="app">
            <a className="pular-conteudo" href="#conteudo" onClick={event => {
                event.preventDefault();
                document.getElementById('conteudo')?.focus();
            }}>Pular para o conteúdo</a>
            <header className="cabecalho">
                <a className="marca" href="#filmes" aria-label="CineMarvel, início" translate="no">
                    Cine<span>Marvel</span>
                </a>
                <nav className="navegacao-catalogo" aria-label="Navegação principal">
                    {[['filmes', 'Filmes'], ['series', 'Séries'], ...(usuario?.papel === 'admin' ? [['admin', 'Administração']] : [])].map(([pagina, titulo]) => (
                        <a key={pagina} href={'#' + pagina} className={catalogo === pagina ? 'ativo' : ''} aria-current={catalogo === pagina ? 'page' : undefined}>{titulo}</a>
                    ))}
                    {usuario ? (
                        <div className="sessao-usuario">
                            <a href="#perfil" className={catalogo === 'perfil' ? 'conta-usuario ativo' : 'conta-usuario'} aria-current={catalogo === 'perfil' ? 'page' : undefined} aria-label={usuario.nome + ', ver meu perfil'}>
                                <span className="avatar-usuario" aria-hidden="true">{usuario.nome?.trim().charAt(0).toUpperCase()}</span>
                                <span className="nome-usuario" title={usuario.nome}>{usuario.nome}</span>
                            </a>
                            <button className="botao-sair" type="button" onClick={handleLogout} disabled={saindo}>
                                {saindo ? 'Saindo…' : 'Sair'}
                            </button>
                        </div>
                    ) : (
                        <a href="#login" className={['login', 'cadastro'].includes(catalogo) ? 'ativo' : ''} aria-current={catalogo === 'login' ? 'page' : undefined}>Minha conta</a>
                    )}
                </nav>
            </header>
            <main id="conteudo" tabIndex={-1}>
                {erroSessao && <p className="erro" role="alert">{erroSessao}</p>}

                {rota.conteudoId ? (
                    <Conteudo key={catalogo + '-' + rota.conteudoId + '-' + (usuario?.id ?? 'visitante')} tipo={catalogo} id={rota.conteudoId} onVoltar={() => navegar(catalogo)} />
                ) : catalogo === 'filmes' ? (
                    <Filmes
                        key={'filmes-' + (usuario?.id ?? 'visitante')}
                        categoriaInicial="populares"
                    />
                ) : catalogo === 'series' ? (
                    <Series
                        key={'series-' + (usuario?.id ?? 'visitante')}
                        categoriaInicial="populares"
                    />
                ) : catalogo === 'perfil' ? (
                    verificandoSessao ? (
                        <p role="status">Verificando sessão…</p>
                    ) : usuario ? (
                        <Perfil key={usuario.id} />
                    ) : (
                        <Login
                            onLogin={handleLogin}
                            aviso={avisoConta}
                            onCadastro={handleCadastro}
                        />
                    )
                ) : catalogo === 'login' ? (
                    verificandoSessao ? (
                        <p role="status">Verificando sessão…</p>
                    ) : usuario ? (
                        <Perfil key={usuario.id} />
                    ) : (
                        <Login
                            onLogin={handleLogin}
                            aviso={avisoConta}
                            onCadastro={handleCadastro}
                        />
                    )
                ) : catalogo === 'cadastro' ? (
                    <Cadastro
                        aoCadastrar={handleCadastroConcluido}
                        aoVoltarLogin={() => navegar('login')}
                    />
                ) : catalogo === 'admin' ? (
                    verificandoSessao ? (
                        <p role="status">Verificando sessão…</p>
                    ) : usuario?.papel === 'admin' ? (
                        <AdminCatalogo />
                    ) : (
                        <p>Acesso restrito aos administradores.</p>
                    )
                ) : null}
            </main>

            <footer>
                <span translate="no">CineMarvel</span><small>Dados de filmes e séries fornecidos pelo TMDB.</small>
            </footer>
        </div>
    );
}

export default App;
