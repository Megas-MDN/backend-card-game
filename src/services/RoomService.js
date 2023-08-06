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

const setDeckToPlayer = async ({ roomId, socketId, card }) => {
  try {
    const room = await Room.findById(roomId);
    const playerInRoom = room.players.find((p) => p.socketId === socketId);
    if (!playerInRoom) return false;
    playerInRoom.cards = card;
    await room.save();
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

const setTableCards = async ({
  roomId,
  cards = [],
  inBySide = false,
  card = false,
}) => {
  try {
    const room = await Room.findById(roomId);
    const key = inBySide ? 'bySideTable' : 'table';
    const newCards = card ? [card, ...room[key]] : cards;
    room[key] = newCards;
    await room.save();
  } catch (error) {
    console.log(error.message);
    return;
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

const canStartGame = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room || room.gameInProgress) return false;
  room.gameInProgress = true;
  await room.save();
  return true;
};

const clearPlayerInTheRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) return;
  room.players = [];
  room.gameInProgress = false;
  room.goPlay = {};
  room.table = [];
  room.bySideTable = [];
  await room.save();
};

const setPlayerToPlay = async ({
  roomId,
  isRandom = false, // index random
  nextToPLay = false, // set next player to play
  socketId, // expecific player
}) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return null;
    const index = isRandom
      ? Math.floor(Math.random() * room.players.length)
      : nextToPLay
      ? (room.goPlay.index + 1) % room.players.length
      : room.players.findIndex((player) => player.socketId === socketId);
    room.goPlay = {
      socketId: room.players[index].socketId,
      name: room.players[index].name,
      index,
    };
    await room.save();
    return room.goPlay;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

const canPlayerPlay = async ({ roomId, socketId, checkHand = false, card }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return false;
    if (room.goPlay.socketId !== socketId) return false;
    if (!checkHand) return true;
    const cardOnHand = room.players[room.goPlay.index].cards.find(
      ({ nipe, value }) => nipe === card.nipe && value === card.value
    );
    if (!cardOnHand) return false;
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = {
  canPlayerJoin,
  removePlayer,
  canStartGame,
  setDeckToPlayer,
  setTableCards,
  clearPlayerInTheRoom,
  setPlayerToPlay,
  canPlayerPlay,
};
