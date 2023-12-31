const errorHandler = require('../middlewares/errorHandler');
const notImplemented = require('../middlewares/notImplemented');
const game = require('../controllers/gameController');

const routes = require('express').Router();

routes.get('/clear/:roomName', game.clearRoom);
routes.get('/cards/:roomName', game.cardsTable);
routes.get('/delete/:roomName', game.deleteRoom);
routes.get('/stop/:roomName', game.stopGame);
routes.get('/:roomName', game.joinRoom);
routes.post('/:roomName', game.createRoom);

routes.use(notImplemented);
routes.use(errorHandler);
module.exports = routes;
