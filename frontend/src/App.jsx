
import { useEffect, useState } from 'react';

import Filmes from './pages/Filmes';
import Series from './pages/Series';
import AdminCatalogo from './pages/AdminCatalogo';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';

import {
    buscarPerfil,
    realizarLogout
} from './services/authService';

function App() {
    const [catalogo, setCatalogo] = useState('filmes');
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
        try {
            await realizarLogout();
        } catch (erro) {
            console.error('Erro ao encerrar sessão:', erro);
        } finally {
            setUsuario(null);
            setCatalogo('filmes');
        }
    }

    function handleLogin(dadosUsuario) {
        setUsuario(dadosUsuario);
        setCatalogo('perfil');
    }

    function handleCadastro() {
        setCatalogo('cadastro');
    }

    function handleCadastroConcluido() {
        setCatalogo('login');
    }

    return (
        <div className="app">
            <header>
                <div className="cabecalho-principal">
                    <div>
                        <h1>🎬 CineCatalog</h1>
                        <p>Explore filmes, séries e descubra novidades.</p>
                    </div>

                    {usuario?.papel === 'admin' && (
                        <button
                            type="button"
                            className={catalogo === 'admin' ? 'ativo' : ''}
                            onClick={() => setCatalogo('admin')}
                        >
                            Administração
                        </button>
                    )}
                </div>

                <nav className="navegacao-catalogo">
                    <button
                        type="button"
                        className={catalogo === 'filmes' ? 'ativo' : ''}
                        onClick={() => setCatalogo('filmes')}
                    >
                        Filmes
                    </button>

                    <button
                        type="button"
                        className={catalogo === 'series' ? 'ativo' : ''}
                        onClick={() => setCatalogo('series')}
                    >
                        Séries
                    </button>

                    <button
                        type="button"
                        className={
                            ['perfil', 'login', 'cadastro'].includes(catalogo)
                                ? 'ativo'
                                : ''
                        }
                        onClick={() => {
                            setCatalogo(usuario ? 'perfil' : 'login');
                        }}
                    >
                        {usuario ? 'Meu perfil' : 'Minha conta'}
                    </button>
                </nav>
            </header>

            <main>
                {catalogo === 'filmes' ? (
                    <Filmes
                        key="filmes"
                        categoriaInicial="populares"
                    />
                ) : catalogo === 'series' ? (
                    <Series
                        key="series"
                        categoriaInicial="populares"
                    />
                ) : catalogo === 'perfil' ? (
                    verificandoSessao ? (
                        <p>Verificando sessão...</p>
                    ) : usuario ? (
                        <section>
                            <p>Olá, {usuario.nome}!</p>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Sair
                            </button>

                            <Perfil key={usuario.id} />
                        </section>
                    ) : (
                        <Login
                            onLogin={handleLogin}
                            onCadastro={handleCadastro}
                        />
                    )
                ) : catalogo === 'login' ? (
                    verificandoSessao ? (
                        <p>Verificando sessão...</p>
                    ) : usuario ? (
                        <Perfil key={usuario.id} />
                    ) : (
                        <Login
                            onLogin={handleLogin}
                            onCadastro={handleCadastro}
                        />
                    )
                ) : catalogo === 'cadastro' ? (
                    <Cadastro
                        aoCadastrar={handleCadastroConcluido}
                        aoVoltarLogin={() => setCatalogo('login')}
                    />
                ) : catalogo === 'admin' ? (
                    verificandoSessao ? (
                        <p>Verificando sessão...</p>
                    ) : usuario?.papel === 'admin' ? (
                        <section>
                            <p>Administrador: {usuario.nome}</p>

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Sair
                            </button>

                            <AdminCatalogo />
                        </section>
                    ) : (
                        <p>Acesso restrito aos administradores.</p>
                    )
                ) : null}
            </main>

            <footer>
                Catálogo de filmes e séries • React + Vite + Express + TMDB
            </footer>
        </div>
    );
}

export default App;
