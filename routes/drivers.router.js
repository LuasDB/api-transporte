//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const Driver = require("../services/drivers.service.js");
//importar multer
const multer = require('multer');
//Creamos una instamcia de ,ulter para cuando no se reciben archivos
const uploadNone = multer();
//Para la manipulación de carpetas y archivos usamos estas instancias
const path = require('path');
const fs = require('fs');
//configuramos el storage de multer para la subida de archivos

//Definimos primero la carpeta de destino, usaremos la misma siempre pero con subcarpetas,para este endpoint usaremos
//la subcarpeta drivers
/**MODIFICAR EN CADA ENDPOINT**/
const uploadDir = 'uploads/drivers'
//Verificamos si la carpeta existe si no la creamos
if(!fs.existsSync(uploadDir)){
  //metodo que crea el nuevo directorio
  fs.mkdirSync(uploadDir,{recursive:true})
}

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,uploadDir)
  },
  filename:(req,file,cb)=>{
    const identificador = Date.now() + '-' + Math.round(Math.random()*1E9)


    cb(null,file.fieldname + '_' + identificador + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });
//crea nuevo instancia de la clase usuario
const driver = new Driver();
/**
 * Endpoints (Rutas de para la funcion)
 */
router.get('/',async(req,res,next)=>{
  //usamos siempre Try catch para cachear si llega a haber algun error en las funciones asincronas
  try {
   const getAllDrivers = await driver.getAll()
   res.status(200).json(getAllDrivers);

  } catch (error) {
   next(error)
  }
})
router.post('/',upload.any(),async(req,res,next)=>{
  try {

    const {body,files} = req
    let data ={}
    console.log('[ARCHIVOS RECIBIDOS',files.length)
    if(files.length !== 2){
      res.status(400).json({success:false,message:`No se recibieron los dos archivos,se recibe ${files.length}`})
    }

    files.forEach(item=>{
      if(item.fieldname === 'ine'){
        data['archivoIne']=item.filename
      }
      if(item.fieldname === 'licencia'){
        data['archivoLicencia']=item.filename
      }
    })

    data= {...data,...body}
    console.log('[RECIBIDO]:',data)
    let create = await driver.create(data);
    //Si se realiza el alta enviamos un res con el status code 201 de CREADO , en formato json donde encviamos lo que llego a newUser
    res.status(201).json(create);

  } catch (error) {
    next(error)
  }


})
router.get('/:id',async(req,res,next)=>{

    //Se destructurar req.params para sacar la variable "id" que viene descrita en la url del endpoint
    const { id } = req.params
    try {
      //Declaramos una variable donde recibirtemos lo que retorne el metodo getOne(id) de la instancia user
    const getOne = await driver.getOne(id);
    //Si se recibe bien enviamos de vuelta usando res
    res.status(200).json(getOne);

    } catch (error) {
      next(error)
    }




})
router.patch('/:id',upload.any(),async(req,res,next)=>{
  const { id } = req.params
  const { body,files } =req
  let obj ={}
  if(files){
    files.forEach(item=>{
      if(item.fieldname === 'ine'){
        obj['archivoIne']=item.filename
      }
      if(item.fieldname === 'licencia'){
        obj['archivoLicencia']=item.filename
      }
    })
  }
  obj={...obj,...body}

  try {
    const update = await driver.updateOne(id,obj);
    res.status(200).json(update);
    console.log('[message]:',update.message)

  } catch (error) {
    next(error)
  }
})
router.delete('/:id',async(req,res,next)=>{

  const { id } = req.params

  try {

  const deleteUser = await driver.deleteOne(id);

  res.status(200).json(deleteUser);

  } catch (error) {
   next(error)
  }




})









module.exports=router;


