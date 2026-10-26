const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const { affiliateStores, demoSources, isAffiliateReady, buildAffiliateLink } = require('./config');

const AMAZON_AFFILIATE = {
  affiliateTag: 'cupomemcadeia-20',
  affiliateParam: 'tag'
};

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

function normalizarCodigoCupom(valor) {
  if (valor === null || valor === undefined) return '';

  const texto = String(valor).trim();
  if (!texto) return '';

  const normalizado = texto.replace(/^\s*(?:cupom|coupon|code|codigo|código|voucher|promo(?:code|ção)?)\s*[:\-]?\s*/i, '').trim();
  const reduzido = normalizado.replace(/\s+/g, ' ');

  if (!reduzido) return '';
  if (/^(promoção|promocao|oferta|teste|demo|sample|mock|placeholder|exemplo|sem\s+cupom|sem\s+codigo|nao\s+tem\s+cupom|sem\s+promoção|sem\s+promocao)$/i.test(reduzido)) {
    return '';
  }

  return reduzido;
}

function extrairCupomValido(item = {}, loja = '') {
  const candidatos = [
    item?.couponCode,
    item?.coupon,
    item?.promotionCode,
    item?.promoCode,
    item?.discountCode,
    item?.voucher,
    item?.cupom,
    item?.codigo,
    item?.code,
    item?.offerCode,
    item?.dealCode,
    item?.promotion?.code,
    item?.promotion?.coupon,
    item?.promotion?.couponCode,
    item?.couponDetails?.code,
    item?.couponDetails?.coupon,
    item?.couponDetails?.couponCode,
    Array.isArray(item?.codes) ? item.codes.find(Boolean) : null,
    Array.isArray(item?.promotions) ? item.promotions.find((promocao) => promocao && (promocao.code || promocao.coupon || promocao.couponCode)) : null,
    item?.campaign?.code,
    item?.campaign?.coupon,
    item?.store?.coupon,
    item?.store?.couponCode,
    item?.loja?.coupon,
    item?.loja?.couponCode
  ];

  const codigoValido = candidatos
    .map((valor) => {
      if (valor && typeof valor === 'object') {
        return normalizarCodigoCupom(valor.code || valor.coupon || valor.couponCode || valor.value || valor.id || valor.nome || valor.label);
      }

      return normalizarCodigoCupom(valor);
    })
    .find((valor) => Boolean(valor) && valor.toUpperCase() !== 'PROMOCAO' && valor.toUpperCase() !== 'PROMOÇÃO' && valor.toUpperCase() !== 'OFERTA');

  return codigoValido || 'PROMOCAO';
}

function parseDataValidade(valor) {
  if (!valor) return null;

  if (typeof valor === 'number') {
    return new Date(valor);
  }

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function removerOfertasExpiradas(ofertas = []) {
  const lista = Array.isArray(ofertas) ? ofertas : [];

  return lista.filter((item) => {
    if (!item || item.active === false || item.ativo === false || item.expired === true || item.expirado === true || item.status === 'expired' || item.status === 'ended' || item.status === 'cancelled') {
      return false;
    }

    const dataValidade = parseDataValidade(
      item.validUntil || item.validity || item.expiresAt || item.expiration || item.endDate || item.dateEnd || item.validade || item.expiraEm
    );

    if (!dataValidade) {
      return true;
    }

    return dataValidade.getTime() > Date.now();
  });
}

function paginarLista(itens = [], paginaAtual = 1, tamanhoPagina = 80) {
  const lista = Array.isArray(itens) ? itens : [];
  const pagina = Math.max(1, Number(paginaAtual) || 1);
  const tamanho = Math.max(1, Number(tamanhoPagina) || 80);
  const limite = pagina * tamanho;
  const paginaItens = lista.slice(0, limite);

  return {
    itens: paginaItens,
    total: lista.length,
    pagina,
    tamanhoPagina: tamanho,
    temMais: limite < lista.length,
    totalPaginas: Math.max(1, Math.ceil(lista.length / tamanho))
  };
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

function normalizarTextoCategoria(valor = '') {
  return String(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferirCategoria(item = {}, loja = '', titulo = '') {
  const catalogo = [
    { nome: 'Eletrônicos', palavras: ['tv', 'televisao', 'smart tv', 'celular', 'smartphone', 'notebook', 'laptop', 'tablet', 'fone', 'headphone', 'earphone', 'monitor', 'console', 'videogame', 'camera', 'câmera', 'cadeira gamer', 'mouse', 'teclado', 'speaker', 'caixa de som', 'smartwatch', 'relogio inteligente', 'airpod', 'cabo', 'carregador', 'ssd', 'processador', 'gpu', 'placa de video', 'flash drive'] },
    { nome: 'Casa', palavras: ['mesa', 'cadeira', 'sofa', 'sofá', 'cama', 'armario', 'armário', 'utensilio', 'utensílios', 'tapete', 'luminaria', 'lampada', 'lampião', 'panela', 'vaso', 'decoracao', 'decoração', 'cortina', 'organizador', 'moveis', 'móveis', 'escrivaninha', 'jardim', 'cozinha'] },
    { nome: 'Moda', palavras: ['camisa', 'camiseta', 'vestido', 'calca', 'jeans', 'calça', 'short', 'bermuda', 'jaqueta', 'tenis', 'sapato', 'sneaker', 'mochila', 'bolsa', 'roupa', 'acessorio de moda', 'relogio', 'pulseira', 'oculos', 'óculos', 'boné', 'blusa'] },
    { nome: 'Acessórios', palavras: ['acessorio', 'acessórios', 'fone', 'carregador', 'case', 'capinha', 'suporte', 'adaptador', 'cabo', 'protetor', 'base', 'organizador', 'mini alto falante', 'pendrive'] },
    { nome: 'Esporte', palavras: ['bola', 'camiseta esportiva', 'tenis esportivo', 'bicicleta', 'bike', 'raquete', 'mala esportiva', 'mochila esportiva', 'academia', 'halter', 'elastico', 'elástico', 'short esportivo', 'regata', 'agasalho esportivo', 'proteção', 'capacete', 'patins', 'skate', 'futebol', 'caminhada', 'corrida'] },
    { nome: 'Outros', palavras: ['outros', 'geral', 'promo', 'oferta'] }
  ];

  const texto = `${titulo || item?.title || item?.name || ''} ${item?.category || item?.categoria || ''} ${item?.categories?.join(' ') || ''} ${loja || ''}`;
  const textoNormalizado = normalizarTextoCategoria(texto);

  for (const categoria of catalogo) {
    if (categoria.palavras.some((palavra) => textoNormalizado.includes(normalizarTextoCategoria(palavra)))) {
      return categoria.nome;
    }
  }

  return 'Outros';
}

function removerTagsHtml(valor = '') {
  return String(valor || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extrairPrecoAmazon(snippet = '') {
  const precoEmTexto = snippet.match(/<span class="a-price-whole">\s*([^<]+)\s*<\/span>/i)?.[1] || '';
  const centavos = snippet.match(/<span class="a-price-fraction">\s*([^<]+)\s*<\/span>/i)?.[1] || '00';
  const precoFormatado = `${precoEmTexto.replace(/[^\d,\.]/g, '').replace('.', ',')}${centavos ? `,${centavos.replace(/[^\d]/g, '')}` : ''}`;

  const numero = Number(precoFormatado.replace('.', '').replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numero)) {
    return 0;
  }

  return numero;
}

function extrairDadosAmazon(html = '') {
  if (!html) return [];

  const itens = [...html.matchAll(/data-asin="([^"]+)"/g)];
  const vistos = new Set();
  const ofertas = [];

  for (let index = 0; index < itens.length; index += 1) {
    const match = itens[index];
    const asin = match[1];
    if (!asin || vistos.has(asin)) continue;
    vistos.add(asin);

    const inicio = match.index || 0;
    const proximoInicio = itens[index + 1]?.index || html.length;
    const trecho = html.slice(inicio, proximoInicio);

    const linkMatch = trecho.match(/href="(https?:\/\/www\.amazon\.com\.br\/[^"#?]+(?:\?[^"#]+)?)"/i)
      || trecho.match(/href="((?:\/[^"#?]+)+(?:\?[^"#]+)?)"/i);
    const tituloMatch = trecho.match(/<h2[^>]*>\s*([\s\S]*?)<\/h2>/i)
      || trecho.match(/aria-label="([^"]+)"/i)
      || trecho.match(/title="([^"]+)"/i);
    const imagemMatch = trecho.match(/src="(https?:\/\/[^"\s]+\.(?:jpg|jpeg|png|webp|avif)[^"\s]*)"/i);

    const titulo = removerTagsHtml(tituloMatch?.[1] || 'Produto Amazon');
    const link = linkMatch
      ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.amazon.com.br${linkMatch[1]}`)
      : 'https://www.amazon.com.br/s?k=notebook+gamer';
    const precoAtual = extrairPrecoAmazon(trecho);

    if (!titulo || titulo.length < 3) continue;

    ofertas.push({
      id: asin,
      title: titulo,
      name: titulo,
      price: precoAtual,
      original_price: precoAtual,
      url: link,
      link: link,
      permalink: link,
      thumbnail: imagemMatch?.[1] || '',
      image: imagemMatch?.[1] || '',
      images: imagemMatch?.[1] ? [imagemMatch[1]] : [],
      category: 'Eletrônicos'
    });
  }

  return ofertas;
}

function normalizarOfertaMercadoLivre(item, loja = 'Mercado Livre', indice = 1) {
  const valorAtual = Number(item?.price ?? item?.price_amount ?? 0);
  const valorAntigo = Number(item?.original_price ?? item?.base_price ?? valorAtual);

  const precoAtual = valorAtual > 0 ? valorAtual : valorAntigo;
  const precoAntigo = valorAntigo > precoAtual ? valorAntigo : precoAtual;

  const percentualDesconto = precoAntigo > precoAtual
    ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
    : 0;

  const categoria = inferirCategoria(item, loja, item?.title || 'Oferta em destaque');
  const cupom = extrairCupomValido(item, loja);
  const expirado = Boolean(item?.expired || item?.expirado || item?.isExpired || item?.status === 'expired' || item?.status === 'ended');

  return {
    id: item?.id ?? `${loja}-${indice}`,
    titulo: item?.title || 'Oferta em destaque',
    precoAntigo: formatarMoeda(precoAntigo),
    precoAtual: formatarMoeda(precoAtual),
    desconto: percentualDesconto > 0 ? `-${percentualDesconto}%` : 'Oferta',
    cupom,
    loja,
    categoria,
    linkAfiliado: item?.permalink || item?.link || 'https://www.mercadolivre.com.br/',
    imagem: item?.thumbnail || '',
    ativo: !expirado,
    expirado
  };
}

function normalizarOfertaPublica(item, loja, indice) {
  const titulo = item?.title || item?.name || 'Oferta em destaque';
  const precoAtual = Number(item?.price ?? item?.salePrice ?? item?.discountedPrice ?? 0);
  const precoAntigo = Number(item?.original_price ?? item?.originalPrice ?? item?.price * 1.25 ?? precoAtual);

  const percentualDesconto = precoAntigo > precoAtual
    ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
    : 0;

  const categoriaPadrao = inferirCategoria(item, loja, titulo);
  const cupom = extrairCupomValido(item, loja);
  const expirado = Boolean(item?.expired || item?.expirado || item?.isExpired || item?.status === 'expired' || item?.status === 'ended');

  return {
    id: item?.id ?? `${loja}-${indice}`,
    titulo,
    precoAntigo: formatarMoeda(precoAntigo),
    precoAtual: formatarMoeda(precoAtual),
    desconto: percentualDesconto > 0 ? `-${percentualDesconto}%` : 'Oferta',
    cupom,
    loja,
    categoria: categoriaPadrao,
    linkAfiliado: item?.permalink || item?.url || `https://example.com/${encodeURIComponent(titulo)}`,
    imagem: item?.image || item?.thumbnail || item?.images?.[0] || '',
    ativo: !expirado,
    expirado
  };
}

async function buscarOfertasMercadoLivre(query, loja = 'Mercado Livre') {
  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=50`;

  const resposta = await axios.get(url, { timeout: 15000 });
  const itens = Array.isArray(resposta?.data?.results) ? resposta.data.results : [];

  return itens.map((item, index) => 
    normalizarOfertaMercadoLivre(item, loja, index + 1)
  );
}

function getFontesAtivas() {
  const lojasAtivas = affiliateStores.filter((loja) => loja.active && loja.publicUrl);

  if (lojasAtivas.length > 0) {
    return lojasAtivas.flatMap((loja) => {
      const queries = Array.isArray(loja.searchQueries) && loja.searchQueries.length > 0
        ? loja.searchQueries
        : [loja.name];

      return queries.map((query) => ({
        url: loja.publicUrl,
        loja: loja.name,
        affiliate: loja,
        query,
        normalizar: (item, indice) => {
          const ofertaPublica = normalizarOfertaPublica(item, loja.name, indice);
          return {
            ...ofertaPublica,
            linkAfiliado: buildAffiliateLink(ofertaPublica.linkAfiliado, loja) || ofertaPublica.linkAfiliado
          };
        }
      }));
    });
  }

  return demoSources.map((fonte) => ({
    url: fonte.url,
    loja: fonte.name,
    normalizar: (item, indice) => normalizarOfertaPublica(item, fonte.name, indice)
  }));
}

function extrairDadosResposta(resposta) {
  const dados = resposta?.data;

  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.products)) return dados.products;
  if (Array.isArray(dados?.results)) return dados.results;
  if (Array.isArray(dados?.items)) return dados.items;
  if (Array.isArray(dados?.offers)) return dados.offers;
  if (Array.isArray(dados?.data)) return dados.data;

  return [];
}

async function buscarOfertasDaInternet() {
  const fontes = getFontesAtivas();
  const ofertasColetadas = [];

  for (const fonte of fontes) {
    try {
      const resposta = await axios.get(fonte.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          Accept: 'application/json, text/html, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      let dados = extrairDadosResposta(resposta);

      if (!dados.length && fonte.loja === 'Amazon') {
        dados = extrairDadosAmazon(resposta.data || '');
      }

      if (!dados.length) continue;

      const ofertasNormalizadas = dados.map((item, index) => fonte.normalizar(item, index + 1));
      ofertasColetadas.push(...ofertasNormalizadas);
    } catch (error) {
      console.warn(`⚠️ [Robô] Fonte falhou: ${fonte.url} -> ${error.message}`);
    }
  }

  return ofertasColetadas;
}

function gerarOfertasFallback() {
  const ofertas = [
    {
      id: 'fallback-amazon-link-embutido',
      titulo: 'Produto em destaque com afiliado Amazon',
      loja: 'Amazon',
      categoria: 'Eletrônicos',
      precoAntigo: 'R$ 499,00',
      precoAtual: 'R$ 349,00',
      desconto: '-30%',
      cupom: 'PROMOCAO',
      linkAfiliado: 'https://link.amazon/B0fARIO14',
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-1',
      titulo: 'Notebook Gamer 15,6" com RTX',
      loja: 'Amazon',
      categoria: 'Eletrônicos',
      precoAntigo: 'R$ 4.999,00',
      precoAtual: 'R$ 3.299,00',
      desconto: '-34%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=notebook+gamer', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-2',
      titulo: 'Smart TV 55" 4K UHD',
      loja: 'Amazon',
      categoria: 'Eletrônicos',
      precoAntigo: 'R$ 3.899,00',
      precoAtual: 'R$ 2.799,00',
      desconto: '-28%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=smart+tv+55', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-3',
      titulo: 'Fone Bluetooth sem fio premium',
      loja: 'Amazon',
      categoria: 'Acessórios',
      precoAntigo: 'R$ 899,00',
      precoAtual: 'R$ 549,00',
      desconto: '-39%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=fone+bluetooth', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-4',
      titulo: 'Mesa de Escritório com Prateleiras',
      loja: 'Amazon',
      categoria: 'Casa',
      precoAntigo: 'R$ 1.399,00',
      precoAtual: 'R$ 999,00',
      desconto: '-29%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=mesa+de+escritorio', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-5',
      titulo: 'Camiseta Premium Masculina',
      loja: 'Amazon',
      categoria: 'Moda',
      precoAntigo: 'R$ 189,00',
      precoAtual: 'R$ 119,00',
      desconto: '-37%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=camiseta+masculina', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    },
    {
      id: 'fallback-amazon-6',
      titulo: 'Bicicleta Ergométrica para Academia',
      loja: 'Amazon',
      categoria: 'Esporte',
      precoAntigo: 'R$ 2.399,00',
      precoAtual: 'R$ 1.699,00',
      desconto: '-29%',
      cupom: 'PROMOCAO',
      linkAfiliado: buildAffiliateLink('https://www.amazon.com.br/s?k=bicicleta+ergometrica', AMAZON_AFFILIATE),
      imagem: '',
      ativo: true,
      expirado: false
    }
  ];

  return ofertas;
}

async function buscarOfertasAtualizadas() {
  console.log('🔄 [Robô] Buscando ofertas reais em fontes públicas...');

  try {
    const ofertasAtualizadas = await buscarOfertasDaInternet();
    const ofertasAtivas = removerOfertasExpiradas(ofertasAtualizadas);

    if (!ofertasAtivas.length) {
      const ofertasFallback = gerarOfertasFallback();
      const caminhoArquivo = path.join(__dirname, '../src/cupons.json');
      fs.writeFileSync(caminhoArquivo, JSON.stringify(ofertasFallback, null, 2), 'utf-8');
      console.log('✅ [Robô] Nenhuma oferta ativa foi encontrada nas fontes públicas. Usando ofertas de fallback do Amazon com o código de afiliado.');
      return ofertasFallback;
    }

    const caminhoArquivo = path.join(__dirname, '../src/cupons.json');
    fs.writeFileSync(caminhoArquivo, JSON.stringify(ofertasAtivas, null, 2), 'utf-8');

    console.log(`✅ [Robô] ${ofertasAtivas.length} ofertas ativas atualizadas e salvas em 'src/cupons.json'!`);
    return ofertasAtivas;
  } catch (error) {
    console.error('❌ [Robô] Erro ao buscar ofertas:', error.message);
    const ofertasFallback = gerarOfertasFallback();
    const caminhoArquivo = path.join(__dirname, '../src/cupons.json');
    fs.writeFileSync(caminhoArquivo, JSON.stringify(ofertasFallback, null, 2), 'utf-8');
    return ofertasFallback;
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
  normalizarCodigoCupom,
  extrairCupomValido,
  removerOfertasExpiradas,
  paginarLista,
  normalizarOfertaMercadoLivre,
  normalizarOfertaPublica,
  extrairDadosAmazon,
  gerarOfertasFallback,
  inferirCategoria,
  buscarOfertasMercadoLivre,
  buscarOfertasAtualizadas
};
