const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Force high limit for JSON bodies
server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

server.use(middlewares);
server.use(router);

server.listen(3002, () => {
  console.log('JSON Server running with 50MB limit on port 3002');
});
