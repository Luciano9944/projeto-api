// Força respostas completas da API real, sem depender do cache do navegador.
// Nenhuma resposta é substituída por fixtures ou dados simulados.
beforeEach(() => {
    cy.intercept({ url: '**/api/**', middleware: true }, request => {
        delete request.headers['if-none-match'];
        delete request.headers['if-modified-since'];
    });
});
