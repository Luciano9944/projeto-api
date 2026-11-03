describe('Conta | validações sem cadastrar ou alterar usuários', () => {
    it('impede login sem preencher os campos obrigatórios', () => {
        cy.intercept('POST', '/api/login').as('login');
        cy.visit('/#login');
        cy.get('.login-form button[type="submit"]').click();
        cy.get('#Login-email').then($input => expect($input[0].validity.valueMissing).to.eq(true));
        cy.get('@login.all').should('have.length', 0);
    });

    it('impede login com formato de e-mail inválido', () => {
        cy.intercept('POST', '/api/login').as('login');
        cy.visit('/#login');
        cy.get('#Login-email').type('email-invalido');
        cy.get('#Login-senha').type('SenhaDeTeste123', { log: false });
        cy.get('.login-form button[type="submit"]').click();
        cy.get('#Login-email').then($input => expect($input[0].validity.typeMismatch).to.eq(true));
        cy.get('@login.all').should('have.length', 0);
    });

    it('mostra a rejeição real de credenciais inexistentes', () => {
        cy.intercept('POST', '/api/login').as('login');
        cy.visit('/#login');
        cy.get('#Login-email').type('cypress-sem-conta@example.invalid');
        cy.get('#Login-senha').type('SenhaDeTeste123', { log: false });
        cy.get('.login-form button[type="submit"]').click();
        cy.wait('@login').its('response.statusCode').should('eq', 401);
        cy.get('[role="alert"]').should('have.text', 'E-mail ou senha incorretos.');
        cy.get('.login-form button[type="submit"]').should('be.enabled');
        cy.get('.nome-usuario').should('not.exist');
    });

    it('navega entre os formulários de login e cadastro', () => {
        cy.visit('/#login');
        cy.contains('button', 'Criar conta').click();
        cy.hash().should('eq', '#cadastro');
        cy.get('h1').should('have.text', 'Criar conta');
        cy.contains('button', 'Já tenho uma conta').click();
        cy.hash().should('eq', '#login');
        cy.get('h1').should('have.text', 'Entrar');
    });

    it('rejeita senha curta sem criar uma conta', () => {
        cy.intercept('POST', '/api/cadastro').as('cadastro');
        cy.visit('/#cadastro');
        cy.get('#Cadastro-nome').type('Pessoa de Teste');
        cy.get('#Cadastro-email').type('teste@example.invalid');
        cy.get('#Cadastro-senha').type('curta', { log: false });
        cy.get('#Cadastro-senha').should('have.attr', 'minlength', '8');
        cy.get('#Cadastro-confirmar-senha').type('curta', { log: false });
        cy.get('.cadastro button[type="submit"]').click();
        // A digitação sintética não ativa tooShort no Electron: validamos
        // também a rejeição real do servidor, anterior à criação de usuário.
        cy.wait('@cadastro').its('response.statusCode').should('eq', 400);
        cy.get('[role="alert"]').should('contain.text', 'pelo menos 8 caracteres');
    });

    it('avisa quando as senhas de cadastro não coincidem', () => {
        cy.intercept('POST', '/api/cadastro').as('cadastro');
        cy.visit('/#cadastro');
        cy.get('#Cadastro-nome').type('Pessoa de Teste');
        cy.get('#Cadastro-email').type('teste@example.invalid');
        cy.get('#Cadastro-senha').type('SenhaDeTeste123', { log: false });
        cy.get('#Cadastro-confirmar-senha').type('OutraSenha123', { log: false });
        cy.get('.cadastro button[type="submit"]').click();
        cy.get('[role="alert"]').should('have.text', 'As senhas não coincidem.');
        cy.get('@cadastro.all').should('have.length', 0);
    });

    after(() => {
        if (Cypress.config('isInteractive')) {
            cy.screenshot('03-formularios-execucao-interativa', { capture: 'runner', overwrite: true });
        }
    });
});
