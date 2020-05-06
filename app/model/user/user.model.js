var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {
        type: String, 
        required: true,
        trim: true
    },
    userEmail: {
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    userPassword: {
        type: String, 
        required: true,
        trim: true
    },
    // userOffice: {
    //     type: String,
    //     enum: ['PO', 'SM', 'TD', 'GU'],
    //     required: true
    // }

}, { versionKey: false, timestamps: true })
module.exports = mongoose.model('User', userSchema);