class Filme {
    constructor({ id = null, titulo, ano }) {
        this.id = id;
        this.titulo = titulo;
        this.ano = ano;
    }

    static validar(dados) {
        if (!dados.titulo || !dados.ano) {
            return {
                valido: false,
                erro: 'Título e ano são obrigatórios'
            };
        }

        return {
            valido: true
        };
    }
}

module.exports = Filme;