const express = require('express');
const router = express.Router();

const roomController = require('../../controller/room/room.controller');

router.post('/createRoom', roomController.createRoom);
router.put('/insertMemberIntoTheRoom/:roomId', roomController.insertMemberIntoTheRoom);
router.put('/insertHistoryForScore/:roomId', roomController.insertHistoryForScore);
router.put('/insertHistoryPointValue/:roomId', roomController.insertHistoryPointValue);
router.put('/updateHistoryPointValue/:roomId', roomController.updateHistoryPointValue);
router.put('/endStoryPunctuation/:roomId', roomController.endStoryPunctuation);


// rotas para teste
router.post('/test', roomController.testSocket)
router.get('/loginInRoom', roomController.testSocket)

module.exports = router;