const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { required: true, type: String, unique: true },
  players: {
    type: [{ socketId: String, cards: Array, name: String }],
    default: [],
  },
  actions: {
    type: Array,
    default: [],
  },
});

const Room = mongoose.model('Room', schema);
module.exports = Room;
