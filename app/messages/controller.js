const { AES_KEY } = require("../../config.env");
const messageModel = require("../../models/message.model");
const MessageService = require("./service");
const messageService = new MessageService

module.exports.getMessages = async(req, res) =>{
    try {
        const messages = await messageService.getMessages(req.params.idRoom)
        res.json({messages})
    } catch (error) {
        res.status(400).json({error})
    }
}

module.exports.sendMessage = async(req, res)=>{
    if(!req.body.contenu && !req.files) return res.status(400).json({message : "Message vide non autorisé"})
    try {
        if(req.files && req.files.length !== 0){

            const tab = []
            req.files.forEach(file => {

                let type;

                if (file.originalname.substr(-3,3) === 'pdf') {
                    type = 'document'
                }else{
                    type = 'image'
                }

                const line = {path: file.path, name: file.originalname, size: file.size, type: type}
                tab.push(line)
            })

            req.files = tab
        }
        
        // console.log(req);

        const message = await messageService.addMessage(req)

        res.json({message: message, room: message.id_room})
        
    } catch (error) {
        res.status(400).json({error})
    }
}