//Se llama la variable express para el servidor
const express = require('express');
//importacion de la ruta de usuarios
const usersRouter = require("./users.router.js");
//importar de la ruta truck
// const vehiclesRouter = require("./vehicles.router.js");


function routerApi(app){
    const router = express.Router();
    app.use('/api/v1',router)
    router.use('/users',usersRouter);
    // router.use('/vehicles',vehiclesRouter);
}
module.exports=routerApi;
