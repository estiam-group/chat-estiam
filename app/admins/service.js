const adminModel = require("../../models/admin.model")

class AdminService{
    async getAdmin(id){
        const admin = await adminModel.findById(id)
        return admin
    }
}

module.exports = AdminService