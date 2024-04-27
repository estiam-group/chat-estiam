const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        nom : {
            type: String,
            required: true
        },
        prenoms : {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        classe:{
            type: String,
            required: true
        },
        specialite:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        },
        cover:{
            type:String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('user', userSchema)