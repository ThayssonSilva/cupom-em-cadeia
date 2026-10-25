const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname, 'src');
const ofertasPath = path.join(rootDir, 'cupons.json');
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 80;
const MAX_LIMIT = 500;

function paginarOfertas(ofertas, paginaSolicitada, limiteSolicitado) {
  const lista = Array.isArray(ofertas) ? ofertas : [];
  const pagina = Math.max(1, Number(paginaSolicitada) || DEFAULT_PAGE);
  const limite = Math.min(Math.max(1, Number(limiteSolicitado) || DEFAULT_LIMIT), MAX_LIMIT);
  const total = lista.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const paginaCorreta = Math.min(pagina, totalPaginas);
  const inicio = (paginaCorreta - 1) * limite;
  const itens = lista.slice(inicio, inicio + limite);

  return {
    items: itens,
    page: paginaCorreta,
    limit: limite,
    total,
    totalPages: totalPaginas,
    hasMore: inicio + limite < total
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  return contentTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/ofertas') {
    fs.readFile(ofertasPath, 'utf-8', (err, data) => {
      if (err) {
        sendJson(res, 500, { erro: 'Arquivo de ofertas não encontrado.' });
        return;
      }

      try {
        const ofertas = JSON.parse(data);
        const pagina = Number(url.searchParams.get('page')) || DEFAULT_PAGE;
        const limite = Number(url.searchParams.get('limit')) || DEFAULT_LIMIT;
        const paginacao = paginarOfertas(ofertas, pagina, limite);
        sendJson(res, 200, paginacao);
      } catch (error) {
        sendJson(res, 500, { erro: 'Arquivo de ofertas inválido.' });
      }
    });
    return;
  }

  let filePath = path.join(rootDir, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const fallback = path.join(rootDir, 'index.html');
      sendFile(res, fallback, 'text/html; charset=utf-8');
      return;
    }

    sendFile(res, filePath, getContentType(filePath));
  });
});

server.listen(port, () => {
  console.log(`🚀 Site rodando em http://localhost:${port}`);
  console.log(`📦 API de ofertas em http://localhost:${port}/api/ofertas`);
});
