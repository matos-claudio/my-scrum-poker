const express = require('express');
const router = express.Router();

const userController = require('../../controller/user/user.controller')

router.post('createUser', userController.saveUser)
router.put('updateUser', userController.updateUser)

module.exports = router;