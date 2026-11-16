require('dotenv').config();

const { randomUUID } = require('node:crypto');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/config/database');

const rotaAdmin = '/api/admin/catalogo';
const item = { tmdb_id: 22, tipo_conteudo: 'filme', titulo: 'Filme de teste' };
const admin = { email: 'admin-vvt@example.invalid', senha: randomUUID() };

async function criarTabelasTemporarias(conexao) {
    const esquema = await readFile(join(__dirname, '../../database/schema.sql'), 'utf8');
    const instrucoes = esquema.replace(/^--.*$/gm, '').split(';').map(sql => sql.trim());

    for (const sql of instrucoes) {
        if (['', 'BEGIN', 'COMMIT', 'SET LOCAL search_path TO public'].includes(sql)) continue;

        if (sql.startsWith('CREATE TABLE ')) {
            await conexao.query(sql.replace('CREATE TABLE ', 'CREATE TEMP TABLE '));
        } else if (/^CREATE (?:UNIQUE )?INDEX /.test(sql)) {
            await conexao.query(sql.replace(' ON public.', ' ON pg_temp.'));
        } else {
            throw new Error('O esquema de testes aceita apenas criação de tabelas e índices.');
        }
    }

    await conexao.query(`CREATE TEMP TABLE sessoes (
        sid varchar PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
    )`);
}

async function registrarCliente(campos = {}) {
    const credenciais = { email: `${randomUUID()}@example.invalid`, senha: randomUUID() };
    const cadastro = await request(app).post('/api/cadastro')
        .send({ nome: 'Cliente de teste', ...credenciais, ...campos }).expect(201);
    return { credenciais, usuario: cadastro.body.usuario };
}

async function entrar(credenciais, papel) {
    const agente = request.agent(app);
    const login = await agente.post('/api/login').send(credenciais).expect(200);
    expect(login.body.usuario).toMatchObject({ email: credenciais.email, papel });
    expect(login.headers['set-cookie']).toEqual(expect.arrayContaining([
        expect.stringMatching(/^cinecatalog\.sid=.*; HttpOnly/)
    ]));
    return agente;
}

describe('Integração de contas e catálogo com PostgreSQL isolado', () => {
    let conexao;
    let consulta;

    beforeAll(async () => {
        conexao = await pool.connect();
        await conexao.query('BEGIN');
        // A aplicação só enxerga as tabelas temporárias desta conexão durante a suíte.
        await conexao.query('SET LOCAL search_path TO pg_temp');
        await criarTabelasTemporarias(conexao);
        consulta = jest.spyOn(pool, 'query').mockImplementation(conexao.query.bind(conexao));

        const senhaHash = await bcrypt.hash(admin.senha, 4);
        await conexao.query(
            `INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1, $2, $3, 'admin')`,
            ['Admin de teste', admin.email, senhaHash]
        );
    }, 20000);

    afterAll(async () => {
        try {
            if (conexao) await conexao.query('ROLLBACK');
        } finally {
            consulta?.mockRestore();
            // Descarte a conexão mesmo se a limpeza falhar.
            conexao?.release(true);
            await pool.end();
        }
    });

    test('INT-04 cadastro público mantém o papel cliente', async () => {
        const { usuario } = await registrarCliente({ papel: 'admin' });
        expect(usuario.papel).toBe('usuario');
        expect(usuario).not.toHaveProperty('senha_hash');
    });

    test('INT-05 cliente entra e consulta o próprio perfil com o cookie', async () => {
        const { credenciais, usuario: { id, nome, email, papel } } = await registrarCliente();
        const cliente = await entrar(credenciais, 'usuario');
        const perfil = await cliente.get('/api/perfil').expect(200);
        expect(perfil.body).toMatchObject({ autenticado: true, usuario: { id, nome, email, papel } });
    });

    test('INT-06 cliente autenticado recebe 403 nas três operações administrativas', async () => {
        const { credenciais } = await registrarCliente();
        const cliente = await entrar(credenciais, 'usuario');
        const erro = { erro: 'Acesso permitido somente para administradores.' };
        await cliente.post(rotaAdmin).send(item).expect(403, erro);
        await cliente.put(`${rotaAdmin}/1`).send({ titulo: 'Outro título' }).expect(403, erro);
        await cliente.delete(`${rotaAdmin}/1`).expect(403, erro);
    });

    test('INT-07 administrador entra e mantém o papel no perfil', async () => {
        const agente = await entrar(admin, 'admin');
        const perfil = await agente.get('/api/perfil').expect(200);
        expect(perfil.body).toMatchObject({ autenticado: true, usuario: { email: admin.email, papel: 'admin' } });
    });

    test('INT-08 administrador cadastra, consulta, edita e desativa um item do catálogo', async () => {
        const agente = await entrar(admin, 'admin');
        const cadastro = await agente.post(rotaAdmin).send(item).expect(201);
        const id = cadastro.body.id;
        const rotaPublica = `/api/catalogo/${id}`;
        const rotaDoItem = `${rotaAdmin}/${id}`;
        expect(cadastro.body).toMatchObject({ titulo: item.titulo, ativo: true });

        const consultaInicial = await request(app).get(rotaPublica).expect(200);
        expect(consultaInicial.body).toMatchObject({ id, titulo: item.titulo });

        const titulo = 'Filme editado no teste';
        const edicao = await agente.put(rotaDoItem).send({ titulo }).expect(200);
        expect(edicao.body).toMatchObject({ id, titulo });
        const consultaEditada = await request(app).get(rotaPublica).expect(200);
        expect(consultaEditada.body).toMatchObject({ id, titulo });

        const remocao = await agente.delete(rotaDoItem).expect(200);
        expect(remocao.body.conteudo).toMatchObject({ id, ativo: false });
        await request(app).get(rotaPublica).expect(404, { erro: 'Conteúdo não encontrado.' });
    });

    test('INT-09 logout invalida a sessão do cliente', async () => {
        const { credenciais } = await registrarCliente();
        const cliente = request.agent(app);
        const login = await cliente.post('/api/login').send(credenciais).expect(200);
        const cookie = login.headers['set-cookie'][0].split(';')[0];

        await cliente.post('/api/logout').expect(200);
        await cliente.get('/api/perfil').expect(401);
        await request(app).get('/api/perfil').set('Cookie', cookie).expect(401);
    });

    test('INT-10 administrador recebe 400 para ID TMDB booleano', async () => {
        const agente = await entrar(admin, 'admin');
        await agente.post(rotaAdmin).send({ ...item, tmdb_id: true })
            .expect(400, { erro: 'ID do TMDB inválido.' });
    });
});
