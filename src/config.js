const affiliateStores = [
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    active: true,
    affiliateTag: 'SEU_ID_MERCADO_LIVRE',
    affiliateParam: 'tag',
    publicUrl: 'https://api.mercadolibre.com/sites/MLB/search?q=notebook+gamer&limit=3',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    active: true,
    affiliateTag: 'SEU_ID_AMAZON-20',
    affiliateParam: 'tag',
    publicUrl: 'https://www.amazon.com.br/s?k=notebook+gamer',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'shopee',
    name: 'Shopee',
    active: true,
    affiliateTag: 'SEU_ID_SHOPEE',
    affiliateParam: 'aff_siteid',
    publicUrl: 'https://shopee.com.br/search?keyword=notebook%20gamer',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'magazineluiza',
    name: 'Magazine Luiza',
    active: true,
    affiliateTag: 'SEU_ID_MAGALU',
    affiliateParam: 'partner_id',
    publicUrl: 'https://www.magazineluiza.com.br/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'casasbahia',
    name: 'Casas Bahia',
    active: true,
    affiliateTag: 'SEU_ID_CASASBAHIA',
    affiliateParam: 'utm_source',
    publicUrl: 'https://www.casasbahia.com.br/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    active: true,
    affiliateTag: 'SEU_ID_ALIEXPRESS',
    affiliateParam: 'aff_fcid',
    publicUrl: 'https://pt.aliexpress.com/',
    categories: ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
  }
];

const storeCategories = {
  'Mercado Livre': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros'],
  'Amazon': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros'],
  'Shopee': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros'],
  'Magazine Luiza': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros'],
  'Casas Bahia': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros'],
  'AliExpress': ['Eletrônicos', 'Casa', 'Moda', 'Acessórios', 'Esporte', 'Outros']
};

window.affiliateStores = affiliateStores;
window.storeCategories = storeCategories;
