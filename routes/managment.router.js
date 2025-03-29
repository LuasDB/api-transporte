const express = require('express');
const router = express.Router();
const Boom = require('@hapi/boom');
const { configureUpload } = require('./../middleware/configureUpload.js');

const Managment = require("../services/managment.service.js");
const managment = new Managment();

// 📌 POST - Crear un nuevo documento en una colección
router.post('/:collection', configureUpload, async (req, res, next) => {
  try {
    const uploadMiddleware = req.upload.any();
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return next(Boom.badRequest(err.message));
      }

      const { collection } = req.params;
      const { body, files } = req;

      let data = { ...body };
      let images =[]
      if (files) {
        console.log(files)
        images = files.map(file=>({path:file.path,filename:file.filename}))
      }
      data['images']=images


      try {
        const create = await managment.create(collection, data);
        res.status(201).json({
          success: true,
          message: 'Se ha creado correctamente',
          data: create
        });
      } catch (error) {
        next(Boom.internal('Error al crear el registro', error));
      }
    });
  } catch (error) {
    next(Boom.internal("Error en la carga de archivos", error));
  }
});

// 📌 GET - Obtener todos los documentos de una colección
router.get('/:collection', async (req, res, next) => {
  try {
    const { collection } = req.params;
    const docs = await managment.getAll(collection);

    if (!docs || docs.length === 0) {
      return next(Boom.notFound('No se encontraron registros'));
    }

    res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    next(Boom.internal('Error al buscar los registros', error));
  }
});

// 📌 GET - Obtener un documento por ID
router.get('/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const doc = await managment.getOne(collection, id);

    if (!doc) {
      return next(Boom.notFound('Registro no encontrado'));
    }

    res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    next(Boom.internal('Error al obtener el registro', error));
  }
});

// 📌 GET - Obtener todas las colecciones disponibles
router.get('/all-collections/for/all', async (req, res, next) => {
  try {
    const docs = await managment.getAllCollections();

    if (!docs) {
      return next(Boom.notFound('No se encontraron colecciones'));
    }

    res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    next(Boom.internal('Error al obtener las colecciones', error));
  }
});

 // 📌 PATCH - Actualizar un documento por ID
router.patch('/:collection/:id', configureUpload, async (req, res, next) => {
  try {
    const uploadMiddleware = req.upload.any();
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return next(Boom.badRequest(err.message));
      }

      const { collection, id } = req.params;
      const { body, files } = req;

      let data = { ...body };
      if (files) {
        files.forEach(item => {
          data[item.fieldname] = item.filename;
        });
      }

      try {
        const updatedDoc = await managment.update(collection, id, data);
        if (!updatedDoc) {
          return next(Boom.notFound('No se encontró el registro'));
        }

        res.status(200).json({
          success: true,
          message: 'Actualizado correctamente',
          data: updatedDoc
        });
      } catch (error) {
        next(Boom.internal('Error al actualizar el registro', error));
      }
    });
  } catch (error) {
    next(Boom.internal('Error en la carga de archivos', error));
  }
});

// 📌 DELETE - Eliminar un documento por ID (cambio de estado a "Baja")
router.delete('/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const deletedDoc = await managment.delete(collection, id);

    if (!deletedDoc) {
      return next(Boom.notFound('No se encontró el registro'));
    }

    res.status(200).json({
      success: true,
      message: 'Se eliminó correctamente'
    });
  } catch (error) {
    next(Boom.internal('Error al eliminar el registro', error));
  }
});

module.exports = router;
