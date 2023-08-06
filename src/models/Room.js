const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { required: true, type: String, unique: true },
  gameInProgress: { type: Boolean, default: false },
  players: {
    type: [{ socketId: String, cards: Array, name: String }],
    default: [],
  },
  table: { type: Array, default: [] },
  bySideTable: { type: Array, default: [] },
  goPlay: {
    type: { socketId: String, name: String, index: Number },
    default: {},
  },
  actions: {
    type: Array,
    default: [],
  },
});

const Room = mongoose.model('Room', schema);
module.exports = Room;
