//Llamado de express
const express = require('express')
//Metodo routet de express
const router = express.Router();
//dimportacion del servicio trucks
const Trucks = require('../services/trucks.service.js');
//creo nueva instancia para el truck
const truck = new Trucks();
//creacion de endpoint
router.get('/',async(req,res)=>{
    //Obtener todos los los trucks
    const trucks =await truck.getAll();
    res.status(200).json(trucks);

})
router.get('/:IDtruck',async(req,res)=>{
    const ID = req.params.IDtruck;
    const getTruck = await truck.getOne(ID);
    res.status(200).json(getTruck);

})
module.exports=router