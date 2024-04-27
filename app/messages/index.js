const { verifyAdminToken } = require('../../middlewares/authAdmin.middleware')
const verifyUserToken = require('../../middlewares/authUser.middleware')
const upload = require('../../middlewares/upload.middleware')
const { getMessages, sendMessage } = require('./controller')

const router = require('express').Router()

router.get('/:idRoom/admin',  verifyAdminToken, getMessages)
router.post('/send-message/:idRoom/admin',verifyAdminToken, upload.array('files'), sendMessage)

router.get('/:idRoom/user',  verifyUserToken, getMessages)
router.post('/send-message/:idRoom/user',verifyUserToken, upload.array('files'), sendMessage)

module.exports = router