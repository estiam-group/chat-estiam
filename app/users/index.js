const { verifyAdminToken } = require("../../middlewares/authAdmin.middleware");
const verifyUserToken = require("../../middlewares/authUser.middleware");
const upload = require("../../middlewares/upload.middleware");
const { createUser, getUsers, deleteUsers, getUser, updateUser, loginUser } = require("./controller");

const router = require('express').Router()

router.post('/login',loginUser)

router.get('/:id',verifyUserToken,getUser)
router.put('/:id', verifyUserToken, upload.single('image'), updateUser)

router.get('/users', verifyAdminToken, getUsers)
router.post('/create-user', verifyAdminToken, upload.single('image'), createUser)
router.delete('/', verifyAdminToken, deleteUsers)

module.exports = router