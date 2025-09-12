const http = require('http');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('Starting basic server...');
console.log('Port:', PORT);
console.log('Host:', HOST);

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running');
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log('Server running on', HOST + ':' + PORT);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
