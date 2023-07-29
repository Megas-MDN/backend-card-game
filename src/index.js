require('dotenv/config');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const dbConn = require('./models/connection');
const routes = require('./routes');
const app = express();
app.use(cors());
app.use(express.json());

// rotas
app.use(routes);
// end rotas

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const port = process.env.PORT || 3001;

dbConn()
  .then()
  .catch()
  .finally(() => {
    server.listen(port, () => console.log('Server Up na porta %s', port));
  });

module.exports = io;
