const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = (collection) => {
  const uploadPath = `uploads/${collection}`;
  if(!fs.existsSync(uploadPath)){
    //metodo que crea el nuevo directorio
    fs.mkdirSync(uploadPath,{recursive:true})
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const identificador = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '_' + identificador + path.extname(file.originalname));
    }
  });
};

const upload = (collection) => {
  return multer({ storage: storage(collection) });
};

module.exports = upload;
