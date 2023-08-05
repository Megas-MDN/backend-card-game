const Room = require('../models/Room');

const findPlayerByNameOrId = async ({ socketId, name, roomId }) => {
  // null
  const room = await Room.findById(roomId);
  if (!room) return null;
  const player = room.players.find((p) => {
    if (p.socketId === socketId) return true;
    if (name && p.name?.toLowerCase() === name?.toLowerCase()) return true;
    return false;
  });
  return player;
};

const canPlayerJoin = async ({ roomId, player, socketId }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room || room.gameInProgress || !player) return false;
    const playerFinder = await findPlayerByNameOrId({
      roomId,
      name: player,
      socketId,
    });
    if (playerFinder) return false;
    room.players.push({ socketId, cards: [], name: player });
    await room.save();
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

const removePlayer = async ({ roomId, socketId, name }) => {
  try {
    const room = await Room.findById(roomId);
    const player = await findPlayerByNameOrId({ socketId, roomId });
    if (player) {
      room.players = room.players.filter((p) => p.socketId !== socketId);
      console.log('Player removed ::: ', roomId, name, socketId);
      await room.save();
      return player.name;
    }
    console.log('Player can not be removed ::: ', roomId, name, socketId);
    return false;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = { canPlayerJoin, removePlayer };
