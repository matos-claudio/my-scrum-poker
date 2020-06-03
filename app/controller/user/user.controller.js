const User = require('../../model/user/user.model')
const { isEmptyObject } = require('../../helper/helper');


exports.test = async  (req, res) => {
    res.status(200).send({message: 'OK'})
}

exports.saveUser = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var user = new User(req.body)
        var createdUser = await user.save()
        res.status(201).send({ data: createdUser, message: 'Usuário criado.' })
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar ao usuário. Entre em contato com o desenvolvedor.' })
    }
}

exports.updateUser = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        var userId = req.params._id
        let userUpdated = await User.findOneAndUpdate({ _id: userId }, req.body)
        res.status(200).send({ data: userUpdated, message: 'Usuário atualizado.' })
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar ao usuário. Entre em contato com o desenvolvedor.' })
    }
}