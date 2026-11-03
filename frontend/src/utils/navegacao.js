const PAGINAS = ['filmes', 'series', 'login', 'cadastro', 'perfil', 'admin'];

function idValido(id) {
    return /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

export function lerRota(hash = window.location.hash) {
    const [pagina, id, ...restante] = hash.replace(/^#/, '').split('/');
    return {
        pagina: PAGINAS.includes(pagina) ? pagina : 'filmes',
        conteudoId: ['filmes', 'series'].includes(pagina) && restante.length === 0 && idValido(id) ? String(Number(id)) : null,
    };
}

export function obterLinkConteudo(item) {
    const pagina = item.tipo_conteudo === 'filme' ? 'filmes' : item.tipo_conteudo === 'serie' ? 'series' : null;
    if (!pagina || !idValido(item.conteudo_id)) return null;
    return `#${pagina}/${Number(item.conteudo_id)}`;
}
