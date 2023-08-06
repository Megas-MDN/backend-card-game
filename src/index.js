require('dotenv/config');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const dbConn = require('./models/connection');
const routes = require('./routes');
const roomService = require('./services/RoomService');
const genCards = require('./utils/deck');
const { trusted } = require('mongoose');
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
      });
  }

  socket.on('room-game', (data) => {
    // CHAT
    io.in(roomId).emit('room-game', data);
  });

  socket.on('start-game', () => {
    roomService.canStartGame(roomId).then(async (r) => {
      if (!r) {
        io.in(roomId).emit('alert', {
          message: 'Game already in progress',
          error: true,
          player: false,
        });
        return;
      }
      message = 'Game started';
      const sockets = await io.in(roomId).fetchSockets();
      const cards = genCards({ nPlayers: sockets.length });
      sockets.forEach(async (skt, i) => {
        skt.emit('my-deck', { deck: cards.playersCards[i] });
        await roomService.setDeckToPlayer({
          roomId,
          socketId: skt.id,
          card: cards.playersCards[i],
        });
      });
      const turn = await roomService.setPlayerToPlay({
        roomId,
        isRandom: true,
      });

      io.in(roomId).emit('alert', {
        message,
        error: false,
        player: false,
        gameOn: { on: true, turn: turn.name },
      });
      // set gameInprogress true ***
      // gerar deck ***
      // gravar & distribuir o deck ***
      // enviar a lista de players e o player da vez */
    });
  });

  socket.on('go-play', async (data) => {
    // {card: {nipe, value}, mask: {nipe, value}}
    const canPlayerPlay = await roomService.canPlayerPlay({
      roomId,
      socketId: socket.id,
      checkHand: true,
      card: data.card,
    });
    if (!canPlayerPlay) return;
    const [turn] = await Promise.all([
      roomService.setPlayerToPlay({
        roomId,
        nextToPLay: true,
      }),
      await roomService.setTableCards({
        roomId,
        card: { socketId: socket.id, mask: data.mask, card: data.card },
      }),
    ]);

    io.in(roomId).emit('alert', {
      message: 'Move done, go next',
      moveDone: true,
      turn: turn.name,
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
    if (sockets.length === 0) await roomService.clearPlayerInTheRoom(roomId);
    console.log(sockets.length);
  });
});
