const affiliateStores = [
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    active: true,
    affiliateTag: 'SEU_ID_MERCADO_LIVRE', // Coloque sua tag/id de afiliado aqui quando tiver
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'celular', 'smart tv'],
    publicUrl: 'https://api.mercadolibre.com/sites/MLB/search?q=notebook+gamer&limit=3'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    active: true,
    affiliateTag: 'SEU_ID_AMAZON-20', // Exemplo: seuID-20
    affiliateParam: 'tag',
    searchQueries: ['notebook gamer', 'smart tv', 'fone bluetooth'],
    publicUrl: 'https://www.amazon.com.br/s?k=notebook+gamer'
  },
  {
    id: 'shopee',
    name: 'Shopee',
    active: true,
    affiliateTag: 'SEU_ID_SHOPEE',
    affiliateParam: 'aff_siteid',
    searchQueries: ['notebook gamer', 'smart tv', 'achadinhos'],
    publicUrl: 'https://shopee.com.br/search?keyword=notebook%20gamer'
  },
  {
    id: 'magazineluiza',
    name: 'Magazine Luiza',
    active: true,
    affiliateTag: 'SEU_ID_MAGALU',
    affiliateParam: 'partner_id',
    searchQueries: ['smartphone', 'smart tv', 'eletroportateis'],
    publicUrl: 'https://www.magazineluiza.com.br/'
  },
  {
    id: 'casasbahia',
    name: 'Casas Bahia',
    active: true,
    affiliateTag: 'SEU_ID_CASASBAHIA',
    affiliateParam: 'utm_source',
    searchQueries: ['celular', 'notebook', 'moveis'],
    publicUrl: 'https://www.casasbahia.com.br/'
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    active: true,
    affiliateTag: 'SEU_ID_ALIEXPRESS',
    affiliateParam: 'aff_fcid',
    searchQueries: ['gadgets', 'eletronicos', 'achadinhos'],
    publicUrl: 'https://pt.aliexpress.com/'
  }
];

