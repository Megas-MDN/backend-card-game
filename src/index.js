require('dotenv/config');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const dbConn = require('./models/connection');
const routes = require('./routes');
const roomService = require('./services/RoomService');
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

io.on('connection', (socket) => {
  const { roomId, player } = socket.handshake.query;
  console.log('Socket id :: %s :: room :: %s ::', socket.id, roomId);

  if (roomId && player) {
    let message;
    roomService
      .canPlayerJoin({ roomId, player, socketId: socket.id })
      .then((r) => {
        if (!r) {
          message = 'Player is already in the room or game is in progress';
          socket.emit('alert', {
            message,
            error: true,
          });
        } else {
          socket.join(roomId);
          message = `Player ${player} joined the room`;
          io.in(roomId).emit('alert', {
            message,
            error: false,
            player,
          });
        }
        console.log(message);
      });
  }

  socket.on('room-game', (data) => {
    console.log('Data ::: ', data);
    io.in(roomId).emit('room-game', data);
  });

  socket.on('start-game', () => {
    console.log('Start Game ::: ', roomId);
    message = 'Game started';
    io.in(roomId).emit('alert', {
      message,
      error: false,
      player: false,
    });
  });

  socket.on('disconnect', async (reason) => {
    console.log(reason, `<::: ${socket.id} ::<`);
    socket.leave(roomId);
    roomService
      .removePlayer({ roomId, socketId: socket.id, name: player })
      .then((r) => {
        if (r) {
          message = `Player ${r} leaved the room`;
          io.in(roomId).emit('alert', {
            message,
            error: false,
            player,
          });
        }
      });
    const sockets = await io.in(roomId).fetchSockets();
    console.log(sockets.length);
  });
});
