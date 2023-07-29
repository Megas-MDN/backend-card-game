const errorHandler = require('../middlewares/errorHandler');
const notImplemented = require('../middlewares/notImplemented');
const game = require('../controllers/gameController');

const routes = require('express').Router();

routes.get('/:roomId', game.joinRoom);
routes.post('/:roomId', game.createRoom);

routes.use(notImplemented);
routes.use(errorHandler);
module.exports = routes;
