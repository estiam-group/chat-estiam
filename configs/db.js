/*
    Connexion à la base de donnée. cette fonction sera appelée dans le server.js
*/

const mongoose = require('mongoose')
const { MONGO_URL } = require('../config.env')

const dbConnect = async () =>{
    await mongoose.connect(MONGO_URL)
    .then(()=>console.log("Base de données connectée"))
    .catch((error)=>console.log(error))
}


module.exports = dbConnect