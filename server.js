const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname, 'src');
const ofertasPath = path.join(rootDir, 'cupons.json');

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
        sendJson(res, 200, ofertas);
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
