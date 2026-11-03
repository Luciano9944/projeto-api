describe('Séries | títulos, detalhes e temporadas com API real', () => {
    beforeEach(() => {
        cy.intercept('GET', '/api/series/populares*').as('series');
        cy.visit('/#series');
        cy.wait('@series').as('respostaSeries');
        cy.get('.grade-filmes').should('have.attr', 'aria-busy', 'false');
    });

    it('mostra títulos e notas das séries retornadas pelo backend', () => {
        cy.get('h1').should('have.text', 'Séries');
        cy.get('@respostaSeries').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            expect(response.body.results).not.to.be.empty;
            cy.get('.cartao-filme h2').first().should('have.text', response.body.results[0].name);
        });
        cy.get('.cartao-filme').first().within(() => {
            cy.get('.capa-conteudo .nota-filme').should('not.exist');
            cy.get('.informacoes-filme .nota-filme').should('be.visible');
        });
    });

    it('encontra Os Simpsons pelo título em português', () => {
        cy.intercept('GET', '/api/series/buscar*').as('buscaSeries');
        cy.get('#busca-series').type('Os Simpsons{enter}');
        cy.wait('@buscaSeries').then(({ request, response }) => {
            expect(new URL(request.url).searchParams.get('query')).to.eq('Os Simpsons');
            expect(response.statusCode).to.eq(200);
        });
        cy.contains('.cartao-filme h2 button', /^Os Simpsons$/).should('be.visible');
    });

    it('abre a série selecionada e retorna à lista', () => {
        cy.get('.cartao-filme h2 button').first().then($titulo => {
            const titulo = $titulo.text();
            cy.wrap($titulo).click();
            cy.get('main h1').should('have.text', titulo);
        });
        cy.contains('button', 'Voltar para a lista').click();
        cy.get('h1').should('have.text', 'Séries');
        cy.get('.cartao-filme').should('have.length.greaterThan', 0);
    });

    it('consulta a primeira temporada e o primeiro episódio de Os Simpsons', () => {
        cy.intercept('GET', '/api/series/456').as('detalhes');
        cy.intercept('GET', '/api/series/456/temporadas/1').as('temporada');
        cy.intercept('GET', '/api/series/456/temporadas/1/episodios/1').as('episodio');
        cy.visit('/#series/456');
        cy.wait('@detalhes').its('response.body.nome').should('eq', 'Os Simpsons');
        cy.get('main h1').should('have.text', 'Os Simpsons');
        cy.contains('label', 'Temporada:').find('select').select('1');
        cy.contains('button', 'Consultar temporada').click();
        cy.wait('@temporada').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            expect(response.body.episodes).not.to.be.empty;
            cy.contains('h3', response.body.name).should('be.visible');
        });
        cy.contains('label', 'Número do episódio:').find('input').clear().type('1');
        cy.contains('button', 'Consultar episódio').click();
        cy.wait('@episodio').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            cy.contains('h3', `Episódio 1: ${response.body.name}`).should('be.visible');
        });
    });

    after(() => {
        if (Cypress.config('isInteractive')) {
            cy.screenshot('02-series-execucao-interativa', { capture: 'runner', overwrite: true });
        }
    });
});
