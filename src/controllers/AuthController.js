
const bcrypt = require('bcryptjs');
const usuarios = require('../repositories/UsuarioRepository');

// Cadastro de usuário.
async function cadastrar(req, res, next) {
    try {
        const { nome, email, senha } = req.body ?? {};

        // Validação dos campos.
        if (
            typeof nome !== 'string' ||
            typeof email !== 'string' ||
            typeof senha !== 'string'
        ) {
            return res.status(400).json({
                erro: 'Informe nome, e-mail e senha válidos.'
            });
        }

        const nomeNormalizado = nome.trim();
        const emailNormalizado = email.trim().toLowerCase();

        if (!nomeNormalizado || nomeNormalizado.length > 100) {
            return res.status(400).json({
                erro: 'O nome deve ter entre 1 e 100 caracteres.'
            });
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(emailNormalizado)) {
            return res.status(400).json({
                erro: 'Informe um e-mail válido.'
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                erro: 'A senha deve possuir pelo menos 8 caracteres.'
            });
        }

        // Verifica se o e-mail já está cadastrado.
        if (await usuarios.buscarIdPorEmail(emailNormalizado) !== null) {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        // Protege a senha utilizando bcrypt.
        const senhaHash = await bcrypt.hash(senha, 12);

        // Cria sempre um usuário comum.
        const usuario = await usuarios.cadastrar({
            nome: nomeNormalizado,
            email: emailNormalizado,
            senhaHash
        });

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
            usuario
        });

    } catch (erro) {
        // Protege contra tentativas simultâneas com o mesmo e-mail.
        if (erro.code === '23505') {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        next(erro);
    }
}


// Login de usuário.
async function login(req, res, next) {
    try {
        const { email, senha } = req.body ?? {};

        if (
            typeof email !== 'string' ||
            typeof senha !== 'string' ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                erro: 'Informe e-mail e senha.'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const usuario = await usuarios.buscarParaLogin(emailNormalizado);

        if (!usuario) {
            return res.status(401).json({
                erro: 'E-mail ou senha incorretos.'
            });
        }

        if (!usuario.ativo) {
            return res.status(403).json({
                erro: 'Esta conta está desativada.'
            });
        }

        // Compara a senha informada com o hash armazenado.
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'E-mail ou senha incorretos.'
            });
        }

        // Evita reutilização da sessão anterior.
        await new Promise((resolve, reject) => {
            req.session.regenerate((erro) => {
                if (erro) {
                    return reject(erro);
                }

                resolve();
            });
        });

        // Armazena os dados necessários na sessão.
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            papel: usuario.papel
        };

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            usuario: req.session.usuario
        });

    } catch (erro) {
        next(erro);
    }
}


// Consulta o perfil do usuário autenticado.
function perfil(req, res) {
    return res.status(200).json({
        autenticado: true,
        usuario: req.session.usuario
    });
}


// Encerra a sessão.
function logout(req, res, next) {
    req.session.destroy((erro) => {
        if (erro) {
            return next(erro);
        }

        res.clearCookie('cinecatalog.sid', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'
                ? 'none'
                : 'lax'
        });

        return res.status(200).json({
            mensagem: 'Sessão encerrada com sucesso.'
        });
    });
}


module.exports = {
    cadastrar,
    login,
    perfil,
    logout
};
