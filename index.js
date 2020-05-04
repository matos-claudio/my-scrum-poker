const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const roomRoute = require('./app/route/room/room.route');
app.use('/room', roomRoute);

module.exports = app;