const express = require('express');
const router = express.Router();
const Boom = require('@hapi/boom')
const {configureUpload} = require('./../middleware/configureUpload.js')
const { server } = require('../db/firebase')

const Managment = require("../services/managment.service.js");
const managment = new Managment()

router.post('/:collection', configureUpload, (req, res, next) => {
  const uploadMiddleware = req.upload.any();

  uploadMiddleware(req, res, async (err) =>{
    if (err) {
      return next(Boom.badRequest(err.message));
    }

    const { collection } = req.params;
    const {body,files} = req;
    console.log('Body',body)
    let data= {
    }
    if(files){
      files.forEach(item=>{

        data[item.fieldname] = `${item.filename}`
      })
    }
    console.log(data)
    data= {...body,...data}
    console.log('NEW',data)

    try {
      const create = await managment.create(collection, data);
      res.status(201).json({
        success: true,
        message: 'Se ha creado correctamente',
        data: create
      });
    } catch (error) {
      next(Boom.internal('Algo salio mal mientras se creaba el registro', error));
    }
  });
});

router.get('/:collection/', async (req, res, next) => {
  const { collection } = req.params;

  try {
    const doc = await managment.getAll(collection);
    if (!doc) {
      return next(Boom.notFound('Registro no encontrado'));
    }
    res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    next(Boom.internal('Algo salio mal al buscar los registros', error));
  }
});

router.get('/:collection/:id', async (req, res, next) => {
  const { collection, id } = req.params;

  try {
    const doc = await managment.getOne(collection, id);
    if (!doc) {
      return next(Boom.notFound('Registro no encontrado'));
    }
    res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    next(Boom.internal('Algo salio mal al intentar obtener el registro', error));
  }
});

router.get('/all-collections/for/all', async (req, res, next) => {
  try {
    const docs = await managment.getAllCollections();
    if (!docs) {
      return next(Boom.notFound('Registros no encontrados'));
    }
    res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    next(Boom.internal('Algo salio mal al intentar obtener los registros', error));
  }
});

router.patch('/:collection/:id',configureUpload, async (req, res, next) => {
  const uploadMiddleware = req.upload.any();
  uploadMiddleware(req, res, async (err) =>{
    if (err) {
      return next(Boom.badRequest(err.message));
    }


    const { collection,id } = req.params;
    const {body,files} = req;
    console.log('Body',body)
    let data= {
    }
    if(files){
      files.forEach(item=>{
        data[item.fieldname] = item.filename
      })
    }
    data= {...body,...data}
    console.log('[UPDATE]',data)


    try {
      const updatedDoc = await managment.update(collection, id, data);
      if (!updatedDoc) {
        return next(Boom.notFound('No se encontro el registro'));
      }
      res.status(200).json({
        success: true,
        message: 'Actualizado correctamente',
        data: updatedDoc
      });
    } catch (error) {
      next(Boom.internal('An error occurred while updating the resource', error));
    }

  })



});

router.delete('/:collection/:id', async (req, res, next) => {
  const { collection, id } = req.params;

  try {
    const deletedDoc = await managment.delete(collection, id);
    if (!deletedDoc) {
      return next(Boom.notFound('No se encontro el registro'));
    }
    res.status(200).json({
      success: true,
      message: 'Se elimino correctamente'
    });
  } catch (error) {
    next(Boom.internal('Algo salio mal al intentar eliminar el registro', error));
  }
});

module.exports = router
