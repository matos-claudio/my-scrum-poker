const app = require('../index')
const debug = require('debug')('nodestr:server');

const io = require("socket.io")()


// const socketIo = require("socket.io");
// const http = require('http');

const port = normalizePort(process.env.PORT || 3000);
app.set('port', port);
//app.set(socketIo)

const server = require('./createServer')
server.listen(port);

server.on('error', onError);
server.on('listenig', onListening);

console.log(`Servidor rodando na porta.: ${port}`)

const connection = require('./connection')
console.log(connection.readyState)

// const io = socketIo(server)
// let interval;

// io.on("connection", (socket) => {
//     console.log("New client connected");
//     // if (interval) {
//     //     clearInterval(interval);
//     // }
//    // interval = setInterval(() => getApiAndEmit(socket), 1000);
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//         // clearInterval(interval);
//     });
// });

// const getApiAndEmit = socket => {
//     const response = new Date();
//     // Emitting a new message. Will be consumed by the client
//     console.log(response)
//     //socket.emit("FromAPI", response);
//     io.emit('FromAPI', response) // broadcast para todos os clientes
// };


function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    debug("Listening on " + bind);
}

function onError (error){
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}