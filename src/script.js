let ofertasOriginais = [];
let lojaSelecionada = 'Todos';
let categoriaSelecionada = 'Todas';
let termoBusca = '';
let lojasDisponiveis = [];
let categoriasDisponiveis = [];
let idiomaAtual = 'pt-BR';
let paginaAtual = 1;
let paginaApiAtual = 1;
let totalPaginasApi = 1;
let carregandoMais = false;
let timerBusca = null;
let lojaMenuAberto = false;
let categoriaMenuAberto = false;
const ITENS_POR_PAGINA = 80;
const MAX_ITENS_RENDERIZADOS = 5000;

function resetarPaginacao() {
  paginaAtual = 1;
}

function obterOfertasVisiveis(ofertas) {
  if (!Array.isArray(ofertas)) {
    return [];
  }

  const limite = paginaAtual * ITENS_POR_PAGINA;
  return ofertas.slice(0, limite);
}

const traducoes = {
  'pt-BR': {
    subtitle: 'As melhores ofertas relâmpago e cupons atualizados em tempo real.',
    searchLabel: 'Buscar produto',
    searchPlaceholder: 'Digite o nome do produto...',
    searchAria: 'Buscar produto pelo nome',
    storeLabel: 'Loja',
    categoryLabel: 'Categoria',
    filterByStore: 'Filtrar por loja',
    filterByCategory: 'Filtrar por categoria',
    allStores: 'Todos',
    allCategories: 'Todas',
    loading: 'Carregando ofertas fresquinhas...',
    noResults: 'Nenhuma oferta encontrada para esse filtro ou busca.',
    errorLoading: 'Erro ao carregar ofertas. Certifique-se de que o robô gerou o arquivo de dados.',
    copy: 'Copiar',
    coupon: 'Cupom',
    resgatar: 'Resgatar Oferta',
    footer: 'Todos os direitos reservados.',
    whatsappText: '🔥 Não quer perder nenhuma oferta relâmpago?',
    whatsappButton: 'Entrar na Comunidade de Ofertas (Grátis)',
    languageLabel: 'Idioma'
  },
  'en-US': {
    subtitle: 'The best flash deals and coupons updated in real time.',
    searchLabel: 'Search product',
    searchPlaceholder: 'Type the product name...',
    searchAria: 'Search product by name',
    storeLabel: 'Store',
    categoryLabel: 'Category',
    filterByStore: 'Filter by store',
    filterByCategory: 'Filter by category',
    allStores: 'All',
    allCategories: 'All',
    loading: 'Loading fresh deals...',
    noResults: 'No offers found for this filter or search.',
    errorLoading: 'Error loading offers. Make sure the bot generated the data file.',
    copy: 'Copy',
    coupon: 'Coupon',
    resgatar: 'Redeem Offer',
    footer: 'All rights reserved.',
    whatsappText: '🔥 Don’t want to miss a flash deal?',
    whatsappButton: 'Join the Offer Community (Free)',
    languageLabel: 'Language'
  },
  'es-ES': {
    subtitle: 'Las mejores ofertas relámpago y cupones actualizados en tiempo real.',
    searchLabel: 'Buscar producto',
    searchPlaceholder: 'Escribe el nombre del producto...',
    searchAria: 'Buscar producto por nombre',
    storeLabel: 'Tienda',
    categoryLabel: 'Categoría',
    filterByStore: 'Filtrar por tienda',
    filterByCategory: 'Filtrar por categoría',
    allStores: 'Todos',
    allCategories: 'Todas',
    loading: 'Cargando ofertas frescas...',
    noResults: 'No se encontraron ofertas para este filtro o búsqueda.',
    errorLoading: 'Error al cargar ofertas. Asegúrate de que el robot haya generado el archivo.',
    copy: 'Copiar',
    coupon: 'Cupón',
    resgatar: 'Canjear oferta',
    footer: 'Todos los derechos reservados.',
    whatsappText: '🔥 ¿No quieres perder ninguna oferta relámpago?',
    whatsappButton: 'Unirse a la comunidad de ofertas (gratis)',
    languageLabel: 'Idioma'
  },
  'fr-FR': {
    subtitle: 'Les meilleures offres flash et bons de réduction en temps réel.',
    searchLabel: 'Rechercher un produit',
    searchPlaceholder: 'Saisissez le nom du produit...',
    searchAria: 'Rechercher un produit par nom',
    storeLabel: 'Magasin',
    categoryLabel: 'Catégorie',
    filterByStore: 'Filtrer par magasin',
    filterByCategory: 'Filtrer par catégorie',
    allStores: 'Tous',
    allCategories: 'Toutes',
    loading: 'Chargement des offres...',
    noResults: 'Aucune offre trouvée pour ce filtre ou cette recherche.',
    errorLoading: 'Erreur de chargement des offres. Vérifiez que le bot a généré le fichier.',
    copy: 'Copier',
    coupon: 'Coupon',
    resgatar: 'Réclamer l’offre',
    footer: 'Tous droits réservés.',
    whatsappText: '🔥 Vous ne voulez pas manquer une offre flash ?',
    whatsappButton: 'Rejoindre la communauté des offres (gratuit)',
    languageLabel: 'Langue'
  },
  'de-DE': {
    subtitle: 'Die besten Flash-Deals und Gutscheine in Echtzeit.',
    searchLabel: 'Produkt suchen',
    searchPlaceholder: 'Produktnamen eingeben...',
    searchAria: 'Produkt nach Namen suchen',
    storeLabel: 'Shop',
    categoryLabel: 'Kategorie',
    filterByStore: 'Nach Shop filtern',
    filterByCategory: 'Nach Kategorie filtern',
    allStores: 'Alle',
    allCategories: 'Alle',
    loading: 'Angebote werden geladen...',
    noResults: 'Für diesen Filter oder Suchbegriff wurden keine Angebote gefunden.',
    errorLoading: 'Fehler beim Laden der Angebote. Stellen Sie sicher, dass der Bot die Datei erstellt hat.',
    copy: 'Kopieren',
    coupon: 'Gutschein',
    resgatar: 'Angebot einlösen',
    footer: 'Alle Rechte vorbehalten.',
    whatsappText: '🔥 Verpassen Sie kein Flash-Angebot?',
    whatsappButton: 'Community beitreten (kostenlos)',
    languageLabel: 'Sprache'
  },
  'it-IT': {
    subtitle: 'Le migliori offerte flash e coupon aggiornati in tempo reale.',
    searchLabel: 'Cerca prodotto',
    searchPlaceholder: 'Digita il nome del prodotto...',
    searchAria: 'Cerca prodotto per nome',
    storeLabel: 'Negozio',
    categoryLabel: 'Categoria',
    filterByStore: 'Filtra per negozio',
    filterByCategory: 'Filtra per categoria',
    allStores: 'Tutti',
    allCategories: 'Tutte',
    loading: 'Caricamento offerte...',
    noResults: 'Nessuna offerta trovata per questo filtro o ricerca.',
    errorLoading: 'Errore nel caricamento delle offerte. Assicurati che il bot abbia generato il file.',
    copy: 'Copia',
    coupon: 'Coupon',
    resgatar: 'Riscatta offerta',
    footer: 'Tutti i diritti riservati.',
    whatsappText: '🔥 Non vuoi perdere nessuna offerta flash?',
    whatsappButton: 'Entra nella community delle offerte (gratis)',
    languageLabel: 'Lingua'
  },
  'ar-SA': {
    subtitle: 'أفضل العروض السريعة والقسائم المحدثة في الوقت الفعلي.',
    searchLabel: 'البحث عن منتج',
    searchPlaceholder: 'اكتب اسم المنتج...',
    searchAria: 'البحث عن المنتج بالاسم',
    storeLabel: 'المتجر',
    categoryLabel: 'الفئة',
    filterByStore: 'تصفية حسب المتجر',
    filterByCategory: 'تصفية حسب الفئة',
    allStores: 'الكل',
    allCategories: 'الكل',
    loading: 'جارٍ تحميل العروض...',
    noResults: 'لم يتم العثور على أي عروض لهذا الفلتر أو البحث.',
    errorLoading: 'خطأ في تحميل العروض. تأكد من أن الروبوت أنشأ الملف.',
    copy: 'نسخ',
    coupon: 'قسيمة',
    resgatar: 'استرداد العرض',
    footer: 'جميع الحقوق محفوظة.',
    whatsappText: '🔥 لا تريد أن تفوت أي عرض سريع؟',
    whatsappButton: 'انضم إلى مجتمع العروض (مجاني)',
    languageLabel: 'اللغة'
  },
  'ja-JP': {
    subtitle: 'リアルタイムで更新される最新のフラッシュセールとクーポン。',
    searchLabel: '商品を検索',
    searchPlaceholder: '商品名を入力...',
    searchAria: '商品名で検索',
    storeLabel: 'ストア',
    categoryLabel: 'カテゴリ',
    filterByStore: 'ストアで絞り込み',
    filterByCategory: 'カテゴリで絞り込み',
    allStores: 'すべて',
    allCategories: 'すべて',
    loading: 'オファーを読み込み中...',
    noResults: 'このフィルターまたは検索に一致するオファーはありません。',
    errorLoading: 'オファーの読み込みに失敗しました。ボットがデータファイルを生成したことを確認してください。',
    copy: 'コピー',
    coupon: 'クーポン',
    resgatar: 'オファーを利用',
    footer: 'All rights reserved.',
    whatsappText: '🔥 フラッシュセールを見逃したくないですか？',
    whatsappButton: 'オファーコミュニティに参加（無料）',
    languageLabel: '言語'
  },
  'ko-KR': {
    subtitle: '실시간으로 업데이트되는 최고의 플래시 딜과 쿠폰입니다.',
    searchLabel: '상품 검색',
    searchPlaceholder: '상품명을 입력하세요...',
    searchAria: '상품명을 기준으로 검색',
    storeLabel: '스토어',
    categoryLabel: '카테고리',
    filterByStore: '스토어로 필터링',
    filterByCategory: '카테고리로 필터링',
    allStores: '전체',
    allCategories: '전체',
    loading: '할인 정보를 불러오는 중...',
    noResults: '이 필터 또는 검색에 해당하는 상품이 없습니다.',
    errorLoading: '상품을 불러오지 못했습니다. 봇이 데이터 파일을 생성했는지 확인하세요.',
    copy: '복사',
    coupon: '쿠폰',
    resgatar: '할인 받기',
    footer: '모든 권리 보유.',
    whatsappText: '🔥 플래시 딜 놓치고 싶지 않으세요?',
    whatsappButton: '오퍼 커뮤니티 참여 (무료)',
    languageLabel: '언어'
  }
};

function obterTexto(chave) {
  return traducoes[idiomaAtual]?.[chave] || traducoes['pt-BR'][chave] || chave;
}

function traduzirCategoria(categoria) {
  if (!categoria) return categoria;

  const categoriasPorIdioma = {
    'pt-BR': {
      'Eletrônicos': 'Eletrônicos',
      'Casa': 'Casa',
      'Moda': 'Moda',
      'Acessórios': 'Acessórios',
      'Esporte': 'Esporte',
      'Outros': 'Outros'
    },
    'en-US': {
      'Eletrônicos': 'Electronics',
      'Casa': 'Home',
      'Moda': 'Fashion',
      'Acessórios': 'Accessories',
      'Esporte': 'Sports',
      'Outros': 'Other'
    },
    'es-ES': {
      'Eletrônicos': 'Electrónicos',
      'Casa': 'Hogar',
      'Moda': 'Moda',
      'Acessórios': 'Accesorios',
      'Esporte': 'Deportes',
      'Outros': 'Otros'
    },
    'fr-FR': {
      'Eletrônicos': 'Électronique',
      'Casa': 'Maison',
      'Moda': 'Mode',
      'Acessórios': 'Accessoires',
      'Esporte': 'Sport',
      'Outros': 'Autres'
    },
    'de-DE': {
      'Eletrônicos': 'Elektronik',
      'Casa': 'Heim',
      'Moda': 'Mode',
      'Acessórios': 'Zubehör',
      'Esporte': 'Sport',
      'Outros': 'Sonstiges'
    },
    'it-IT': {
      'Eletrônicos': 'Elettronica',
      'Casa': 'Casa',
      'Moda': 'Moda',
      'Acessórios': 'Accessori',
      'Esporte': 'Sport',
      'Outros': 'Altro'
    },
    'ar-SA': {
      'Eletrônicos': 'الإلكترونيات',
      'Casa': 'المنزل',
      'Moda': 'الموضة',
      'Acessórios': 'الإكسسوارات',
      'Esporte': 'الرياضة',
      'Outros': 'أخرى'
    },
    'ja-JP': {
      'Eletrônicos': '電子機器',
      'Casa': 'ホーム',
      'Moda': 'ファッション',
      'Acessórios': 'アクセサリー',
      'Esporte': 'スポーツ',
      'Outros': 'その他'
    },
    'ko-KR': {
      'Eletrônicos': '전자제품',
      'Casa': '홈',
      'Moda': '패션',
      'Acessórios': '액세서리',
      'Esporte': '스포츠',
      'Outros': '기타'
    }
  };

  return categoriasPorIdioma[idiomaAtual]?.[categoria] || categoria;
}

function aplicarIdioma() {
  const inputBusca = document.getElementById('input-busca');
  const labelBusca = document.querySelector('.campo-busca label');
  const lojaTitulo = document.querySelectorAll('.filtro-titulo')[0];
  const categoriaTitulo = document.querySelectorAll('.filtro-titulo')[1];
  const footerTexto = document.querySelector('footer p');
  const subtitle = document.getElementById('header-subtitle');
  const langLabel = document.querySelector('.lang-label');
  const whatsappText = document.querySelector('#whatsapp-mensagem p');
  const whatsappButton = document.querySelector('.btn-whatsapp');
  const filtroLoja = document.getElementById('filtro-lojas');
  const filtroCategoria = document.getElementById('filtro-categorias');

  document.documentElement.lang = idiomaAtual;

  if (subtitle) subtitle.textContent = obterTexto('subtitle');
  if (labelBusca) labelBusca.textContent = obterTexto('searchLabel');
  if (inputBusca) {
    inputBusca.placeholder = obterTexto('searchPlaceholder');
    inputBusca.setAttribute('aria-label', obterTexto('searchAria'));
  }
  if (lojaTitulo) lojaTitulo.textContent = obterTexto('storeLabel');
  if (categoriaTitulo) categoriaTitulo.textContent = obterTexto('categoryLabel');
  if (filtroLoja) filtroLoja.setAttribute('aria-label', obterTexto('filterByStore'));
  if (filtroCategoria) filtroCategoria.setAttribute('aria-label', obterTexto('filterByCategory'));
  if (footerTexto) footerTexto.innerHTML = `&copy; 2026 Cupom em Cadeia. ${obterTexto('footer')}`;
  if (langLabel) langLabel.textContent = obterTexto('languageLabel');
  if (whatsappText) whatsappText.textContent = obterTexto('whatsappText');
  if (whatsappButton) whatsappButton.textContent = obterTexto('whatsappButton');

  renderizarBotoesLoja(lojasDisponiveis);
  renderizarBotoesCategoria();
  renderizarOfertas();
}

function obterLojasConfiguradas() {
  const lojasJaDefinidas = Array.isArray(window.affiliateStores)
    ? window.affiliateStores.map((loja) => loja.name).filter(Boolean)
    : [];

  return lojasJaDefinidas;
}

function obterCategoriasLoja(loja) {
  if (!loja || !window.storeCategories) return [];
  return Array.isArray(window.storeCategories[loja]) ? window.storeCategories[loja] : [];
}

function obterCategoriasOferta(item = {}) {
  const categorias = [];

  if (Array.isArray(item.categorias)) {
    item.categorias.forEach((categoria) => {
      if (categoria) categorias.push(categoria);
    });
  }

  if (item.categoria) {
    categorias.push(item.categoria);
  }

  if (typeof item.categoria === 'string' && item.categoria.includes('/')) {
    categorias.push(...item.categoria.split('/').map((valor) => valor.trim()).filter(Boolean));
  }

  if (!categorias.length && item.loja) {
    categorias.push(...obterCategoriasLoja(item.loja));
  }

  return [...new Set(categorias.filter(Boolean))];
}

function normalizarTexto(valor = '') {
  return String(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function filtrarOfertas() {
  const busca = normalizarTexto(termoBusca);

  return ofertasOriginais.filter((item) => {
    const categoriasOferta = obterCategoriasOferta(item);
    const matchLoja = lojaSelecionada === 'Todos' || normalizarTexto(item.loja) === normalizarTexto(lojaSelecionada);
    const matchCategoria = categoriaSelecionada === 'Todas'
      || categoriasOferta.some((categoria) => normalizarTexto(categoria) === normalizarTexto(categoriaSelecionada));
    const textoProduto = `${item.titulo || ''} ${item.loja || ''} ${categoriasOferta.join(' ')}`;
    const matchBusca = !busca || normalizarTexto(textoProduto).includes(busca);

    return matchLoja && matchCategoria && matchBusca;
  });
}

function renderizarBotoesLoja(lojas) {
  const container = document.getElementById('filtro-lojas');

  if (!container) return;

  const lojasBase = Array.isArray(lojas) ? lojas : obterLojasConfiguradas();
  const lojasUnicas = ['Todos', ...new Set([...obterLojasConfiguradas(), ...lojasBase.filter(Boolean)])];
  const lojaAtual = lojaSelecionada === 'Todos' ? obterTexto('allStores') : lojaSelecionada;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'filtro-loja-dropdown';

  const botaoPrincipal = document.createElement('button');
  botaoPrincipal.type = 'button';
  botaoPrincipal.className = 'filtro-btn filtro-loja-ativa';
  botaoPrincipal.textContent = lojaAtual;
  botaoPrincipal.setAttribute('aria-label', `${obterTexto('storeLabel')}: ${lojaAtual}`);
  botaoPrincipal.addEventListener('click', () => {
    lojaMenuAberto = !lojaMenuAberto;
    renderizarBotoesLoja(lojasDisponiveis);
  });

  const botaoToggle = document.createElement('button');
  botaoToggle.type = 'button';
  botaoToggle.className = 'filtro-btn filtro-loja-toggle';
  botaoToggle.textContent = lojaMenuAberto ? '▴' : '▾';
  botaoToggle.setAttribute('aria-label', lojaMenuAberto ? 'Fechar opções de loja' : 'Abrir opções de loja');
  botaoToggle.setAttribute('aria-expanded', String(lojaMenuAberto));
  botaoToggle.addEventListener('click', () => {
    lojaMenuAberto = !lojaMenuAberto;
    renderizarBotoesLoja(lojasDisponiveis);
  });

  wrapper.appendChild(botaoPrincipal);
  wrapper.appendChild(botaoToggle);
  container.appendChild(wrapper);

  const menu = document.createElement('div');
  menu.className = `filtro-lojas-menu ${lojaMenuAberto ? 'open' : ''}`;

  lojasUnicas.forEach((loja) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `filtro-btn ${lojaSelecionada === loja ? 'active' : ''}`;
    botao.dataset.loja = loja;
    botao.textContent = loja === 'Todos' ? obterTexto('allStores') : loja;
    botao.addEventListener('click', () => {
      lojaSelecionada = loja;
      categoriaSelecionada = 'Todas';
      lojaMenuAberto = false;
      resetarPaginacao();
      renderizarBotoesLoja(lojasDisponiveis);
      renderizarBotoesCategoria();
      renderizarOfertas();
    });

    menu.appendChild(botao);
  });

  container.appendChild(menu);
}

function renderizarBotoesCategoria() {
  const container = document.getElementById('filtro-categorias');

  if (!container) return;

  const ofertasDaLoja = lojaSelecionada === 'Todos'
    ? ofertasOriginais
    : ofertasOriginais.filter((item) => normalizarTexto(item.loja) === normalizarTexto(lojaSelecionada));

  const categoriasBase = ofertasDaLoja.reduce((acumulador, item) => {
    const categorias = obterCategoriasOferta(item);
    categorias.forEach((categoria) => acumulador.add(categoria));
    return acumulador;
  }, new Set());

  const categoriasPadrao = lojaSelecionada === 'Todos'
    ? Object.values(window.storeCategories || {}).flat()
    : obterCategoriasLoja(lojaSelecionada);

  categoriasPadrao.forEach((categoria) => categoriasBase.add(categoria));

  categoriasDisponiveis = ['Todas', ...[...categoriasBase].sort((a, b) => a.localeCompare(b))];

  if (categoriaSelecionada !== 'Todas' && !categoriasDisponiveis.includes(categoriaSelecionada)) {
    categoriaSelecionada = 'Todas';
  }

  const categoriaAtual = categoriaSelecionada === 'Todas' ? obterTexto('allCategories') : traduzirCategoria(categoriaSelecionada);

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'filtro-categoria-dropdown';

  const botaoPrincipal = document.createElement('button');
  botaoPrincipal.type = 'button';
  botaoPrincipal.className = 'filtro-btn filtro-categoria-ativa';
  botaoPrincipal.textContent = categoriaAtual;
  botaoPrincipal.setAttribute('aria-label', `${obterTexto('categoryLabel')}: ${categoriaAtual}`);
  botaoPrincipal.addEventListener('click', () => {
    categoriaMenuAberto = !categoriaMenuAberto;
    renderizarBotoesCategoria();
  });

  const botaoToggle = document.createElement('button');
  botaoToggle.type = 'button';
  botaoToggle.className = 'filtro-btn filtro-categoria-toggle';
  botaoToggle.textContent = categoriaMenuAberto ? '▴' : '▾';
  botaoToggle.setAttribute('aria-label', categoriaMenuAberto ? 'Fechar opções de categoria' : 'Abrir opções de categoria');
  botaoToggle.setAttribute('aria-expanded', String(categoriaMenuAberto));
  botaoToggle.addEventListener('click', () => {
    categoriaMenuAberto = !categoriaMenuAberto;
    renderizarBotoesCategoria();
  });

  wrapper.appendChild(botaoPrincipal);
  wrapper.appendChild(botaoToggle);
  container.appendChild(wrapper);

  const menu = document.createElement('div');
  menu.className = `filtro-categorias-menu ${categoriaMenuAberto ? 'open' : ''}`;

  categoriasDisponiveis.forEach((categoria) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `filtro-btn ${categoriaSelecionada === categoria ? 'active' : ''}`;
    botao.dataset.categoria = categoria;
    botao.textContent = categoria === 'Todas' ? obterTexto('allCategories') : traduzirCategoria(categoria);
    botao.addEventListener('click', () => {
      categoriaSelecionada = categoria;
      categoriaMenuAberto = false;
      resetarPaginacao();
      renderizarBotoesCategoria();
      renderizarOfertas();
    });

    menu.appendChild(botao);
  });

  container.appendChild(menu);
}

function renderizarOfertas() {
  const containerGrid = document.getElementById('grid-produtos');

  if (!containerGrid) return;

  const ofertasAtivas = filtrarOfertas().filter((item) => item.ativo !== false && item.expirado !== true);
  const ofertasFiltradas = ofertasAtivas;
  const ofertasVisiveis = obterOfertasVisiveis(ofertasFiltradas);
  const temMais = (paginaApiAtual < totalPaginasApi) || (ofertasFiltradas.length > ofertasVisiveis.length);
  const fragmento = document.createDocumentFragment();

  containerGrid.innerHTML = '';

  if (!ofertasFiltradas.length) {
    containerGrid.innerHTML = `<p class="carregando">${obterTexto('noResults')}</p>`;
    return;
  }

  ofertasVisiveis.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card-produto';

    const imagem = item.imagem
      ? `<img class="produto-imagem" src="${item.imagem}" alt="${item.titulo || 'Oferta'}" loading="lazy" />`
      : '<div class="produto-sem-imagem">Oferta</div>';

    const possuiCupomReal = Boolean(item.cupom) && item.cupom !== 'PROMOCAO';
    const textoCupom = possuiCupomReal
      ? `${obterTexto('coupon')}: <strong>${item.cupom}</strong>`
      : '<strong>Não possui cupom de desconto</strong>';
    const botaoCupom = possuiCupomReal
      ? `<button type="button" class="copiar-cupom" data-cupom="${item.cupom}">${obterTexto('copy')}</button>`
      : '';

    card.innerHTML = `
      <div class="produto-imagem-wrap">
        ${imagem}
      </div>

      <div>
        <span class="loja-badge">${item.loja}</span>
        <h3>${item.titulo}</h3>
      </div>

      <div class="precos">
        <span class="preco-antigo">${item.precoAntigo}</span>
        <div class="preco-linha">
          <span class="preco-atual">${item.precoAtual}</span>
          <span class="desconto-badge">${item.desconto}</span>
        </div>
      </div>

      <div class="cupom-box">
        <span>${textoCupom}</span>
        ${botaoCupom}
      </div>

      <a href="${item.linkAfiliado}" target="_blank" rel="noopener noreferrer" class="btn-resgatar">${obterTexto('resgatar')}</a>
    `;

    const botaoCopiar = card.querySelector('.copiar-cupom');
    if (botaoCopiar) {
      botaoCopiar.addEventListener('click', () => copiarCupom(item.cupom));
    }

    fragmento.appendChild(card);
  });

  containerGrid.appendChild(fragmento);

  if (temMais) {
    const botaoCarregarMais = document.createElement('button');
    botaoCarregarMais.type = 'button';
    botaoCarregarMais.className = 'carregar-mais';
    botaoCarregarMais.disabled = carregandoMais;
    botaoCarregarMais.textContent = carregandoMais
      ? 'Carregando...'
      : `Carregar mais (${Math.min(ofertasVisiveis.length, ofertasFiltradas.length)} de ${ofertasFiltradas.length})`;
    botaoCarregarMais.addEventListener('click', async () => {
      if (carregandoMais || paginaApiAtual >= totalPaginasApi) return;

      carregandoMais = true;
      botaoCarregarMais.disabled = true;
      botaoCarregarMais.textContent = 'Carregando...';

      try {
        await carregarOfertas(paginaApiAtual + 1, false);
      } finally {
        carregandoMais = false;
      }
    });
    containerGrid.appendChild(botaoCarregarMais);
  }

  if (ofertasFiltradas.length > MAX_ITENS_RENDERIZADOS) {
    const mensagemLimite = document.createElement('p');
    mensagemLimite.className = 'carregando limite';
    mensagemLimite.textContent = `Mostrando em lotes de ${ITENS_POR_PAGINA}. Filtros ajudam a manter a navegação rápida.`;
    containerGrid.appendChild(mensagemLimite);
  }
}

async function carregarOfertas(pagina = 1, substituir = true) {
  const containerGrid = document.getElementById('grid-produtos');

  if (!containerGrid) return;

  const endpoints = [`/api/ofertas?page=${pagina}&limit=${ITENS_POR_PAGINA}`, './src/cupons.json', 'src/cupons.json'];

  if (!substituir && paginaApiAtual >= totalPaginasApi) {
    return;
  }

  try {
    let resposta;
    let ultimoErro = null;

    for (const endpoint of endpoints) {
      try {
        resposta = await fetch(endpoint);

        if (resposta.ok) {
          break;
        }

        ultimoErro = new Error(`Endpoint ${endpoint} retornou ${resposta.status}`);
      } catch (error) {
        ultimoErro = error;
      }
    }

    if (!resposta || !resposta.ok) {
      throw ultimoErro || new Error('Arquivo de ofertas não encontrado.');
    }

    const payload = await resposta.json();
    const dados = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.items)
        ? payload.items
        : [];

    const total = Number(payload.total || dados.length || 0);
    const proximaPagina = Number(payload.page || pagina || 1);
    const paginasTotais = Number(payload.totalPages || Math.max(1, Math.ceil(total / ITENS_POR_PAGINA)) || 1);

    if (substituir) {
      ofertasOriginais = dados;
      paginaApiAtual = proximaPagina;
      totalPaginasApi = paginasTotais;
    } else {
      ofertasOriginais = [...ofertasOriginais, ...dados];
      paginaApiAtual = proximaPagina;
      totalPaginasApi = paginasTotais;
    }

    lojasDisponiveis = [...new Set([...obterLojasConfiguradas(), ...ofertasOriginais.map((item) => item.loja).filter(Boolean)])];
    renderizarBotoesLoja(lojasDisponiveis);
    renderizarBotoesCategoria();
    renderizarOfertas();
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    containerGrid.innerHTML = `<p class="carregando">${obterTexto('errorLoading')}</p>`;
  }
}

function copiarCupom(codigo) {
  navigator.clipboard.writeText(codigo)
    .then(() => {
      alert(`Cupom "${codigo}" copiado com sucesso!`);
    })
    .catch((error) => {
      console.error('Erro ao copiar cupom:', error);
    });
}

function inicializarFiltros() {
  const inputBusca = document.getElementById('input-busca');

  if (!inputBusca) return;

  inputBusca.addEventListener('input', (event) => {
    termoBusca = event.target.value.trim();
    resetarPaginacao();

    if (timerBusca) {
      clearTimeout(timerBusca);
    }

    timerBusca = setTimeout(() => {
      renderizarOfertas();
    }, 120);
  });
}

function inicializarIdioma() {
  const selectIdioma = document.getElementById('language-select');

  if (!selectIdioma) return;

  selectIdioma.addEventListener('change', (event) => {
    idiomaAtual = event.target.value;
    aplicarIdioma();
  });
}

function inicializarWhatsApp() {
  const botao = document.querySelector('.whatsapp-toggle');
  const mensagem = document.querySelector('.whatsapp-mensagem');

  if (!botao || !mensagem) return;

  botao.addEventListener('click', () => {
    const aberto = mensagem.classList.toggle('open');
    botao.setAttribute('aria-expanded', String(aberto));

    if (aberto) {
      setTimeout(() => {
        mensagem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarFiltros();
  inicializarWhatsApp();
  inicializarIdioma();
  aplicarIdioma();
  carregarOfertas();
});
