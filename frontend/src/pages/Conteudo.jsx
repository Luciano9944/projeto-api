import { useEffect, useState } from 'react';
import DetalhesFilme from '../components/DetalhesFilme';
import DetalhesSerie from '../components/DetalhesSerie';
import { buscarPorId } from '../services/serieService';

export default function Conteudo({ tipo, id, onVoltar }) {
    const [serie, setSerie] = useState(null);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (tipo !== 'series') return;
        let ativo = true;
        buscarPorId(id)
            .then(dados => { if (ativo) setSerie(dados); })
            .catch(error => { if (ativo) setErro(error.message); });
        return () => { ativo = false; };
    }, [tipo, id]);

    if (tipo === 'filmes') return <DetalhesFilme id={id} onVoltar={onVoltar} />;
    if (serie) return <DetalhesSerie serie={serie} onVoltar={onVoltar} />;

    return (
        <section>
            <button type="button" onClick={onVoltar}>Voltar ao catálogo</button>
            {erro ? <p className="erro" role="alert">{erro}</p> : <p role="status">Carregando detalhes da série…</p>}
        </section>
    );
}
