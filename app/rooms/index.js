const router = require('express').Router()

const { verifyAdminToken } = require("../../middlewares/authAdmin.middleware");
const verifyUserToken = require("../../middlewares/authUser.middleware");
const upload = require("../../middlewares/upload.middleware");
const { getRooms, addRoom, addOrRemoveUserToRoom } = require("./controller");

router.get('/admin', verifyAdminToken, getRooms)
router.post('/admin', verifyAdminToken, upload.single('image'), addRoom) 
router.patch('/add-user-to-room/:id_room/admin', verifyAdminToken, addOrRemoveUserToRoom)

router.get('/user', verifyUserToken, getRooms)

module.exports = router