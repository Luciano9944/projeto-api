// As interceptações apenas observam: as respostas vêm da API real.
describe('Filmes | catálogo e pesquisa com API real', () => {
    beforeEach(() => {
        cy.intercept('GET', '/api/filmes/populares*').as('populares');
        cy.visit('/#filmes');
        cy.wait('@populares').its('response.statusCode').should('eq', 200);
        cy.get('.grade-filmes').should('have.attr', 'aria-busy', 'false');
    });

    it('exibe filmes na abertura, com nota abaixo do título', () => {
        cy.title().should('eq', 'CineMarvel');
        cy.get('h1').should('have.text', 'Filmes');
        cy.get('.cartao-filme').should('have.length.greaterThan', 0);
        cy.get('.cartao-filme').first().within(() => {
            cy.get('h2 button').should('not.be.empty');
            cy.get('.capa-conteudo .nota-filme').should('not.exist');
            cy.get('.informacoes-filme .metadados-filme .nota-filme').should('be.visible');
        });
        cy.contains('button', 'Anterior').should('be.disabled');
    });

    it('pesquisa Batman e apresenta o resultado retornado pela API', () => {
        cy.intercept('GET', '/api/filmes/buscar*').as('busca');
        cy.get('#busca-filmes').type('Batman{enter}');
        cy.wait('@busca').then(({ request, response }) => {
            expect(new URL(request.url).searchParams.get('query')).to.eq('Batman');
            expect(response.statusCode).to.eq(200);
            expect(response.body.results).not.to.be.empty;
            cy.get('.cartao-filme h2').first().should('have.text', response.body.results[0].title);
        });
        cy.get('h1').should('contain.text', 'Resultados para “Batman”');
    });

    it('informa quando a pesquisa não encontra filmes', () => {
        cy.intercept('GET', '/api/filmes/buscar*').as('buscaVazia');
        cy.get('#busca-filmes').type('zzzxqvvtcine987654321{enter}');
        cy.wait('@buscaVazia').its('response.body.results').should('be.empty');
        cy.contains('Nenhum filme encontrado.').should('be.visible');
        cy.get('.cartao-filme').should('not.exist');
    });

    it('rejeita pesquisa em branco sem chamar o endpoint de busca', () => {
        cy.intercept('GET', '/api/filmes/buscar*').as('buscas');
        cy.get('#busca-filmes').type('   {enter}');
        cy.get('[role="alert"]').should('contain.text', 'Digite o nome de um filme');
        cy.get('@buscas.all').should('have.length', 0);
    });

    it('troca para Marvel e avança para a segunda página', () => {
        cy.intercept('GET', '/api/filmes/marvel*').as('marvel');
        cy.contains('.filtros-catalogo button', 'Marvel').click();
        cy.wait('@marvel').its('response.statusCode').should('eq', 200);
        cy.contains('.filtros-catalogo button', 'Marvel').should('have.attr', 'aria-pressed', 'true');
        cy.get('.grade-filmes').should('have.attr', 'aria-busy', 'false');
        cy.contains('button', 'Próxima').click();
        cy.wait('@marvel').then(({ request, response }) => {
            expect(new URL(request.url).searchParams.get('page')).to.eq('2');
            expect(response.statusCode).to.eq(200);
            cy.get('.cartao-filme h2').first().should('have.text', response.body.results[0].title);
        });
        cy.get('.paginacao').should('contain.text', 'Página 2 de');
        cy.contains('button', 'Anterior').should('be.enabled');
        cy.scrollTo('top');
    });

    after(() => {
        if (Cypress.config('isInteractive')) {
            cy.screenshot('01-filmes-execucao-interativa', { capture: 'runner', overwrite: true });
        }
    });
});
