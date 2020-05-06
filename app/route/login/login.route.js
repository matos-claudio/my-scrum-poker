const express = require('express');
const router = express.Router();

const loginController = require('../../controller/login/login.controller')
router.post('/auth', loginController.auth)


module.exports = router