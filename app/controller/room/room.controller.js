const Room = require('../../model/room/room.model');
const { isEmptyObject } = require('../../helper/helper');

const listMembersInTheRoom = async (req, roomId) => {
    var io = req.io
    let membersInTheRoom = await Room.findOne({ _id: roomId })
    console.log(`usuarioOnline >>> ${JSON.stringify(membersInTheRoom)}`)
    if (membersInTheRoom.members.length > 0) {
        io.emit('onlineMembers', membersInTheRoom)
    }
}

//Metodo responsavel por emitir o evento de listar os membros na sala e mostrar os votos
const votesList = async (req, roomId) => {
    var io = req.io
    let room = await Room.findOne({ _id: roomId, itsActive: true })
    let members = room.members.filter(member => member.isOnline && member.office == 'TD')
    let history = room.stories.filter(hist => hist.isCompleted == false && hist.historyNumber == '00001')

    if (history.length > 0) {
        let votes = history[0].points.votes;
        if (votes.length == members.length) {
            io.emit('votesFromMembers', votes)
        } else {
            listMembersInTheRoom(req, roomId)
        }
    }
}

exports.forceConnectAndroidClient = async (req) => {
    var roomId = req.body.roomId
    listMembersInTheRoom(req, roomId)
}

// Cria a sala para o planning poker
exports.createRoom = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var room = new Room(req.body);
        let roomCreated = await findRoom(room.roomName)
        if (roomCreated == null) {
            let createdRoom = await room.save();
            listMembersInTheRoom(req, createdRoom._id)
            insertStorie(createdRoom._id)
            res.status(201).send({ data: createdRoom, message: 'Sala criada.' })
        } else if(room.roomPassword === roomCreated.roomPassword){
            var member = { isOnline: true, email: room.members[0].email, name: room.members[0].name, avatar: room.members[0].avatar, office: room.members[0].office }
            var result = await logInToTheRoom(req, roomCreated, member)
            res.status(201).send({ data: result, message: 'OK' })
        } else {
            res.status(404).send({ data: null, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar a sala. Entre em contato com o desenvolvedor.' })
    }
}

const logInToTheRoom = async (req, room, member) => {
    var memberInRoom = await findMemberInRoom(room._id, member.email)
    if (memberInRoom == undefined) {
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

exports.disconnectMember = async (req, res) => {
    try {
        var roomId = req.params.roomId
        var { email } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {        
            var result = room.members.filter(m => m.email != email)
            room.members = result
            await Room.updateOne({ _id: roomId }, room);
            res.status(201).send({ data: room, message: 'Membro desconectado' })
            listMembersInTheRoom(req, roomId)
        } else {
            res.status(404).send({ data: usuarios, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' + error})
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
        if (room) {
            var stories = room
            res.status(201).send({ data: stories, message: 'Histórias da sala' })
        } else {
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
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => 
                storie.historyNumber == '00001' && 
                storie.isCompleted == false &&
                storie.isAvailable == true)
                
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

// funcao provisoria para inserir historia na versão light
const insertStorie = async (roomId) => {
    var room = await Room.findOne({ _id: roomId, itsActive: true })
    var history = { historyNumber: '00001', description: 'Historia padrao', createdBy: 'cloud.devmob@gmail.com' }
    room.stories.push(history)
    room.stories.map(hist => hist.isAvailable = false)
    await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
}



// Abre a votacao
exports.openVotes = async (req, res) => {
    try {
        var roomId = req.params.roomId
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == '00001' && storie.isCompleted == false)
            if (history != undefined) {
                room.stories.map(hist => hist.isAvailable = true)
                let storieUpdated = await Room.findOneAndUpdate({ _id: roomId }, room, { new: true })
                //notifyMembers(req, true)
                res.status(201).send({ data: storieUpdated, message: 'Votação disponivel' })
            } else {
                insertStorie(roomId)
            }
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}

const notifyMembers = (req, isAvailable) => {
    var io = req.io
    io.emit("isAvailable", {isAvailable})
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
    try {
        var roomId = req.params.roomId
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var history = room.stories.find(storie => storie.historyNumber == '00001' && storie.isCompleted == false)
            if (history != undefined) {
                room.stories.map(hist => hist.isCompleted = true)
                room.stories.map(hist => hist.isAvailable = false)
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
const findRoom = async (roomName) => {
    return await Room.findOne({ roomName, itsActive: true })
}