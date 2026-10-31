
const repository = require('../repositories/MidiaRepository');

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(id, campo = 'ID da mídia') {
    const texto = String(id);

    if (!/^\d+$/.test(texto)) {
        throw criarErro(`${campo} inválido.`);
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro(`${campo} inválido.`);
    }

    return numero;
}

function validarTitulo(titulo) {
    if (typeof titulo !== 'string') {
        throw criarErro('Informe um título válido.');
    }

    const texto = titulo.trim();

    if (!texto || texto.length > 255) {
        throw criarErro(
            'O título deve possuir entre 1 e 255 caracteres.'
        );
    }

    return texto;
}

function validarDescricao(descricao) {
    if (descricao === undefined || descricao === null) {
        return null;
    }

    if (typeof descricao !== 'string') {
        throw criarErro('A descrição deve ser um texto.');
    }

    const texto = descricao.trim();

    if (texto.length > 5000) {
        throw criarErro(
            'A descrição deve ter no máximo 5000 caracteres.'
        );
    }

    return texto || null;
}

function validarImagemUrl(url) {
    if (url === undefined || url === null || url === '') {
        return null;
    }

    if (typeof url !== 'string') {
        throw criarErro('A URL da imagem é inválida.');
    }

    try {
        const endereco = new URL(url.trim());

        if (
            endereco.protocol !== 'https:' &&
            endereco.protocol !== 'http:'
        ) {
            throw new Error();
        }

        return endereco.toString();
    } catch {
        throw criarErro('Informe uma URL de imagem válida.');
    }
}

// Valida o ID ou link de compartilhamento do Google Drive.
function validarGoogleDrive(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw criarErro(
            'Informe o link ou ID do arquivo do Google Drive.'
        );
    }

    const entrada = valor.trim();

    // Aceita diretamente o ID do arquivo.
    if (/^[a-zA-Z0-9_-]{10,}$/.test(entrada)) {
        return entrada;
    }

    let url;

    try {
        url = new URL(entrada);
    } catch {
        throw criarErro('O link do Google Drive é inválido.');
    }

    if (
        url.protocol !== 'https:' ||
        !['drive.google.com', 'www.drive.google.com']
            .includes(url.hostname)
    ) {
        throw criarErro('O link do Google Drive é inválido.');
    }

    const correspondencia = url.pathname.match(
        /\/file\/d\/([a-zA-Z0-9_-]{10,})/
    );

    if (!correspondencia) {
        throw criarErro(
            'Não foi possível identificar o arquivo do Google Drive.'
        );
    }

    return correspondencia[1];
}

// Gera a URL de incorporação do Google Drive.
function gerarEmbedUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Adiciona a URL de incorporação aos dados da mídia.
function adicionarEmbedUrl(midia) {
    return {
        ...midia,
        embed_url: gerarEmbedUrl(midia.google_drive_file_id)
    };
}

function validarOrdem(ordem) {
    if (ordem === undefined || ordem === null) {
        return 1;
    }

    const numero = Number(ordem);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro(
            'A ordem deve ser um número inteiro maior que zero.'
        );
    }

    return numero;
}

function validarTemporada(temporada) {
    if (
        temporada === undefined ||
        temporada === null ||
        temporada === ''
    ) {
        return null;
    }

    const numero = Number(temporada);

    if (!Number.isSafeInteger(numero) || numero < 0) {
        throw criarErro(
            'A temporada deve ser um número inteiro maior ou igual a zero.'
        );
    }

    return numero;
}

function validarEpisodio(episodio) {
    if (
        episodio === undefined ||
        episodio === null ||
        episodio === ''
    ) {
        return null;
    }

    const numero = Number(episodio);

    if (!Number.isSafeInteger(numero) || numero < 1) {
        throw criarErro(
            'O episódio deve ser um número inteiro maior que zero.'
        );
    }

    return numero;
}

// Valida a combinação dos dados de temporada e episódio.
function validarDadosEpisodio(temporada, episodio) {
    if (temporada === null && episodio === null) {
        return {
            temporada: null,
            episodio: null
        };
    }

    if (temporada === null || episodio === null) {
        throw criarErro(
            'Informe a temporada e o episódio juntos.'
        );
    }

    return {
        temporada,
        episodio
    };
}

// Verifica se o conteúdo existe e retorna seu tipo.
async function obterTipoConteudo(conteudoId) {
    const conteudo = await repository.buscarTipoConteudo(conteudoId);

    if (!conteudo) {
        throw criarErro('Conteúdo não encontrado ou inativo.', 404);
    }

    return conteudo.tipo_conteudo;
}

// Valida temporada e episódio de acordo com o tipo do conteúdo.
function validarEpisodioPorTipo(tipo, temporada, episodio) {
    const dados = validarDadosEpisodio(temporada, episodio);

    if (tipo === 'filme') {
        if (dados.temporada !== null || dados.episodio !== null) {
            throw criarErro(
                'Filmes não podem possuir temporada ou episódio.'
            );
        }

        return dados;
    }

    if (tipo === 'serie') {
        if (dados.temporada === null || dados.episodio === null) {
            throw criarErro(
                'Séries precisam informar a temporada e o episódio.'
            );
        }

        return dados;
    }

    throw criarErro('O tipo de conteúdo informado é inválido.');
}

// Lista todas as mídias ativas.
async function listarTodas() {
    const midias = await repository.listarTodas();

    return midias.map(adicionarEmbedUrl);
}

// Lista mídias de um conteúdo.
async function listarPorConteudo(conteudoId) {
    const id = validarId(conteudoId, 'ID do conteúdo');

    const midias = await repository.listarPorConteudo(id);

    return midias.map(adicionarEmbedUrl);
}

// Busca uma mídia pelo ID.
async function buscarPorId(id) {
    const midiaId = validarId(id);

    const midia = await repository.buscarPorId(midiaId);

    if (!midia) {
        throw criarErro('Mídia não encontrada.', 404);
    }

    return adicionarEmbedUrl(midia);
}

// Cadastra uma mídia e associa ao conteúdo.
async function cadastrar(dados, usuarioId) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw criarErro('Informe os dados da mídia.');
    }

    const titulo = validarTitulo(dados.titulo);
    const descricao = validarDescricao(dados.descricao);

    const googleDriveFileId = validarGoogleDrive(
        dados.google_drive_file_id
    );

    const imagemUrl = validarImagemUrl(dados.imagem_url);

    const conteudoId = validarId(
        dados.conteudo_id,
        'ID do conteúdo'
    );

    const ordem = validarOrdem(dados.ordem);

    const tipoConteudo = await obterTipoConteudo(conteudoId);

    const temporada = validarTemporada(dados.temporada);
    const episodio = validarEpisodio(dados.episodio);

    const dadosEpisodio = validarEpisodioPorTipo(
        tipoConteudo,
        temporada,
        episodio
    );

    const midia = await repository.cadastrar({
        titulo,
        descricao,
        google_drive_file_id: googleDriveFileId,
        imagem_url: imagemUrl,
        conteudo_id: conteudoId,
        ordem,
        temporada: dadosEpisodio.temporada,
        episodio: dadosEpisodio.episodio,
        criado_por: usuarioId
    });

    return adicionarEmbedUrl(midia);
}

// Atualiza uma mídia existente.
async function atualizar(id, dados) {
    const midiaId = validarId(id);

    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw criarErro('Informe os dados para atualização.');
    }

    const midiaAtual = await repository.buscarPorId(midiaId);

    if (!midiaAtual) {
        throw criarErro('Mídia não encontrada.', 404);
    }

    const titulo = validarTitulo(dados.titulo);
    const descricao = validarDescricao(dados.descricao);

    const googleDriveFileId = validarGoogleDrive(
        dados.google_drive_file_id
    );

    const imagemUrl = validarImagemUrl(dados.imagem_url);

    const conteudoId = dados.conteudo_id !== undefined
        ? validarId(dados.conteudo_id, 'ID do conteúdo')
        : midiaAtual.conteudo_id;

    const ordem = dados.ordem !== undefined
        ? validarOrdem(dados.ordem)
        : undefined;

    const tipoConteudo = await obterTipoConteudo(conteudoId);

    // Se um campo não for enviado, preserva seu valor atual.
    let temporada = dados.temporada !== undefined
        ? validarTemporada(dados.temporada)
        : midiaAtual.temporada ?? null;

    let episodio = dados.episodio !== undefined
        ? validarEpisodio(dados.episodio)
        : midiaAtual.episodio ?? null;

    // Para filmes, os dados de episódio sempre ficam vazios.
    if (tipoConteudo === 'filme') {
        const temporadaInformada = dados.temporada !== undefined;
        const episodioInformado = dados.episodio !== undefined;

        if (
            (temporadaInformada && temporada !== null) ||
            (episodioInformado && episodio !== null)
        ) {
            throw criarErro(
                'Filmes não podem possuir temporada ou episódio.'
            );
        }

        temporada = null;
        episodio = null;
    } else {
        const dadosEpisodio = validarEpisodioPorTipo(
            tipoConteudo,
            temporada,
            episodio
        );

        temporada = dadosEpisodio.temporada;
        episodio = dadosEpisodio.episodio;
    }

    const midia = await repository.atualizar(midiaId, {
        titulo,
        descricao,
        google_drive_file_id: googleDriveFileId,
        imagem_url: imagemUrl,
        conteudo_id: conteudoId,
        ordem,
        temporada,
        episodio
    });

    if (!midia) {
        throw criarErro('Mídia não encontrada.', 404);
    }

    return adicionarEmbedUrl(midia);
}

// Desativa uma mídia.
async function desativar(id) {
    const midiaId = validarId(id);

    const midia = await repository.desativar(midiaId);

    if (!midia) {
        throw criarErro('Mídia não encontrada.', 404);
    }

    return {
        mensagem: 'Mídia desativada com sucesso.',
        midia
    };
}

module.exports = {
    listarTodas,
    listarPorConteudo,
    buscarPorId,
    cadastrar,
    atualizar,
    desativar
};
