import test from 'node:test';
import assert from 'node:assert/strict';
import { lerRota, obterLinkConteudo } from './navegacao.js';

test('comentário aponta para o ID do conteúdo, preservando o ID interno do registro', () => {
    assert.equal(obterLinkConteudo({ id: 7, tipo_conteudo: 'filme', conteudo_id: '155' }), '#filmes/155');
    assert.equal(obterLinkConteudo({ id: 7, tipo_conteudo: 'serie', conteudo_id: '155' }), '#series/155');
});

test('links de filmes e séries podem ser abertos diretamente e recarregados', () => {
    assert.deepEqual(lerRota('#filmes/155'), { pagina: 'filmes', conteudoId: '155' });
    assert.deepEqual(lerRota('#series/1399'), { pagina: 'series', conteudoId: '1399' });
});

test('início e páginas existentes continuam navegáveis', () => {
    assert.deepEqual(lerRota(''), { pagina: 'filmes', conteudoId: null });
    assert.deepEqual(lerRota('#series'), { pagina: 'series', conteudoId: null });
    assert.deepEqual(lerRota('#perfil'), { pagina: 'perfil', conteudoId: null });
    assert.deepEqual(lerRota('#admin'), { pagina: 'admin', conteudoId: null });
});

test('endereços inválidos não abrem detalhes com IDs incorretos', () => {
    for (const hash of ['#filmes/abc', '#filmes/-1', '#filmes/0', '#series/12/extra', '#perfil/155']) {
        assert.equal(lerRota(hash).conteudoId, null);
    }
    assert.equal(lerRota('#desconhecido/155').pagina, 'filmes');
    assert.equal(lerRota('#desconhecido/155').conteudoId, null);
});

test('referência inválida não cria link para outro tipo de conteúdo', () => {
    for (const tipo of ['anime', 'constructor', '']) {
        assert.equal(obterLinkConteudo({ tipo_conteudo: tipo, conteudo_id: 155 }), null);
    }
    assert.equal(obterLinkConteudo({ id: 155, tipo_conteudo: 'filme' }), null);
});
