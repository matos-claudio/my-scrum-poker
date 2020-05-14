const User = require('../../model/user/user.model')
const { isEmptyObject } = require('../../helper/helper');

exports.auth = async (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(400).send({ data: null, message: 'Requisicão inválida. Verifique as informações e tente novamente.' })
    }

    try {
        const { userEmail, userPassword } = req.body
        const user = await User.findOne({ userEmail, userPassword })
        if (user) {
            res.status(200).send({ data: user, message: 'OK' })
        } else {
            res.status(404).send({ data: createdUser, message: 'Usuário não encontrado' })
        }
    } catch (error) {
        res.status(500).send({ data: error, message: 'Erro ao criar ao usuário. Entre em contato com o desenvolvedor.' })
    }
}