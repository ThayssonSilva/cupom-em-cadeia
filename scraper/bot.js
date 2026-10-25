const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const { affiliateStores, demoSources, isAffiliateReady, buildAffiliateLink } = require('./config');

function formatarMoeda(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numero).replace(/\u00A0/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function gerarCupom(loja = 'OFERTA', indice = 1) {
  const prefixos = {
    'Mercado Livre': 'ML',
    'Amazon': 'AMZ',
    'Shopee': 'SHOP'
  };

  const prefixo = prefixos[loja] || 'OFERTA';
  return `${prefixo}${String(indice).padStart(3, '0')}`;
}

function normalizarOfertaMercadoLivre(item, loja = 'Mercado Livre', indice = 1) {
  const valorAtual = Number(item?.price ?? item?.price_amount ?? 0);
  const valorAntigo = Number(item?.original_price ?? item?.base_price ?? valorAtual);

  const precoAtual = valorAtual > 0 ? valorAtual : valorAntigo;
  const precoAntigo = valorAntigo > precoAtual ? valorAntigo : precoAtual;

  const percentualDesconto = precoAntigo > precoAtual
    ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
    : 0;

  return {
    id: item?.id ?? `${loja}-${indice}`,
    titulo: item?.title || 'Oferta em destaque',
    precoAntigo: formatarMoeda(precoAntigo),
    precoAtual: formatarMoeda(precoAtual),
    desconto: percentualDesconto > 0 ? `-${percentualDesconto}%` : 'Oferta',
    cupom: gerarCupom(loja, indice),
    loja,
    linkAfiliado: item?.permalink || item?.link || 'https://www.mercadolivre.com.br/',
    imagem: item?.thumbnail || ''
  };
}

function normalizarOfertaPublica(item, loja, indice) {
  const titulo = item?.title || item?.name || 'Oferta em destaque';
  const precoAtual = Number(item?.price ?? item?.salePrice ?? item?.discountedPrice ?? 0);
  const precoAntigo = Number(item?.original_price ?? item?.originalPrice ?? item?.price * 1.25 ?? precoAtual);

  const percentualDesconto = precoAntigo > precoAtual
    ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
    : 0;

  return {
    id: item?.id ?? `${loja}-${indice}`,
    titulo,
    precoAntigo: formatarMoeda(precoAntigo),
    precoAtual: formatarMoeda(precoAtual),
    desconto: percentualDesconto > 0 ? `-${percentualDesconto}%` : 'Oferta',
    cupom: gerarCupom(loja, indice),
    loja,
    linkAfiliado: item?.permalink || item?.url || `https://example.com/${encodeURIComponent(titulo)}`,
    imagem: item?.image || item?.thumbnail || item?.images?.[0] || ''
  };
}

async function buscarOfertasMercadoLivre(query, loja = 'Mercado Livre') {
  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=3`;

  const resposta = await axios.get(url, { timeout: 15000 });
  const itens = Array.isArray(resposta?.data?.results) ? resposta.data.results : [];

  return itens.slice(0, 3).map((item, index) => 
    normalizarOfertaMercadoLivre(item, loja, index + 1)
  );
}

function getFontesAtivas() {
  const lojasAtivas = affiliateStores.filter((loja) => loja.active && loja.publicUrl);

  if (lojasAtivas.length > 0) {
    return lojasAtivas.map((loja) => ({
      url: loja.publicUrl,
      loja: loja.name,
      affiliate: loja,
      normalizar: (item, indice) => {
        const ofertaPublica = normalizarOfertaPublica(item, loja.name, indice);
        return {
          ...ofertaPublica,
          linkAfiliado: buildAffiliateLink(ofertaPublica.linkAfiliado, loja) || ofertaPublica.linkAfiliado
        };
      }
    }));
  }

  return demoSources.map((fonte) => ({
    url: fonte.url,
    loja: fonte.name,
    normalizar: (item, indice) => normalizarOfertaPublica(item, fonte.name, indice)
  }));
}

async function buscarOfertasDaInternet() {
  const fontes = getFontesAtivas();

  for (const fonte of fontes) {
    try {
      const resposta = await axios.get(fonte.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json'
        }
      });

      const dados = Array.isArray(resposta.data) ? resposta.data : Array.isArray(resposta.data?.products) ? resposta.data.products : [];
      if (!dados.length) continue;

      return dados.slice(0, 3).map((item, index) => fonte.normalizar(item, index + 1));
    } catch (error) {
      console.warn(`⚠️ [Robô] Fonte falhou: ${fonte.url} -> ${error.message}`);
    }
  }

  return [];
}

async function buscarOfertasAtualizadas() {
  console.log('🔄 [Robô] Buscando ofertas reais em fontes públicas...');

  try {
    const ofertasAtualizadas = await buscarOfertasDaInternet();

    if (!ofertasAtualizadas.length) {
      const fallback = [
        {
          id: 1,
          titulo: 'Notebook Gamer 15.6',
          precoAntigo: 'R$ 4.299,00',
          precoAtual: 'R$ 3.599,00',
          desconto: '-16%',
          cupom: 'FALLBACK16',
          loja: 'Loja Oficial',
          linkAfiliado: 'https://example.com/fallback-notebook'
        },
        {
          id: 2,
          titulo: 'Smart TV 50" 4K',
          precoAntigo: 'R$ 2.799,00',
          precoAtual: 'R$ 2.199,00',
          desconto: '-21%',
          cupom: 'FALLBACK21',
          loja: 'Loja Oficial',
          linkAfiliado: 'https://example.com/fallback-tv'
        }
      ];

      const caminhoArquivo = path.join(__dirname, '../src/cupons.json');
      fs.writeFileSync(caminhoArquivo, JSON.stringify(fallback, null, 2), 'utf-8');
      console.log('✅ [Robô] Usando fallback local porque as fontes públicas não responderam.');
      return fallback;
    }

    const caminhoArquivo = path.join(__dirname, '../src/cupons.json');
    fs.writeFileSync(caminhoArquivo, JSON.stringify(ofertasAtualizadas.slice(0, 9), null, 2), 'utf-8');

    console.log(`✅ [Robô] ${ofertasAtualizadas.length} ofertas atualizadas e salvas em 'src/cupons.json'!`);
    return ofertasAtualizadas.slice(0, 9);
  } catch (error) {
    console.error('❌ [Robô] Erro ao buscar ofertas:', error.message);
    return [];
  }
}

if (require.main === module) {
  buscarOfertasAtualizadas();

  cron.schedule('0 * * * *', () => {
    console.log('⏰ [Robô] Executando rotina agendada de 1 hora...');
    buscarOfertasAtualizadas();
  });
}

module.exports = {
  formatarMoeda,
  normalizarOfertaMercadoLivre,
  buscarOfertasMercadoLivre,
  buscarOfertasAtualizadas
};
