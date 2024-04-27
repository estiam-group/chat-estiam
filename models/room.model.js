const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
    {
        titre: {
            type: String,
            required: true
        },
        members:{
            type: Array,
            default: []
        },
        id_createur: {
            type: String,
            required: true
        },
        cover:{
            type: String,
            default:null
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('room', roomSchema)