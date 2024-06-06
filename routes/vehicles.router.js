//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const Vehicle = require("../services/vehicles.service.js");
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
const uploadDir = 'uploads/vehicles'
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
const vehicle = new Vehicle();
/**
 * Endpoints (Rutas de para la funcion)
 */
router.get('/',async(req,res,next)=>{
  //usamos siempre Try catch para cachear si llega a haber algun error en las funciones asincronas
  try {
   const getAll = await vehicle.getAll()
   res.status(200).json(getAll);

  } catch (error) {
   next(error)
  }
})
router.post('/',upload.any(),async(req,res,next)=>{
  try {

    let data =req.body;
    const files = req.files

    let objFiles ={}
    files.forEach(item=>{
      if(item.fieldname === 'tarjeta'){
        objFiles['archivoTarjeta']=item.filename
      }
      if(item.fieldname === 'fotoVehiculo'){
        objFiles['fotoVehiculo']=item.filename
      }
    })
    let create = await vehicle.create({...objFiles,...data});
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
    const getOne = await vehicle.getOne(id);
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
      if(item.fieldname === 'tarjeta'){
        obj['archivoTarjeta']=item.filename
      }
      if(item.fieldname === 'fotoVehiculo'){
        obj['fotoVehiculo']=item.filename
      }
    })
  }
  obj={...obj,...body}
  try {
    const update = await vehicle.updateOne(id,obj);
    res.status(200).json(update);


  } catch (error) {
    next(error)
  }
})
router.delete('/:id',async(req,res,next)=>{

  const { id } = req.params

  try {

  const deleteOne = await vehicle.deleteOne(id);

  res.status(200).json(deleteOne);

  } catch (error) {
   next(error)
  }




})









module.exports=router;


