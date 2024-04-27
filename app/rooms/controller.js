const joi = require("joi")
const roomModel = require("../../models/room.model")
const AdminService = require("../admins/service")
const adminService = new AdminService

const MessageService = require("../messages/service")
const UserService = require("../users/service")
const userService = new UserService
const messageService = new MessageService

const customMessages = {
    'string.base': '{{#label}} doit être une chaîne de caractères',
    'string.min': '{{#label}} doit avoir une longueur d\'au moins {{#limit}} caractères',
    'string.max': '{{#label}} doit avoir une longueur d\'au plus {{#limit}} caractères',
    'string.required': '{{#label}} est requis',
};

const schemaDataRoom = joi.object(
    {
        titre: joi.string().min(3).required().messages(customMessages),
    }
)


module.exports.getRooms = async(req, res) => {
    try {
        if(req.adminId){

            const admin = await adminService.getAdmin(req.adminId)
            
            const rooms = (
                (admin.autorisation)?
                    await roomModel.find().sort({updatedAt: -1})
                :
                    await roomModel.find({'members.id': req.adminId}).sort({updatedAt: -1})
            )
            return res.json({rooms})
        }

        const rooms = await roomModel.find({members: {$in : [req.userId]}}).sort({updatedAt: -1})
        res.json({rooms})
        
    } catch (error) {
        res.status(400).json({error})
    }
}

module.exports.addRoom = async(req, res) =>{
    const id = req.adminId

    const {error} = schemaDataRoom.validate(req.body)
    if(error) {
        if (req.file) userService.unlikePic(req.file.path)
        return res.status(400).json({error: error.details[0].message, path: error.details[0].path[0]})
    }

    try {
        
        const newRoom = new roomModel({
            titre: req.body.titre.toLowerCase(),
            members: [{id: id, isAdmin: true}],
            id_createur: id,
        })

        if(req.file){
            newRoom.cover = req.file.path
        }

        const room = await newRoom.save()

        const requete = {
            userId: id,
            params:{
                idRoom: room._id,
            },
            body: {
                type: 'info',
                contenu: `Ce groupe vient d'etre créé !`
            }
        }

        
        await messageService.addMessage(requete)
        res.json({room})
    } catch (error) {
        if (req.file) userService.unlikePic(req.file.path)
        res.status(400).json({error})
    }
}

module.exports.addOrRemoveUserToRoom = async(req, res) => {
    const id_room = req.params.id_room
    const new_members = req.body.new_members
    const members_to_delete = req.body.members_to_delete
 
    try {
        if (new_members) {
            await roomModel.findOneAndUpdate(
                {_id: id_room},
                {$addToSet: {members: {$each: new_members}}}
            )
        }

        if (members_to_delete) {
            await roomModel.findOneAndUpdate(
                {_id: id_room},
                {$pull: {members: {$in: members_to_delete}}}
            )
        }
        
        const room = await roomModel.findById(id_room)
        res.json({room})
    } catch (error) {
        res.status(400).json({error})
    }
}