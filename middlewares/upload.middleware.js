const multer = require("multer")

const Storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename: (req, file, cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 100);
      // Use the original filename with a unique suffix
      cb(null, uniqueSuffix+ '-' +file.originalname);
    }
})
const upload = multer({storage: Storage})

module.exports = upload