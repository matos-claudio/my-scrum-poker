var mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:1234@cluster0-fmzyj.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log(`Conexao com o banco, OK!!!`)
})

module.exports = db