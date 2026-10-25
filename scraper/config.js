const affiliateStores = [
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    active: false,
    affiliateTag: '',
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'celular', 'smart tv'],
    publicUrl: 'https://api.mercadolibre.com/sites/MLB/search?q=notebook+gamer&limit=3'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    active: false,
    affiliateTag: '',
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'smart tv', 'fone bluetooth'],
    publicUrl: 'https://www.amazon.com.br/s?k=notebook+gamer'
  },
  {
    id: 'shopee',
    name: 'Shopee',
    active: false,
    affiliateTag: '',
    affiliateParam: 'aff_siteid',
    searchQueries: ['notebook gamer', 'smart tv', 'vapo'],
    publicUrl: 'https://shopee.com.br/search?keyword=notebook%20gamer'
  }
];

const demoSources = [
  {
    id: 'fake-store',
    name: 'Fake Store',
    url: 'https://fakestoreapi.com/products?limit=3',
    active: true
  },
  {
    id: 'dummyjson',
    name: 'DummyJSON',
    url: 'https://dummyjson.com/products?limit=3',
    active: true
  }
];

function isAffiliateReady() {
  return affiliateStores.some((loja) => loja.active && loja.affiliateTag);
}

function buildAffiliateLink(url, loja) {
  if (!url || !loja || !loja.active || !loja.affiliateTag) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set(loja.affiliateParam || 'tag', loja.affiliateTag);
    return parsed.toString();
  } catch (error) {
    return url;
  }
}

module.exports = {
  affiliateStores,
  demoSources,
  isAffiliateReady,
  buildAffiliateLink
};
