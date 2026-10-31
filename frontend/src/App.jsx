import { useEffect, useState } from 'react';

import Filmes from './pages/Filmes';
import Series from './pages/Series';
import AdminCatalogo from './pages/AdminCatalogo';
import Login from './pages/Login';

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

                if (dados.usuario?.papel === 'admin') {
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

    return (
        <div className="app">
            <header>
                <div className="cabecalho-principal">
                    <div>
                        <h1>🎬 CineCatalog</h1>
                        <p>Explore filmes, séries e descubra novidades.</p>
                    </div>

                    <button
                        type="button"
                        className={catalogo === 'admin' ? 'ativo' : ''}
                        onClick={() => setCatalogo('admin')}
                    >
                        Administração
                    </button>
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
                </nav>
            </header>

            <main>
                {catalogo === 'admin' ? (
                    verificandoSessao ? (
                        <p>Verificando sessão...</p>
                    ) : usuario ? (
                        <section>
                            <p>
                                Administrador: {usuario.nome}
                            </p>

                            <button onClick={handleLogout}>
                                Sair
                            </button>

                            <AdminCatalogo />
                        </section>
                    ) : (
                        <Login onLogin={setUsuario} />
                    )
                ) : catalogo === 'filmes' ? (
                    <Filmes key="filmes" categoriaInicial="populares" />
                ) : (
                    <Series key="series" categoriaInicial="populares" />
                )}
            </main>

            <footer>
                Catálogo de filmes e séries • React + Vite + Express + TMDB
            </footer>
        </div>
    );
}

export default App;