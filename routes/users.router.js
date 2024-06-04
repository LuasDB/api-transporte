
//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const User = require("../services/users.service.js");
//importar multer
const multer = require('multer');
const { getToken } = require('firebase/app-check');
//Creamos una instamcia de ,ulter para cuando no se reciben archivos
const uploadNone = multer()


//crea nuevo instancia de la clase usuario
const user = new User();
/**
 * Endpoints (Rutas de para la funcion)
 */
router.get('/',async(req,res,next)=>{
  //usamos siempre Try catch para cachear si llega a haber algun error en las funciones asincronas
  try {
   const getAllUsers = await user.getAll()
   res.status(200).json(getAllUsers);

  } catch (error) {
   next(error)
  }
})
router.post('/',uploadNone.none(),async(req,res,next)=>{
  try {
    let data =req.body;
    console.log(data)
    let newUser = await user.createUser(data);
    //Si se realiza el alta enviamos un res con el status code 201 de CREADO , en formato json donde encviamos lo que llego a newUser
    res.status(201).json(newUser);

  } catch (error) {
    next(error)
  }


})
router.get('/:id',async(req,res,next)=>{

    //Se destructurar req.params para sacar la variable "id" que viene descrita en la url del endpoint
    const { id } = req.params
    try {
      //Declaramos una variable donde recibirtemos lo que retorne el metodo getOne(id) de la instancia user
    const getUser = await user.getOne(id);
    //Si se recibe bien enviamos de vuelta usando res
    res.status(200).json(getUser);

    } catch (error) {
      next(error)
    }




})
router.patch('/:id',uploadNone.none(),async(req,res,next)=>{
  const { id } = req.params
  const { body } =req

  try {
    const update = await user.updateOne(id,body);
    res.status(201).json(update);

  } catch (error) {
    next(error)
  }
})

router.delete('/:id',uploadNone.none(),async(req,res,next)=>{


  const { id } = req.params
  const { body } = req
  try {

  const deleteUser = await user.deleteOne(id,body);

  res.status(200).json(deleteUser);

  } catch (error) {
   next(error)
  }




})
//usar multer para verificar
/////////////////////7/////////////////////////////////////////////////////////////7
/**
 * Configuracion multer para subida, guardado y vista de archivos
 *
 */


//agregar metodo diskstorage
const storagePrep = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'imagen')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + "_" + file.originalname)
    }
})
/**
 *
 */


const uploadFile = multer({storage:storagePrep});


router.post('/imagen',uploadFile.single('foto'),(req,res,next)=>{
    console.log("Entrando a imagen")
    const {body} = req
    body["imagen"]=req.file.filename
    body["urlImagen"]=`http://localhost:3000/descargas/${req.file.filename}`
    res.status(201).json({message:"Fotos agregada",body});

})


module.exports=router;


