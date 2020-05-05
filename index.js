const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const server = require("http").createServer(app)
const io = require("socket.io")(server)


io.on("connection", (socket) => {
    console.log("New client connected");
    // if (interval) {
    //     clearInterval(interval);
    // }
   // interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        // clearInterval(interval);
    });
});


const port = process.env.PORT || 3000;
app.set('port', port);

const connection = require('./config/connection')
console.log(connection.readyState)

const roomRoute = require('./app/route/room/room.route');
//app.use('/room', roomRoute);

app.use('/room', (req, res, next) => {
    req.io = io
    next()
}, roomRoute)

server.listen(port, () => console.log(`Listening on port ${port}`));

//module.exports = app;