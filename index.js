const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const server = require("http").createServer(app)
const io = require("socket.io")(server)


io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});


const port = process.env.PORT || 3000;
app.set('port', port);

const connection = require('./config/connection')
console.log(connection.readyState)

const roomRoute = require('./app/route/room/room.route');
const userRoute = require('./app/route/user/user.route');
const loginRoute = require('./app/route/login/login.route')

app.use('/room', (req, res, next) => {
    req.io = io
    next()
}, roomRoute)

app.use('/user', (req, res, next) => {
    req.io = io
    next()
}, userRoute)

app.use('login', loginRoute)

server.listen(port, () => console.log(`Listening on port ${port}`));