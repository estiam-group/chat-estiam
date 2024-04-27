const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        contenu: {
            type: String,
            default: ""
        },
        id_room: {
            type: String,
            required: true
        },
        id_user: {
            type: String,
            required: true
        },
        files:{
            type: Array
        },
        document: {
            type: String
        },
        type: {
            type: String
        },
        isResponseTo: {
            type: String,
            default: null
        },
        deleted:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model('message', messageSchema)