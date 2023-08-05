const Room = require('../models/Room');
const roomService = require('../services/RoomService');

const findRoomByName = async (name) =>
  Room.findOne({ name }).select('_id players');

const deleteRoom = async (req, res, next) => {
  const { roomName } = req.params;
  try {
    const room = await Room.findOneAndDelete({ name: roomName });
    return res.status(200).send({
      message: `Join room ${roomName} deleted`,
      room,
    });
  } catch (error) {
    return next({ message: error.message });
  }
};

const clearRoom = async (req, res, next) => {
  const { roomName } = req.params;
  try {
    const room = await findRoomByName(roomName);
    if (!room) return next({ status: 404, message: 'Room not found' });
    room.players = [];
    await room.save();
    return res.status(200).send({
      message: `Join room ${roomName} cleanup players`,
      room: room._id,
      players: room.players,
    });
  } catch (error) {
    return next({ message: error.message });
  }
};

const joinRoom = async (req, res, next) => {
  const { roomName } = req.params;
  try {
    const room = await findRoomByName(roomName);
    if (!room) return next({ status: 404, message: 'Room not found' });
    return res.status(200).send({
      message: `Join room ${roomName}`,
      room: room._id,
      players: room.players.map((p) => p.name),
    });
  } catch (error) {
    return next({ message: error.message });
  }
};

const createRoom = async (req, res, next) => {
  const { roomName } = req.params;
  try {
    const room = await findRoomByName(roomName);
    if (room) return next({ status: 409, message: 'Room is not available' });
    const newRoom = await Room.create({ name: roomName });
    return res.status(201).send({ message: 'Created', room: newRoom._id });
  } catch (error) {
    return next({ message: error.message });
  }
};

module.exports = { joinRoom, createRoom, clearRoom, deleteRoom };
