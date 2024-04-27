
const bcrypt = require('bcrypt')
const adminModel = require('../models/admin.model')
const { ADMIN_PASSWORD, ADMIN_USERNAME } = require('../config.env')

/*
    Cette fonction si le premier admin : super_admin existe déjà et le crée au cas où il n'existe pas.
*/
const createFirstAdmin = async () =>{
    const adminExist = await adminModel.findOne({username: ADMIN_USERNAME})
    if(!adminExist){
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

        const admin = new adminModel({
            nom: "super",
            prenoms: "admin",
            username: "super_admin",
            email: "",
            autorisation: 1,
            password: hashedPassword
        })

        await admin.save()
        console.log("Premier admin créé");
    }
}

module.exports = createFirstAdmin