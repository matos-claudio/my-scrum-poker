const express = require('express');
const router = express.Router();

const roomController = require('../../controller/room/room.controller');

router.post('/createRoom', roomController.createRoom);
router.put('/insertMemberIntoTheRoom/:roomId', roomController.insertMemberIntoTheRoom);

module.exports = router;