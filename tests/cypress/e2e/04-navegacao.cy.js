describe('Navegação | detalhes, acesso de visitante e celular', () => {
    it('mantém os detalhes do filme depois de recarregar o link direto', () => {
        cy.intercept('GET', '/api/filmes/155').as('filme');
        cy.visit('/#filmes/155');
        cy.wait('@filme').its('response.statusCode').should('eq', 200);
        cy.get('h1').should('have.text', 'Batman: O Cavaleiro das Trevas');
        cy.contains('h2', 'Sinopse').should('be.visible');
        cy.contains('button', 'Adicionar aos favoritos').should('be.disabled');
        cy.reload();
        cy.wait('@filme');
        cy.hash().should('eq', '#filmes/155');
        cy.get('h1').should('have.text', 'Batman: O Cavaleiro das Trevas');
        cy.contains('button', 'Voltar ao catálogo').click();
        cy.hash().should('eq', '#filmes');
        cy.get('.cartao-filme').should('have.length.greaterThan', 0);
    });

    it('solicita login ao visitante que abre o perfil', () => {
        cy.intercept('GET', '/api/perfil').as('perfil');
        cy.visit('/#perfil');
        cy.wait('@perfil').its('response.statusCode').should('eq', 401);
        cy.get('h1').should('have.text', 'Entrar');
        cy.get('.perfil').should('not.exist');
    });

    it('não exibe o painel administrativo ao visitante', () => {
        cy.intercept('GET', '/api/perfil').as('perfil');
        cy.visit('/#admin');
        cy.wait('@perfil').its('response.statusCode').should('eq', 401);
        cy.contains('Acesso restrito aos administradores.').should('be.visible');
        cy.get('.navegacao-catalogo a[href="#admin"]').should('not.exist');
        cy.get('main form').should('not.exist');
    });

    it('permite navegar e pesquisar em celular sem rolagem horizontal', () => {
        cy.viewport(390, 844);
        cy.intercept('GET', '/api/filmes/populares*').as('filmes');
        cy.intercept('GET', '/api/series/populares*').as('series');
        cy.intercept('GET', '/api/series/buscar*').as('busca');
        cy.visit('/');
        cy.wait('@filmes').its('response.statusCode').should('eq', 200);
        cy.get('.cartao-filme').should('have.length.greaterThan', 0);
        cy.document().should(doc => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
        cy.get('.navegacao-catalogo a[href="#series"]').click();
        cy.wait('@series').its('response.statusCode').should('eq', 200);
        cy.get('#busca-series').type('Os Simpsons{enter}');
        cy.wait('@busca').its('response.statusCode').should('eq', 200);
        cy.contains('.cartao-filme h2', /^Os Simpsons$/).should('be.visible');
        cy.document().should(doc => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
        cy.scrollTo('top');
    });

    after(() => {
        if (Cypress.config('isInteractive')) {
            cy.screenshot('04-navegacao-celular-execucao-interativa', { capture: 'runner', overwrite: true });
        }
    });
});
