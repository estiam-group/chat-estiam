const crypto = require('crypto');
const messageModel = require("../../models/message.model");
const { IV, AES_KEY } = require('../../config.env');

class MessageService{
    async addMessage(req){
        const data = req.body
    
        const newMessage = new messageModel({
            id_user: req.adminId || req.userId,
            id_room: req.params.idRoom,
            type: data.type,
            contenu: this.encryptMessage(data.contenu, AES_KEY) || "",
            isResponseTo: data.isResponseTo || null,
            files: req.files || null
        })
    
        const message = await newMessage.save()
        return message
    }

    async getMessages(id_room){
        const messages = await messageModel.find({id_room: id_room})

        const decryptedMessages = messages.map(message => {

            return message.contenu ?{
                _id: message._id,
                contenu : this.decryptMessage(message.contenu, AES_KEY),
                id_room: message.id_room,
                id_user : message.id_user,
                files: message.files,
                type: message.info,
                isResponseTo: message.isResponseTo,
                deleted: message.deleted,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt
            }
            :message
        })
        return decryptedMessages
    }

    encryptMessage(message, key) {
        try {
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(IV)); // Utilisez votre propre vecteur d'initialisation (IV) ici
            let encrypted = cipher.update(message, 'utf-8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        } catch (error) {
            console.error('Erreur lors du chiffrement du message :', error);
            return null;
        }
    }
    
    // Fonction pour décrypter un message
    decryptMessage(encryptedMessage, key) {
        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(IV));
            let decrypted = decipher.update(encryptedMessage, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            return decrypted;
        } catch (error) {
            console.error('Erreur lors du déchiffrement du message :', error);
            return null;
        }
    }
}

module.exports = MessageService