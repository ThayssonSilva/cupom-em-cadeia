const AMAZON_HOSTNAME_PATTERNS = [
  'amazon.com',
  'amazon.com.br',
  'amazon.com.mx',
  'amazon.com.ar',
  'amazon.com.au',
  'amazon.ca',
  'amazon.co.uk',
  'amazon.de',
  'amazon.es',
  'amazon.fr',
  'amazon.it',
  'amazon.in',
  'amazon.co.jp',
  'amazon.nl',
  'amazon.se',
  'amazon.pl',
  'amazon.sg',
  'amazon.sa',
  'amazon.eg',
  'amazon.ae',
  'amazon.tr',
  'amazon.com.tr',
  'amazon.cn'
];

function isAmazonUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();

    if (!hostname) {
      return false;
    }

    return hostname === 'amazon.com'
      || hostname.endsWith('.amazon.com')
      || AMAZON_HOSTNAME_PATTERNS.includes(hostname)
      || hostname.endsWith('.amazon.com.br')
      || hostname.endsWith('.amazon.co.uk')
      || hostname.endsWith('.amazon.de')
      || hostname.endsWith('.amazon.es')
      || hostname.endsWith('.amazon.fr')
      || hostname.endsWith('.amazon.it')
      || hostname.endsWith('.amazon.in')
      || hostname.endsWith('.amazon.co.jp')
      || hostname.endsWith('.amazon.nl')
      || hostname.endsWith('.amazon.se')
      || hostname.endsWith('.amazon.pl')
      || hostname.endsWith('.amazon.sg')
      || hostname.endsWith('.amazon.sa')
      || hostname.endsWith('.amazon.eg')
      || hostname.endsWith('.amazon.ae')
      || hostname.endsWith('.amazon.tr')
      || hostname.endsWith('.amazon.com.tr')
      || hostname.endsWith('.amazon.cn');
  } catch (error) {
    return false;
  }
}

function addAmazonAffiliateTag(productUrl, affiliateTag = 'cupomemcadeia-20', paramName = 'tag') {
  if (typeof productUrl !== 'string' || !productUrl.trim()) {
    throw new Error('URL do produto da Amazon é obrigatória.');
  }

  const sanitizedUrl = productUrl.trim();

  try {
    const url = new URL(sanitizedUrl);

    if (!isAmazonUrl(url.href)) {
      throw new Error('A URL informada não é um link válido da Amazon.');
    }

    url.searchParams.set(paramName, affiliateTag);
    return url.toString();
  } catch (error) {
    if (error instanceof TypeError || error instanceof URIError) {
      throw new Error('URL inválida: verifique se o link da Amazon está correto.');
    }

    throw error;
  }
}

module.exports = {
  isAmazonUrl,
  addAmazonAffiliateTag
};
