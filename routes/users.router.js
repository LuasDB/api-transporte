
//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const User = require("../services/users.service.js");
//importar multer
const multer = require('multer');
//crea nuevo instancia de la clase usuario
const user = new User();
/**
 * Endpoint (Rutas de para la funcion)
 * 
 */
router.get('/',(req,res)=>{
    let users = user.getAll();
    res.status(200).json(users);

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
const uploadNone = multer()

const uploadFile = multer({storage:storagePrep});

//usar el upload
router.post('/',uploadNone.none(),(req,res)=>{

    let data =req.body;
    console.log(data);
    let newUser = user.createOne(data);
    res.status(201).json(newUser);
})
router.post('/imagen',uploadFile.single('foto'),(req,res,next)=>{
    console.log("Entrando a imagen")
    const {body} = req
    body["imagen"]=req.file.filename
    body["urlImagen"]=`http://localhost:3000/descargas/${req.file.filename}`
    res.status(201).json({message:"Fotos agregada",body});

})


module.exports=router;


