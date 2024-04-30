
//llamado de express
const express = require('express');
//Metodo router de express
const router = express.Router();
//importacion del servicio
const User = require("../services/users.service.js");

const user = new User();
router.get('/',(req,res)=>{
    let users = user.getAll();
    res.status(200).json(users);

})
router.post('/',(req,res)=>{
    let data =req.body;
    console.log(data);
    let newUser = user.createOne(data);
    res.status(201).json(newUser);
})


module.exports=router;


