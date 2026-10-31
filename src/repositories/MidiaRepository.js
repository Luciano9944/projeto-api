
const { pool } = require('../config/database');

// Campos utilizados nas consultas de mídias associadas.
const CAMPOS_MIDIA = `
    m.id,
    m.titulo,
    m.descricao,
    m.google_drive_file_id,
    m.imagem_url,
    m.criado_em,
    m.atualizado_em,
    cm.conteudo_id,
    cm.ordem,
    cm.temporada,
    cm.episodio
`;

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// Lista mídias ativas vinculadas a conteúdos ativos.
async function listarTodas() {
    const resultado = await pool.query(
        `SELECT ${CAMPOS_MIDIA}
         FROM midias m
         INNER JOIN conteudo_midias cm
            ON cm.midia_id = m.id
         INNER JOIN conteudos_catalogo c
            ON c.id = cm.conteudo_id
         WHERE m.ativo = TRUE
           AND c.ativo = TRUE
         ORDER BY
            cm.temporada ASC NULLS FIRST,
            cm.episodio ASC NULLS FIRST,
            cm.ordem ASC,
            m.criado_em DESC`
    );

    return resultado.rows;
}

// Lista mídias de um conteúdo específico.
async function listarPorConteudo(conteudoId) {
    const resultado = await pool.query(
        `SELECT ${CAMPOS_MIDIA}
         FROM midias m
         INNER JOIN conteudo_midias cm
            ON cm.midia_id = m.id
         INNER JOIN conteudos_catalogo c
            ON c.id = cm.conteudo_id
         WHERE cm.conteudo_id = $1
           AND m.ativo = TRUE
           AND c.ativo = TRUE
         ORDER BY
            cm.temporada ASC NULLS FIRST,
            cm.episodio ASC NULLS FIRST,
            cm.ordem ASC,
            m.criado_em DESC`,
        [conteudoId]
    );

    return resultado.rows;
}

// Busca uma mídia ativa pelo ID.
async function buscarPorId(id) {
    const resultado = await pool.query(
        `SELECT ${CAMPOS_MIDIA}
         FROM midias m
         INNER JOIN conteudo_midias cm
            ON cm.midia_id = m.id
         INNER JOIN conteudos_catalogo c
            ON c.id = cm.conteudo_id
         WHERE m.id = $1
           AND m.ativo = TRUE
           AND c.ativo = TRUE`,
        [id]
    );

    return resultado.rows[0] || null;
}

// Busca o tipo de um conteúdo ativo.
async function buscarTipoConteudo(conteudoId) {
    const resultado = await pool.query(
        `SELECT tipo_conteudo
         FROM conteudos_catalogo
         WHERE id = $1
           AND ativo = TRUE`,
        [conteudoId]
    );

    return resultado.rows[0] || null;
}

// Cadastra uma mídia e seu relacionamento na mesma transação.
async function cadastrar(dados) {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        const conteudo = await client.query(
            `SELECT id
             FROM conteudos_catalogo
             WHERE id = $1
               AND ativo = TRUE
             FOR KEY SHARE`,
            [dados.conteudo_id]
        );

        if (conteudo.rowCount === 0) {
            throw criarErro('Conteúdo não encontrado ou inativo.', 404);
        }

        const resultadoMidia = await client.query(
            `INSERT INTO midias (
                titulo,
                descricao,
                google_drive_file_id,
                imagem_url,
                criado_por
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING
                id,
                titulo,
                descricao,
                google_drive_file_id,
                imagem_url,
                criado_em,
                atualizado_em`,
            [
                dados.titulo,
                dados.descricao,
                dados.google_drive_file_id,
                dados.imagem_url,
                dados.criado_por
            ]
        );

        const midia = resultadoMidia.rows[0];

        await client.query(
            `INSERT INTO conteudo_midias (
                conteudo_id,
                midia_id,
                ordem,
                temporada,
                episodio
             )
             VALUES ($1, $2, $3, $4, $5)`,
            [
                dados.conteudo_id,
                midia.id,
                dados.ordem,
                dados.temporada ?? null,
                dados.episodio ?? null
            ]
        );

        await client.query('COMMIT');
        transacaoIniciada = false;

        return {
            ...midia,
            conteudo_id: dados.conteudo_id,
            ordem: dados.ordem,
            temporada: dados.temporada ?? null,
            episodio: dados.episodio ?? null
        };
    } catch (erro) {
        if (transacaoIniciada) {
            try {
                await client.query('ROLLBACK');
            } catch (erroRollback) {
                console.error(
                    'Erro ao desfazer cadastro de mídia:',
                    erroRollback
                );
            }
        }

        throw erro;
    } finally {
        client.release();
    }
}

// Atualiza uma mídia e, opcionalmente, seu relacionamento.
async function atualizar(id, dados) {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        const resultado = await client.query(
            `UPDATE midias
             SET
                titulo = $1,
                descricao = $2,
                google_drive_file_id = $3,
                imagem_url = $4,
                atualizado_em = NOW()
             WHERE id = $5
               AND ativo = TRUE
             RETURNING
                id,
                titulo,
                descricao,
                google_drive_file_id,
                imagem_url,
                atualizado_em`,
            [
                dados.titulo,
                dados.descricao,
                dados.google_drive_file_id,
                dados.imagem_url,
                id
            ]
        );

        if (resultado.rowCount === 0) {
            await client.query('ROLLBACK');
            transacaoIniciada = false;
            return null;
        }

        const midia = resultado.rows[0];

        // Recupera e bloqueia o relacionamento atual.
        const relacionamentoAtual = await client.query(
            `SELECT
                conteudo_id,
                ordem,
                temporada,
                episodio
             FROM conteudo_midias
             WHERE midia_id = $1
             FOR UPDATE`,
            [id]
        );

        const relacionamento = relacionamentoAtual.rows[0];

        // Altera o conteúdo associado, se informado.
        if (dados.conteudo_id !== undefined) {
            const conteudo = await client.query(
                `SELECT id
                 FROM conteudos_catalogo
                 WHERE id = $1
                   AND ativo = TRUE
                 FOR KEY SHARE`,
                [dados.conteudo_id]
            );

            if (conteudo.rowCount === 0) {
                throw criarErro(
                    'Conteúdo não encontrado ou inativo.',
                    404
                );
            }

            // Preserva os valores atuais quando não forem enviados.
            const temporada = dados.temporada !== undefined
                ? dados.temporada
                : relacionamento?.temporada ?? null;

            const episodio = dados.episodio !== undefined
                ? dados.episodio
                : relacionamento?.episodio ?? null;

            if (relacionamento) {
                await client.query(
                    `UPDATE conteudo_midias
                     SET
                        conteudo_id = $1,
                        ordem = COALESCE($2, ordem),
                        temporada = $3,
                        episodio = $4
                     WHERE midia_id = $5`,
                    [
                        dados.conteudo_id,
                        dados.ordem ?? null,
                        temporada,
                        episodio,
                        id
                    ]
                );
            } else {
                await client.query(
                    `INSERT INTO conteudo_midias (
                        conteudo_id,
                        midia_id,
                        ordem,
                        temporada,
                        episodio
                     )
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        dados.conteudo_id,
                        id,
                        dados.ordem ?? 1,
                        temporada,
                        episodio
                    ]
                );
            }
        } else if (
            dados.ordem !== undefined ||
            dados.temporada !== undefined ||
            dados.episodio !== undefined
        ) {
            if (!relacionamento) {
                throw criarErro(
                    'O relacionamento da mídia com o conteúdo não foi encontrado.',
                    404
                );
            }

            await client.query(
                `UPDATE conteudo_midias
                 SET
                    ordem = COALESCE($1, ordem),
                    temporada = $2,
                    episodio = $3
                 WHERE midia_id = $4`,
                [
                    dados.ordem ?? null,
                    dados.temporada !== undefined
                        ? dados.temporada
                        : relacionamento.temporada,
                    dados.episodio !== undefined
                        ? dados.episodio
                        : relacionamento.episodio,
                    id
                ]
            );
        }

        const resultadoFinal = await client.query(
            `SELECT
                cm.conteudo_id,
                cm.ordem,
                cm.temporada,
                cm.episodio
             FROM conteudo_midias cm
             WHERE cm.midia_id = $1`,
            [id]
        );

        await client.query('COMMIT');
        transacaoIniciada = false;

        return {
            ...midia,
            ...(resultadoFinal.rows[0] || {})
        };
    } catch (erro) {
        if (transacaoIniciada) {
            try {
                await client.query('ROLLBACK');
            } catch (erroRollback) {
                console.error(
                    'Erro ao desfazer atualização de mídia:',
                    erroRollback
                );
            }
        }

        throw erro;
    } finally {
        client.release();
    }
}

// Desativa uma mídia sem excluir seu registro ou relacionamento.
async function desativar(id) {
    const resultado = await pool.query(
        `UPDATE midias
         SET
            ativo = FALSE,
            atualizado_em = NOW()
         WHERE id = $1
           AND ativo = TRUE
         RETURNING id, titulo, ativo`,
        [id]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    listarTodas,
    listarPorConteudo,
    buscarPorId,
    buscarTipoConteudo,
    cadastrar,
    atualizar,
    desativar
};
