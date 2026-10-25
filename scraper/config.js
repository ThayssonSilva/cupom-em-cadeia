const affiliateStores = [
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    active: true,
    affiliateTag: 'SEU_ID_MERCADO_LIVRE',
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'celular', 'smart tv'],
    publicUrl: 'https://api.mercadolibre.com/sites/MLB/search?q=notebook+gamer&limit=3',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    active: true,
    affiliateTag: 'SEU_ID_AMAZON-20',
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'smart tv', 'fone bluetooth'],
    publicUrl: 'https://www.amazon.com.br/s?k=notebook+gamer',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'shopee',
    name: 'Shopee',
    active: true,
    affiliateTag: 'SEU_ID_SHOPEE',
    affiliateParam: 'aff_siteid',
    searchQueries: ['notebook gamer', 'smart tv', 'achadinhos'],
    publicUrl: 'https://shopee.com.br/search?keyword=notebook%20gamer',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'magazineluiza',
    name: 'Magazine Luiza',
    active: true,
    affiliateTag: 'SEU_ID_MAGALU',
    affiliateParam: 'partner_id',
    searchQueries: ['smartphone', 'smart tv', 'eletroportateis'],
    publicUrl: 'https://www.magazineluiza.com.br/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'casasbahia',
    name: 'Casas Bahia',
    active: true,
    affiliateTag: 'SEU_ID_CASASBAHIA',
    affiliateParam: 'utm_source',
    searchQueries: ['celular', 'notebook', 'moveis'],
    publicUrl: 'https://www.casasbahia.com.br/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    active: true,
    affiliateTag: 'SEU_ID_ALIEXPRESS',
    affiliateParam: 'aff_fcid',
    searchQueries: ['gadgets', 'eletronicos', 'achadinhos'],
    publicUrl: 'https://pt.aliexpress.com/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  }
];

const demoSources = [
  { name: 'Mercado Livre', url: 'https://api.mercadolibre.com/sites/MLB/search?q=notebook+gamer&limit=3' },
  { name: 'Amazon', url: 'https://www.amazon.com.br/s?k=notebook+gamer' },
  { name: 'Shopee', url: 'https://shopee.com.br/search?keyword=notebook%20gamer' },
  { name: 'Magazine Luiza', url: 'https://www.magazineluiza.com.br/' },
  { name: 'Casas Bahia', url: 'https://www.casasbahia.com.br/' },
  { name: 'AliExpress', url: 'https://pt.aliexpress.com/' }
];

function isAffiliateReady(loja) {
  return Boolean(loja && loja.active && loja.publicUrl);
}

function buildAffiliateLink(url, loja) {
  if (!url || !loja || !loja.affiliateTag || !loja.affiliateParam) {
    return url;
  }

  const separador = url.includes('?') ? '&' : '?';
  return `${url}${separador}${loja.affiliateParam}=${encodeURIComponent(loja.affiliateTag)}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    affiliateStores,
    demoSources,
    isAffiliateReady,
    buildAffiliateLink
  };
}

if (typeof window !== 'undefined') {
  window.affiliateStores = affiliateStores;
  window.demoSources = demoSources;
  window.isAffiliateReady = isAffiliateReady;
  window.buildAffiliateLink = buildAffiliateLink;
}

