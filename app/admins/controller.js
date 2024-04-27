const joi = require("joi")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const adminModel = require("../../models/admin.model");
const { SECRET_KEY } = require("../../config.env");
const AdminService = require("./service");
const adminService = new AdminService

// Définir des messages d'erreur personnalisés pour Joi
const customMessages = {
    'string.base': '{{#label}} doit être une chaîne de caractères',
    'string.min': '{{#label}} doit avoir une longueur d\'au moins {{#limit}} caractères',
    'string.max': '{{#label}} doit avoir une longueur d\'au plus {{#limit}} caractères',
    'string.email': '{{#label}} doit être une adresse e-mail valide',
    'string.required': '{{#label}} est requis',
};

// Création d'un schema de validation pour les données lors de la création de compte admin
const schemaDataRegister = joi.object(
    {
        nom: joi.string().min(3).required().messages(customMessages),
        prenoms: joi.string().min(3).required().messages(customMessages),
        email: joi.string().email().min(7).messages(customMessages),
        password: joi.string().min(8).required().messages(customMessages),
        passwordRepeat: joi.string().min(8).required().messages(customMessages),
    }
)

const schemaDataLogin = joi.object(
    {
        username: joi.string().min(5).required().messages(customMessages),
        password: joi.string().min(8).required().messages(customMessages),
    }
)

/*
    Cette fonction permet de créer un compte admin 
*/
module.exports.registerAdmin = async (req, res) => {
    const data = req.body

    const {error} = schemaDataRegister.validate(data)
    if(error) return res.status(400).json({error: error.details[0].message.replace(/["']/g, ''), path: error.details[0].path[0]})

    try {
        const usernameExist = await adminModel.findOne({username: data.username})
        if (usernameExist) return res.status(400).json({error: "Ce nom d'utilisateur existe déjà", path: "username"})

        const emailExist = await adminModel.findOne({email: data.email})
        if (emailExist) return res.status(400).json({error: "Cet email existe déjà", path: "email"})

        if(data.password !== data.passwordRepeat) return res.status(400).json({error: 'Les mots de passe doivent être les mêmes', path: "password"})

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const admin = new adminModel({
            nom: data.nom.toLowerCase(),
            prenoms: data.prenoms.toLowerCase(),
            username: data.username || data.prenoms[0].toLowerCase() + data.nom.toLowerCase() + '_admin',
            email: data.email?.toLowerCase() || null,
            password: hashedPassword
        })

        const adminSaved = await admin.save()
        res.json({adminSaved})

    } catch (error) {
        res.status(400).json({error})
    }
}

/*
    Cette fonction permet de se connecter en tant que admin 
*/
module.exports.loginAdmin = async(req, res)=>{
    const data = req.body
    const {error} = schemaDataLogin.validate(data)

    if(error) return res.status(400).json({error: error.details[0].message.replace(/["']/g, ''), path: error.details[0].path[0]})
    
    try {
        const usernameExist = await adminModel.findOne({username: data.username})
        if(!usernameExist) return res.status(400).json({error: "Nom d'utilsateur ou mot de passe incorrecte", path: "auth"})

        const passwordVerification = await bcrypt.compare(data.password, usernameExist.password)
        
        if(!passwordVerification) return res.status(400).json({error: "Nom d'utilsateur ou mot de passe incorrecte", path: "auth"})
    
        const token = jwt.sign({adminId: usernameExist._id}, SECRET_KEY, {expiresIn : '3h'})
        
        res.json({token: token, message: "Authentification réussie"})
    } catch (error) {
        res.status(400).json({error})
    }
}


/*
    Cette fonction permet de recupérer les données d'un compte admin. Cela sera utiliser apres la connexion  pour récupérer les données de l'admin connecté
*/
module.exports.getAdmin = async(req, res)=>{
    const id = req.params.id
    try {
        const admin = await adminService.getAdmin(id)
        if(!admin) return res.status(400).json({message: "Utilisateur introuvable"})
        res.json({admin})
    } catch (error) {
        res.status(400).json({error})
    }
}

/*
    Cette fonction permet de recupérer les données de tous les admins. 
*/

module.exports.getAdmins = async(req, res) =>{
    const {motCle} = req.query;
    const ids = req.query.ids?.split(',')
    try {
        let query = {}

        if (ids) {
            query._id = { $in: ids }
        }
        
        if (motCle) {
   
            query.$or = [
                { nom: { $regex: motCle, $options: 'i' } }, // $regex pour une correspondance partielle, $options: 'i' pour insensible à la casse
                { prenoms: { $regex: motCle, $options: 'i' } },
                { username: { $regex: motCle, $options: 'i' } },
                { email: { $regex: motCle, $options: 'i' } },

            ]
        }

        const admins = await adminModel.find(query).sort({createdAt: -1})


        res.json({admins})
    } catch (error) {
        res.status(400).json({error})
    }
}

/*
    Cette fonction permet de mettre a jour les infos d'un admin
*/
module.exports.updateAdmin = async(req, res) =>{
    const id = req.adminId
    const body = req.body

    try {
        const adminExist = await adminModel.findOne({_id: id})
        if(!adminExist) return res.status(400).json({message: 'Cet utilisateur est introuvable'})

        if(Object.keys(body).length === 0) return res.status(400).json({message:'Aucune donnée à modifier'})

        if (body.oldPassword) {
            
            const passwordVerification = await bcrypt.compare(body.oldPassword, adminExist.password)
            if(!passwordVerification) return res.status(400).json({message:"Mot de passe incorrecte"})

            if(body.password !== body.passwordRepeat) return res.status(400).json({message:'Les mots de passes doivent être les mêmes'})

            
            const hashedPassword = await bcrypt.hash(body.password, 10)

            const passwordVerificationFinal = await bcrypt.compare(body.password, adminExist.password)
            if(passwordVerificationFinal) return res.status(400).json({message:"Votre nouveau mot de passe ne peut pas être le même que l'ancien"})

            await adminModel.findByIdAndUpdate(adminExist, {password: hashedPassword})
            
        }else{
            await adminModel.findByIdAndUpdate(adminExist, body)
        }

        const admin = await adminService.getAdmin(id)
        res.json({"admin" : admin, message: "Modification effectuée"})
    } catch (err) {
        res.status(400).json({err})
    }
}

/*
    Supprimer des admins
*/
module.exports.deleteAdmins = async(req, res)=>{
    try {
        const idsToDelete = req.query.ids?.split(',')
        if(!idsToDelete || idsToDelete[0] == '') return res.status(400).json({message : "Veuillez fournir des admins à supprimer"})
        const adminDeleted = []
        
        //verifications de l'existence des ids
        for(const id of idsToDelete){
            
            const result = await userModel.findById(id)
            if(!result) return res.status(400).json({message : "Un ou plusieurs admins n'existent pas"})
            
        }

        for(const id of idsToDelete){
            
            if (id !== req.adminId) {
                
                const result = await adminModel.findByIdAndDelete(id)
                if (result) {
                    adminDeleted.push(id)
                }
            }
        }

        res.json({ message : "Suppression terminée", adminDeleted: adminDeleted})
    } catch (err) {
        res.status(400).json({err})
    }
}