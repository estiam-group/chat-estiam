const userModel = require("../../models/user.model");
const joi = require('joi') 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const UserService = require("./service");
const { SECRET_KEY } = require("../../config.env");
const userService = new UserService

const customMessages = {
    'string.base': '{{#label}} doit être une chaîne de caractères',
    'string.min': '{{#label}} doit avoir une longueur d\'au moins {{#limit}} caractères',
    'string.max': '{{#label}} doit avoir une longueur d\'au plus {{#limit}} caractères',
    'string.email': 'l\'adresse email doit être une adresse e-mail valide',
    'string.required': '{{#label}} est requis',
};

const schemaDataCreateUser = joi.object(
    {
        nom: joi.string().min(2).required().messages(customMessages),
        prenoms: joi.string().min(3).required().messages(customMessages),
        email: joi.string().email().min(7).required().messages(customMessages),
        classe: joi.string().min(5).required().messages(customMessages),
        specialite: joi.string().min(2).required().messages(customMessages)
    }
)

const schemaDataLogin = joi.object(
    {
        username: joi.string().min(5).required().messages(customMessages),
        password: joi.string().min(8).required().messages(customMessages),
    }
)

module.exports.createUser = async (req,res) => {
    const data = req.body
    
    const {error} = schemaDataCreateUser.validate(data)
    if(error) {
        if (req.file) userService.unlikePic(req.file.path)
        return res.status(400).json({error: error.details[0].message, path: error.details[0].path[0]})
    }
    
    try {
        const emailExist = await userModel.findOne({email: data.email})
        if (emailExist){
            if (req.file) userService.unlikePic(req.file.path)
            return res.status(400).json({error: "Cet email existe déjà", path: "email"})
        } 

        const password = userService.generateRandomString()

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new userModel({
            nom: data.nom.toLowerCase(),
            prenoms: data.prenoms.toLowerCase(),
            username: data.prenoms[0].toLowerCase() + data.nom.toLowerCase() + Math.floor(Math.random() * 10000),
            email: data.email.toLowerCase(),
            password: hashedPassword,
            classe: data.classe.toLowerCase(),
            specialite: data.specialite.toLowerCase()
        })

        if(req.file){
            user.cover = req.file.path
        }

        const userSaved = await user.save()

        userService.sendMailToUser(userSaved, password)

        res.json({userSaved})

    } catch (error) {
        if (req.file) userService.unlikePic(req.file.path)
        res.status(400).json({error})
    }
}

//Connexion user
module.exports.loginUser = async(req, res)=>{
    const data = req.body
    const {error} = schemaDataLogin.validate(data)

    if(error) return res.status(400).json({error: error.details[0].message.replace(/["']/g, ''), path: error.details[0].path[0]})

    try {
        const usernameExist = await userModel.findOne({username: data.username})
        if(!usernameExist) return res.status(400).json({error: "Nom d'utilsateur ou mot de passe incorrecte", path: "auth"})

        const passwordVerification = await bcrypt.compare(data.password, usernameExist.password)
        if(!passwordVerification) return res.status(400).json({error: "Nom d'utilsateur ou mot de passe incorrecte", path: "auth"})
        
        const token = jwt.sign({userId: usernameExist._id}, SECRET_KEY, {expiresIn : '3h'})
        
        res.json({token: token, message: "Authentification réussie pour l'utilisateur"})
    } catch (error) {
        res.status(400).json({error})
    }
}

/*
    Cette fonction permet de recupérer les données d'un compte user. Cela sera utiliser apres la connexion  pour récupérer les données de l'user connecté
*/
module.exports.getUser = async(req, res)=>{
    const id = req.params.id
    try {
        const user = await userService.getUser(id)
        if(!user) return res.status(400).json({message: "Utilisateur introuvable"})
        res.json({user})
    } catch (error) {
        res.status(400).json({error})
    }
}

//Fonction pour recuperer les users et faire la recherche de user
module.exports.getUsers = async(req, res)=>{
    console.log("fdgvdfgbfcg");
    const {motCle} = req.query;
    const ids = req.query.ids?.split(',')
    
    
    try {
        let query = {}

        if (ids && !ids[0] == '') {
            query._id = { $in: ids }
        }
        
        if (motCle) {
            query.$or = [
                { nom: { $regex: motCle, $options: 'i' } }, // $regex pour une correspondance partielle, $options: 'i' pour insensible à la casse
                { prenoms: { $regex: motCle, $options: 'i' } },
                { username: { $regex: motCle, $options: 'i' } },
                { email: { $regex: motCle, $options: 'i' } },
                { specialite: { $regex: motCle, $options: 'i' } },
                { classe: { $regex: motCle, $options: 'i' } }
            ]
        }

        const users = await userModel.find(query).sort({createdAt: -1})
        
        res.json({users})
    } catch (err) {
        res.status(400).json({err})
    }

}
//----------------------------------------------
module.exports.updateUser = async(req, res) =>{
    const id = req.userId
    const body = req.body

    try {
        const userExist = await userModel.findOne({_id: id})
        if(!userExist) return res.status(400).json({message: 'Cet utilisateur est introuvable'})

        if(Object.keys(body).length === 0 && !req.file) return res.status(400).json({message:'Aucune donnée à modifier'})

        if(req.file){
            if (userExist.cover) userService.unlikePic(userExist.cover)
            await userModel.findByIdAndUpdate(userExist, {cover : req.file.path})
        }

        if (body.oldPassword) {
            
            const passwordVerification = await bcrypt.compare(body.oldPassword, adminExist.password)
            if(!passwordVerification) return res.status(400).json({message:"Mot de passe incorrecte"})

            if(body.password !== body.passwordRepeat) return res.status(400).json({message:'Les mots de passes doivent être les mêmes'})

            
            const hashedPassword = await bcrypt.hash(body.password, 10)

            const passwordVerificationFinal = await bcrypt.compare(body.password, userExist.password)
            if(passwordVerificationFinal) return res.status(400).json({message:"Votre nouveau mot de passe ne peut pas être le même que l'ancien"})

            await userModel.findByIdAndUpdate(userExist, {password: hashedPassword})
            
        }else{
            await userModel.findByIdAndUpdate(userExist, body)
        }

        const user = await userService.getUser(id)
        res.json({"user" : user, message: "Modification effectuée"})
    } catch (err) {
        res.status(400).json({err})
    }
}

//Fonction pour supprimer des users
module.exports.deleteUsers = async(req, res)=>{
    try {
        const idsToDelete = req.query.ids?.split(',')
        if(!idsToDelete || idsToDelete[0] == '') return res.status(400).json({message : "Veuillez fournir des utilisateurs à supprimer"})
        
        //verifications de l'existence des ids
        for(const id of idsToDelete){
            
            const result = await userModel.findById(id)
            if(!result) return res.status(400).json({message : "Un ou plusieurs utilisateurs n'existent pas"})
            
        }
        
        for(const id of idsToDelete){
            
            const result = await userModel.findByIdAndDelete(id)
            if (result) {
                if (result.cover) {
                    userService.unlikePic(result.cover)
                }
            }
        }

        res.json({ message : "Suppression terminée", userDeleted: idsToDelete})
    } catch (err) {
        res.status(400).json({err})
    }
}