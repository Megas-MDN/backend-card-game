const Room = require('../models/Room');

const findRoomByName = async (name) => Room.findOne({ name }).select('_id');

const joinRoom = async (req, res, next) => {
  const { roomId } = req.params;
  try {
    const room = await findRoomByName(roomId);
    if (!room) return next({ status: 404, message: 'Room not found' });
    return res
      .status(200)
      .send({ message: `Join room ${roomId}`, room: room._id });
  } catch (error) {
    return next({ message: error.message });
  }
};

const createRoom = async (req, res, next) => {
  const { roomId } = req.params;
  try {
    const room = await findRoomByName(roomId);
    if (room) return next({ status: 409, message: 'Room is not available' });
    const newRoom = await Room.create({ name: roomId });
    return res.status(201).send({ message: 'Created', room: newRoom._id });
  } catch (error) {
    return next({ message: error.message });
  }
};

module.exports = { joinRoom, createRoom };
