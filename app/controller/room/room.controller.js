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

const teste = async (socket) => {
    let response = await Room.findOne({ _id: '5eb033925f13767c7e254841' })
    console.log(response)
    //io.emit('FromAPI', response.roomName)
    io.emit('FromAPI', { to: response.roomName })
}


// ========================== METODOS PARA TESTE ==================================

exports.testSocket = async (req, res, next) => {
    //console.log('entrei ' + req.body.id)
    let room = await Room.findOne({ _id: '5eb033925f13767c7e254841', itsActive: true })
    //console.log(`sala ${JSON.stringify(room)}`)

    let members = room.members.filter(member => member.isOnline)
    let history = room.stories.filter(hist => hist.isCompleted == false && hist.historyNumber == '0001')

    //console.log(`members ${JSON.stringify(members)}`)

    if (history.length > 0) {
        let votes = history[0].points.votes;
        //console.log(`votes ${JSON.stringify(votes)}`)

        if (votes.length == members.length) {
            console.log(`votes entrei`)
            votesList(req, votes)
        } else {
            listMembersInTheRoom(req, '5eb033925f13767c7e254841')
        }
    }
}

const listMembersInTheRoom = async (req, roomId) => {
    var io = req.io
    let membersInTheRoom = await Room.findOne({ _id: roomId })
    console.log(`membersInTheRoom ${JSON.stringify(membersInTheRoom)}`)
    if (membersInTheRoom.members.length > 0) {
        io.emit('onlineMembers', membersInTheRoom)
    }
}

const votesList = async (req, roomId) => {
    var io = req.io
    let room = await Room.findOne({ _id: roomId, itsActive: true })
    let members = room.members.filter(member => member.isOnline)
    let history = room.stories.filter(hist => hist.isCompleted == false && hist.historyNumber == '0001')

    if (history.length > 0) {
        let votes = history[0].points.votes;
        if (votes.length == members.length) {
            io.emit('votesFromMembers', votes)
        } else {
            listMembersInTheRoom(req, roomId)
        }
    }
}


// ================================================================================


exports.loadRoom = (req, res, next) => {
    listMembersInTheRoom(req)
}

// Cria a sala para o planning poker
exports.createRoom = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var room = new Room(req.body);
        let roomCreated = await queryRoomByName(room.roomName)
        // verifico se ja possui uma sala criada
        // se nao houver, faço a criacao e loga o usuario
        if (roomCreated == null) {
            let createdRoom = await room.save();
            res.status(201).send({ data: createdRoom, message: 'Sala criada.' })
        } else {
            // caso ja possua sala criada, faço o login do usuario na mesma
            var member = {
                isOnline: true,
                email: room.members[0].email,
                name: room.members[0].name,
                avatar: room.members[0].avatar,
                office: room.members[0].office,
            }

            var result = await logInToTheRoom(req, roomCreated, member)
            //console.log(`MEMBER ADD >>> ${JSON.stringify(member)}`)
            res.status(201).send({ data: result, message: 'OK' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar a sala. Entre em contato com o desenvolvedor.' })
    }
}

const logInToTheRoom = async (req, room, member) => {
    var memberInRoom = await findMemberInRoom(room._id, room.members[0].email)
    console.log(`MEMBER ADD >>> ${JSON.stringify(memberInRoom)}`)

    if (memberInRoom == null) {
        room.members.push(member)
        await Room.updateOne({ _id: room._id }, room);
        listMembersInTheRoom(req, room._id)
        return room
    }

    listMembersInTheRoom(req, room._id)
    return room
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
            listMembersInTheRoom(req, roomId)
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

exports.listStories = async (req, res) => {
    try {
        var roomId = req.params.roomId
        var room = await Room.findOne({ _id: roomId })
        if(room){
            var stories = room
            res.status(201).send({ data: stories, message: 'Histórias da sala' })
        }else {
            res.status(404).send({ data: null, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao buscar histórias. Entre em contato com o desenvolvedor.' })
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
        var userMember = await findMemberInRoom(roomId, member)
        var avatar = userMember.avatar
        console.log(`userMember ${JSON.stringify(userMember)}`)
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == historyNumber)
            if (history != undefined) {
                var score = { member, score, userMember, avatar }
                room.stories.map(hist => hist.points.votes.push(score))
                let pointUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
                votesList(req, roomId)
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

const findMemberInRoom = async (roomId, member) => {
    let result = await Room.findOne({ _id: roomId })
    return result.members.find(m => m.email == member)
}

// consulta sala criada por nome 
const queryRoomByName = async (roomName) => {
    return await Room.findOne({ roomName, itsActive: true })
}