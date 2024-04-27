const { verifyAdminToken, isSuperAdmin } = require("../../middlewares/authAdmin.middleware");
const { loginAdmin, registerAdmin, getAdmin, getAdmins, updateAdmin, deleteAdmins } = require("./controller");

const router = require('express').Router()

router.post('/register',verifyAdminToken, isSuperAdmin,registerAdmin)
router.post('/login',loginAdmin)
router.get('/:id',verifyAdminToken,getAdmin)
router.get('/admins',verifyAdminToken,getAdmins)
router.put('/:id', verifyAdminToken, updateAdmin)
router.delete('/', verifyAdminToken, isSuperAdmin, deleteAdmins)

module.exports = router