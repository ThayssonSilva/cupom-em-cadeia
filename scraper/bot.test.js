const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizarOfertaMercadoLivre, inferirCategoria, paginarLista, extrairCupomValido, removerOfertasExpiradas } = require('./bot.js');

test('paginarLista divide grandes listas em lotes sem perder itens', () => {
  const itens = Array.from({ length: 250 }, (_, index) => ({ id: index + 1 }));
  const pagina = paginarLista(itens, 2, 80);

  assert.equal(pagina.total, 250);
  assert.equal(pagina.itens.length, 160);
  assert.equal(pagina.temMais, true);
  assert.equal(pagina.itens[0].id, 1);
  assert.equal(pagina.itens[pagina.itens.length - 1].id, 160);
});

test('extrairCupomValido usa cupom real do site e rejeita valores falsos', () => {
  assert.equal(extrairCupomValido({ coupon: 'SAVE10' }, 'Amazon'), 'SAVE10');
  assert.equal(extrairCupomValido({ coupon: 'teste' }, 'Amazon'), 'PROMOCAO');
  assert.equal(extrairCupomValido({ promotionCode: 'FREESHIP' }, 'Shopee'), 'FREESHIP');
});

test('removerOfertasExpiradas elimina produtos sem validade ativa', () => {
  const lista = [
    { id: 1, titulo: 'TV ativa', validUntil: '2099-12-31' },
    { id: 2, titulo: 'TV expirada', validUntil: '2020-01-01' },
    { id: 3, titulo: 'Sem validade', active: true },
    { id: 4, titulo: 'Cancelada', status: 'expired' }
  ];

  const ativa = removerOfertasExpiradas(lista);

  assert.equal(ativa.length, 2);
  assert.deepEqual(ativa.map((item) => item.id), [1, 3]);
});

test('normalizarOfertaMercadoLivre transforma um item real em um payload do site', () => {
  const item = {
    title: 'TV Smart 50" 4K',
    price: 2099,
    original_price: 2799,
    permalink: 'https://www.mercadolivre.com.br/tv-smart-50',
    thumbnail: 'https://example.com/image.jpg'
  };

  const oferta = normalizarOfertaMercadoLivre(item, 'Mercado Livre');

  assert.equal(oferta.loja, 'Mercado Livre');
  assert.equal(oferta.titulo, 'TV Smart 50" 4K');
  assert.equal(oferta.precoAtual, 'R$ 2.099,00');
  assert.equal(oferta.precoAntigo, 'R$ 2.799,00');
  assert.equal(oferta.categoria, 'Eletrônicos');
  assert.equal(oferta.cupom, 'PROMOCAO');
  assert.equal(oferta.linkAfiliado, 'https://www.mercadolivre.com.br/tv-smart-50');
});

test('inferirCategoria identifica categorias por palavras-chave do produto', () => {
  assert.equal(inferirCategoria({ title: 'Fone Bluetooth sem fio' }, 'Shopee'), 'Eletrônicos');
  assert.equal(inferirCategoria({ title: 'Camiseta masculina premium' }, 'Amazon'), 'Moda');
  assert.equal(inferirCategoria({ title: 'Mesa de escritório' }, 'Casas Bahia'), 'Casa');
  assert.equal(inferirCategoria({ title: 'Kit de acessórios para carro' }, 'Mercado Livre'), 'Acessórios');
});
