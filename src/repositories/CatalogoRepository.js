
const { pool } = require('../config/database');

// Lista os conteúdos ativos do catálogo, incluindo suas mídias.
async function listarTodos(tipo) {
    const resultado = await pool.query(
        `SELECT
            c.id,
            c.tipo_conteudo,
            c.tmdb_id,
            c.titulo,
            c.sinopse,
            c.data_lancamento,
            c.poster_path,
            c.nota_media,
            c.ativo,
            c.criado_em,
            c.atualizado_em,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', m.id,
                            'titulo', m.titulo,
                            'descricao', m.descricao,
                            'google_drive_file_id', m.google_drive_file_id,
                            'embed_url',
                                'https://drive.google.com/file/d/'
                                || m.google_drive_file_id
                                || '/preview',
                            'imagem_url', m.imagem_url,
                            'ordem', cm.ordem,
                            'temporada', cm.temporada,
                            'episodio', cm.episodio
                        )
                        ORDER BY
                            CASE
                                WHEN c.tipo_conteudo = 'serie'
                                THEN cm.temporada
                            END ASC NULLS LAST,
                            CASE
                                WHEN c.tipo_conteudo = 'serie'
                                THEN cm.episodio
                            END ASC NULLS LAST,
                            cm.ordem ASC,
                            m.criado_em DESC
                    )
                    FROM conteudo_midias cm
                    INNER JOIN midias m ON m.id = cm.midia_id
                    WHERE cm.conteudo_id = c.id
                      AND m.ativo = TRUE
                ),
                '[]'::JSON
            ) AS midias
         FROM conteudos_catalogo c
         WHERE c.ativo = TRUE
           AND ($1::VARCHAR IS NULL OR c.tipo_conteudo = $1)
         ORDER BY c.criado_em DESC`,
        [tipo || null]
    );

    return resultado.rows;
}

// Busca um conteúdo ativo pelo ID interno, incluindo suas mídias.
async function buscarPorId(id) {
    const resultado = await pool.query(
        `SELECT
            c.id,
            c.tipo_conteudo,
            c.tmdb_id,
            c.titulo,
            c.sinopse,
            c.data_lancamento,
            c.poster_path,
            c.nota_media,
            c.ativo,
            c.criado_em,
            c.atualizado_em,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', m.id,
                            'titulo', m.titulo,
                            'descricao', m.descricao,
                            'google_drive_file_id', m.google_drive_file_id,
                            'embed_url',
                                'https://drive.google.com/file/d/'
                                || m.google_drive_file_id
                                || '/preview',
                            'imagem_url', m.imagem_url,
                            'ordem', cm.ordem,
                            'temporada', cm.temporada,
                            'episodio', cm.episodio
                        )
                        ORDER BY
                            CASE
                                WHEN c.tipo_conteudo = 'serie'
                                THEN cm.temporada
                            END ASC NULLS LAST,
                            CASE
                                WHEN c.tipo_conteudo = 'serie'
                                THEN cm.episodio
                            END ASC NULLS LAST,
                            cm.ordem ASC,
                            m.criado_em DESC
                    )
                    FROM conteudo_midias cm
                    INNER JOIN midias m ON m.id = cm.midia_id
                    WHERE cm.conteudo_id = c.id
                      AND m.ativo = TRUE
                ),
                '[]'::JSON
            ) AS midias
         FROM conteudos_catalogo c
         WHERE c.id = $1
           AND c.ativo = TRUE`,
        [id]
    );

    return resultado.rows[0] || null;
}

// Cadastra um filme ou uma série.
async function cadastrar(dados) {
    const resultado = await pool.query(
        `INSERT INTO conteudos_catalogo (
            tipo_conteudo,
            tmdb_id,
            titulo,
            sinopse,
            data_lancamento,
            poster_path,
            nota_media,
            criado_por
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
            id,
            tipo_conteudo,
            tmdb_id,
            titulo,
            sinopse,
            data_lancamento,
            poster_path,
            nota_media,
            ativo,
            criado_em`,
        [
            dados.tipo_conteudo,
            dados.tmdb_id,
            dados.titulo,
            dados.sinopse,
            dados.data_lancamento,
            dados.poster_path,
            dados.nota_media,
            dados.criado_por
        ]
    );

    return resultado.rows[0];
}

// Atualiza os dados de um conteúdo ativo.
async function atualizar(id, dados) {
    const resultado = await pool.query(
        `UPDATE conteudos_catalogo
         SET
            titulo = $1,
            sinopse = $2,
            data_lancamento = $3,
            poster_path = $4,
            nota_media = $5,
            atualizado_em = NOW()
         WHERE id = $6
           AND ativo = TRUE
         RETURNING
            id,
            tipo_conteudo,
            tmdb_id,
            titulo,
            sinopse,
            data_lancamento,
            poster_path,
            nota_media,
            ativo,
            atualizado_em`,
        [
            dados.titulo,
            dados.sinopse,
            dados.data_lancamento,
            dados.poster_path,
            dados.nota_media,
            id
        ]
    );

    return resultado.rows[0] || null;
}

// Desativa um conteúdo sem removê-lo do banco.
async function desativar(id) {
    const resultado = await pool.query(
        `UPDATE conteudos_catalogo
         SET
            ativo = FALSE,
            atualizado_em = NOW()
         WHERE id = $1
           AND ativo = TRUE
         RETURNING id, tipo_conteudo, titulo, ativo`,
        [id]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    listarTodos,
    buscarPorId,
    cadastrar,
    atualizar,
    desativar
};
