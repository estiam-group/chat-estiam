const nodemailer = require('nodemailer');
const fs = require('fs');
const userModel = require('../../models/user.model');

class UserService{
    async getUser(id){
        const user = await userModel.findById(id)
        return user
    }

    sendMailToUser(user, mdp){

        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Remplacez par le service SMTP que vous utilisez
            auth: {
                user: 'mounirouabdul40@gmail.com', // Votre adresse e-mail
                pass: 'lxqp whye xkev lvab ' // Votre mot de passe
            }
        });
    
        const emailHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Informations d'accès</title>
                </head>
                <body>
                    <h1>Confirmation de création de compte</h1>
                    <p>Cher ${user.nom},</p>
                    <p>Votre compte a été créé avec succès.</p>
                    <p>Voici vos informations d'accès :</p>
                    <ul>
                        <li>Identifiant : ${user.username}</li>
                        <li>Mot de passe : ${mdp}</li>
                    </ul>
                    <p>Vous pouvez vous connecter en utilisant votre identifiant et votre mot de passe.</p>
                    <p>Merci de rejoindre notre service.</p>
                </body>
            </html>
        `;
    
        // Paramètres de l'e-mail
        const mailOptions = {
            from: process.env.USER_MAIL, // Votre adresse e-mail
            to: user.email, // Adresse e-mail du destinataire
            subject: 'Informations d\'accès',
            html: emailHTML
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
            } else {
                console.log('E-mail envoyé avec succès :', info.response);
            }
        });
    
    }

    unlikePic(path){
        if (fs.existsSync(path)) {
            fs.unlink(path,  (err) => {
                if (err) {
                throw new Error('Erreur lors de la suppression du fichier');
                }
            })
        }
    }

    generateRandomString(length = 10) {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&?';
        let result = '';
        
        // Ajouter une lettre aléatoire en première position
        result += characters.charAt(Math.floor(Math.random() * 52));
        
        // Ajouter des caractères aléatoires pour compléter la longueur spécifiée
        for (let i = 1; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        return result;
    }
}

module.exports = UserService