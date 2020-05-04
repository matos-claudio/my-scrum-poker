const Room = require('../../model/room/room.model');
const { isEmptyObject } = require('../../helper/helper');

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

exports.insertMemberIntoTheRoom = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var roomId = req.params.roomId
        var { email, name, avatar } = req.body
        var room = await Room.findOne({ _id: roomId, itsActive: true })
        if (room) {
            var member = { email, name, avatar }
            room.members.push(member)
            await Room.updateOne({ _id: roomId }, room);
            res.status(200).send({ data: room, message: 'Membro adicionado' })
        } else {
            res.status(404).send({ data: usuarios, message: 'Nenhuma sala encontrada.' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao inserir membro na sala. Entre em contato com o desenvolvedor.' })
    }
}