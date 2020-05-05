const Room = require('../../model/room/room.model');
const { isEmptyObject } = require('../../helper/helper');

const socketIo = require("socket.io");
const io = socketIo.listen()


// io.on("connection", (socket) => {
//     console.log("New client connected");
//     if (interval) {
//         clearInterval(intervalna);
//     }
//     //interval = setInterval(() => teste(socket), 5000);
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//         clearInterval(interval);
//     });
// });

// const getApiAndEmit = socket => {
//     const response = new Date();
//     // Emitting a new message. Will be consumed by the client
//     console.log(response)
//     //socket.emit("FromAPI", response);
//     io.emit('FromAPI', response) // broadcast para todos os clientes
// };

// const teste = async (socket) => {
//     let response = await Room.findOne({ _id: '5eb033925f13767c7e254841' })
//     console.log(response)
//     //io.emit('FromAPI', response.roomName)
//     io.emit('FromAPI', { to: response.roomName })
// }

exports.testSocket = async (req, res, next) => {
    console.log('entrei '+req.body.id)
    var io = req.io
    let response = await Room.findOne({ _id: req.body.id })
    //console.log(response)
    io.emit('FromAPI', response.createdBy)
    //teste()
    res.status(200).send({ data: response.roomName })
}

// Cria a sala para o planning poker
exports.createRoom = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var room = new Room(req.body);
        let createdRoom = await room.save();
        res.status(201).send({ data: createdRoom, message: 'Sala criada.' })
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar a sala. Entre em contato com o desenvolvedor.' })
    }
}

// Insere membros do time na sala
exports.insertMemberIntoTheRoom = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { email, name, avatar, office } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var member = { email, name, avatar, office }
            room.members.push(member)
            await Room.updateOne({ _id: roomId }, room);
            res.status(201).send({ data: room, message: 'Membro adicionado' })
        } else {
            res.status(404).send({ data: usuarios, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}

// Insere a historia para votacao
exports.insertHistoryForScore = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { historyNumber, description, createdBy } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })

        if (room) {
            var history = { historyNumber, description, createdBy }
            room.stories.push(history)
            let userUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
            res.status(201).send({ data: userUpdated, message: 'Historia adicionada' })
        } else {
            res.status(404).send({ data: null, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}

// Insere ponto na historia
exports.insertHistoryPointValue = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { member, score, historyNumber } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == historyNumber)
            if (history != undefined) {
                var score = { member, score }
                room.stories.map(hist => hist.points.votes.push(score))
                let pointUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
                res.status(201).send({ data: pointUpdated, message: 'Ponto adicionado' })
            } else {
                res.status(404).send({ data: null, message: 'Nenhuma história encontrada.' })
            }
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}

// Atualiza com o valor final da historia
exports.updateHistoryPointValue = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { score, historyNumber } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == historyNumber)
            console.log(history)
            if (history != undefined) {
                var score = { score }
                room.stories.map(hist => hist.points.historyPoints = 4)
                let pointUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
                res.status(201).send({ data: pointUpdated, message: 'Ponto adicionado' })
            } else {
                res.status(404).send({ data: null, message: 'Nenhuma história encontrada.' })
            }
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}

// finaliza a votacao na historia
exports.endStoryPunctuation = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { historyNumber } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == historyNumber)
            console.log(history)
            if (history != undefined) {
                var score = { score }
                room.stories.map(hist => hist.isCompleted = true)
                let storieUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
                res.status(201).send({ data: storieUpdated, message: 'Historia finalizada' })
            } else {
                res.status(404).send({ data: null, message: 'Nenhuma história encontrada.' })
            }
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}