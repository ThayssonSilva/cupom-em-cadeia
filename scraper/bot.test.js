const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizarOfertaMercadoLivre } = require('./bot.js');

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
  assert.match(oferta.cupom, /ML|OFERTA/i);
  assert.equal(oferta.linkAfiliado, 'https://www.mercadolivre.com.br/tv-smart-50');
});
