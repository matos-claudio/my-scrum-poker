const app = require('../index')
const http = require('http');
const server = http.createServer(app);

module.exports = server;