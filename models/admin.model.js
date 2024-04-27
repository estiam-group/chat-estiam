const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true
        },
        prenoms: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email:{
            type: String,
            default: null
        },
        password:{
            type: String,
            required: true
        },
        autorisation:{
            type: Number,
            default: 0
        }

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('admin', adminSchema)