var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema(
    {
        roomName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        roomPassword: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: String,
            required: true,
            trim: true
        },
        itsActive: {
            type: Boolean
        },
        members: [
            {
                email: {
                    type: String
                },
                name: {
                    type: String  
                },
                office: {
                    type: String,
                    enum: ['PO', 'SM', 'TD'],
                    required: true
                },
                avatar: {
                    type: String
                },
                isOnline: {
                    type: Boolean,
                    default: true
                }
            }
        ]

    }, { versionKey: false, timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);