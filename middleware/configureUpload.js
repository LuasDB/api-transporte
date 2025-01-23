const upload = require('./../functions/multer-config');

// Middleware para configurar multer dinámicamente
const configureUpload = (req, res, next) => {
  const { collection } = req.params;
  req.upload = upload(collection);
  next();
};

// Middleware para configurar multer dinámicamente
const configureUploadServices = (req, res, next) => {

  req.upload = upload('services');
  next();
};

module.exports = {configureUpload,configureUploadServices}

