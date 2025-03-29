const express = require('express');
const Boom = require('@hapi/boom')
const { server } = require('../db/firebase')


const router = express.Router();
const {configureUploadServices} = require('./../middleware/configureUpload.js')

const Service = require("../services/services.service.js");
const service = new Service();

router.post('/', configureUploadServices ,(req,res,next)=>{
  const uploadMiddleware = req.upload.any()

  uploadMiddleware(req,res,async(err)=>{
    if(err){
      return next(Boom.badRequest(err.message))
    }

    const { body, files } = req
    let data ={}
    if(files){
      files.forEach(item=>{
        data[item.fieldname] = `${server}uploads/services/${item.filename}`
      })
    }
    data ={...body,...data}

    try {
      const create = await service.create(data)
      res.status(201).json({
        success:true,
        message:'Registro creado correctamente',
        data:create
      })
    } catch (error) {
      next(Boom.internal('Algo salio mal al intentar crear el registro',error.message))
    }
  })
})

router.get('/',async(req,res,next)=>{
  try {
    const services = await service.getAll()
    if(!services){
      return next(Boom.notFound('No se encotraron registros '))
    }
    res.status(200).json({
      success:true,
      data:services
    })
  } catch (error) {
    return next(Boom.internal('Algo salio mal al buscar los registros', error))

  }
})

router.get('/:id',async(req,res,next)=>{
  const { id } = req.params
  try {
    const oneService = await service.getOne(id)
    if(!oneService){
      return next(Boom.notFound('Registro no encontrado'));
    }
    res.status(200).json({
      success:true,
      data:oneService
    })
  } catch (error) {
    next(Boom.internal('Algo salio mal al intentar obtener el registro', error));
  }
})

router.patch('/:id', configureUploadServices,(req,res,next)=>{
  const uploadMiddleware = req.upload.any()

  uploadMiddleware(req,res,async(err)=>{
    if(err){
      return next(Boom.badRequest(err.message))
    }

    const { body, files } = req
    const { id } = req.params

    let data ={}
    if(files){
      files.forEach(item=>{
        data[item.fieldname] = `${item.filename}`
      })
    }
    data ={...body,...data}


    try {
      const update = await service.updateOne(id,data)
      if (!update) {
        return next(Boom.notFound('No se encontro el registro'));
      }
      res.status(201).json({
        success:true,
        message:'Registro creado correctamente',
      })
    } catch (error) {
      next(Boom.internal('Algo salio mal al intentar modificar el registro',error.message))
    }
  })
})

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await service.deleteOne( id);
    if (!deleted) {
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

router.get('/new/form-data',async(req,res,next)=>{
  try {
    const formData = await service.getFormData()
    if(!formData){
      return next(Boom.notFound('No se encotraron registros '))
    }
    res.status(200).json({
      success:true,
      data:formData
    })
  } catch (error) {
    return next(Boom.internal('Algo salio mal al buscar los registros', error))

  }
})

router.patch('/add/new/deposits/:id', configureUploadServices,(req,res,next)=>{
  const uploadMiddleware = req.upload.any()

  uploadMiddleware(req,res,async(err)=>{
    if(err){
      return next(Boom.badRequest(err.message))
    }

    const { body, files } = req
    const { id } = req.params

    let data ={}
    if(files){
      files.forEach(item=>{
        data[item.fieldname] = `${server}uploads/services/${item.filename}`
      })
    }
    data ={...body,...data}


    try {
      const update = await service.updateOneDeposit(id,data)
      if (!update) {
        return next(Boom.notFound('No se encontro el registro'));
      }
      res.status(201).json({
        success:true,
        message:'Registro creado correctamente',
        data:update
      })
    } catch (error) {
      next(Boom.internal('Algo salio mal al intentar modificar el registro',error.message))
    }
  })
})

router.patch('/add/new/expenses/:id',async(req,res,next)=>{
  const { body } = req
  const { id } = req.params

  try {
    const update = await service.updateOneExpenses(id,body)
    if (!update) {
      return next(Boom.notFound('No se encontro el registro'));
    }
    res.status(201).json({
      success:true,
      message:'Registro creado correctamente',
      data:update
    })
  } catch (error) {
    next(Boom.internal('Algo salio mal al intentar modificar el registro',error.message))
  }
})

router.get('/services/for/pay/',async(req,res,next)=>{
  try {
    const services = await service.getAllForPay()
    if(!services){
      return next(Boom.notFound('No se encotraron registros '))
    }
    res.status(200).json({
      success:true,
      data:services
    })
  } catch (error) {
    return next(Boom.internal('Algo salio mal al buscar los registros', error))

  }
})

router.get('/services/for/year/:year',async(req,res,next)=>{
  try {
    const {year} = req.params
    const services = await service.getAllForYear(year)
    if(!services){
      return next(Boom.notFound('No se encotraron registros '))
    }
    res.status(200).json({
      success:true,
      data:services
    })
  } catch (error) {
    return next(Boom.internal('Algo salio mal al buscar los registros', error))

  }
})

router.get('/drivers/for/pay/:idDriver',async(req,res,next)=>{
  try {
    const { idDriver } = req.params
    const services = await service.getDriverPays(idDriver)
    if(!services){
      return next(Boom.notFound('No se encotraron registros '))
    }
    res.status(200).json({
      success:true,
      data:services
    })
  } catch (error) {
    next(Boom.internal('Algo salio mal al buscar los registros', error))
  }
})

router.patch('/update/finished/service/:id',configureUploadServices,(req,res,next)=>{
  const uploadMiddleware = req.upload.any()

  uploadMiddleware(req,res,async(error)=>{
    if(error){
      return next(Boom.badRequest(err.message))
    }

    const { body,files } = req
    const {id } = req.params


    let data = {}

    files.forEach(file =>{
      data[file.fieldname] = file.filename
    })
    data={...body,...data}

    try {
      const finish = await service.finishService(id,data)

      res.status(200).json({
        success:true,
        message:'Actualizado',
        data:finish
      })
    } catch (error) {
      next(Boom.internal('Algo salio mal al intentar modificar el registro',error.message))
    }



  })
})



module.exports=router;


