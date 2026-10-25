let ofertasOriginais = [];
let lojaSelecionada = 'Todos';
let termoBusca = '';
let lojasDisponiveis = [];

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
    const matchLoja = lojaSelecionada === 'Todos' || normalizarTexto(item.loja) === normalizarTexto(lojaSelecionada);
    const textoProduto = `${item.titulo || ''} ${item.loja || ''}`;
    const matchBusca = !busca || normalizarTexto(textoProduto).includes(busca);

    return matchLoja && matchBusca;
  });
}

function renderizarBotoesLoja(lojas) {
  const container = document.getElementById('filtro-lojas');

  if (!container) return;

  const lojasUnicas = ['Todos', ...new Set(lojas.filter(Boolean))];
  container.innerHTML = '';

  lojasUnicas.forEach((loja) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `filtro-btn ${lojaSelecionada === loja ? 'active' : ''}`;
    botao.dataset.loja = loja;
    botao.textContent = loja;
    botao.addEventListener('click', () => {
      lojaSelecionada = loja;
      renderizarBotoesLoja(lojasDisponiveis);
      renderizarOfertas();
    });

    container.appendChild(botao);
  });
}

function renderizarOfertas() {
  const containerGrid = document.getElementById('grid-produtos');

  if (!containerGrid) return;

  const ofertasFiltradas = filtrarOfertas();
  containerGrid.innerHTML = '';

  if (!ofertasFiltradas.length) {
    containerGrid.innerHTML = '<p class="carregando">Nenhuma oferta encontrada para esse filtro ou busca.</p>';
    return;
  }

  ofertasFiltradas.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card-produto';

    card.innerHTML = `
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
        <span>Cupom: <strong>${item.cupom}</strong></span>
        <button type="button" class="copiar-cupom" data-cupom="${item.cupom}">Copiar</button>
      </div>

      <a href="${item.linkAfiliado}" target="_blank" rel="noopener noreferrer" class="btn-resgatar">Resgatar Oferta</a>
    `;

    const botaoCopiar = card.querySelector('.copiar-cupom');
    botaoCopiar.addEventListener('click', () => copiarCupom(item.cupom));

    containerGrid.appendChild(card);
  });
}

async function carregarOfertas() {
  const containerGrid = document.getElementById('grid-produtos');

  if (!containerGrid) return;

  try {
    const resposta = await fetch('/api/ofertas');

    if (!resposta.ok) {
      throw new Error('Arquivo de ofertas não encontrado.');
    }

    const ofertas = await resposta.json();
    ofertasOriginais = Array.isArray(ofertas) ? ofertas : [];

    lojasDisponiveis = ofertasOriginais.map((item) => item.loja).filter(Boolean);
    renderizarBotoesLoja(lojasDisponiveis);
    renderizarOfertas();
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    containerGrid.innerHTML = '<p class="carregando">Erro ao carregar ofertas. Certifique-se de que o robô gerou o arquivo de dados.</p>';
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
    termoBusca = event.target.value;
    renderizarOfertas();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarFiltros();
  carregarOfertas();
});
