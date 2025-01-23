//Se llama la variable express para el servidor
const express = require('express');
const authRouter = require('./auth.router.js')
const managmentRouter = require('./managment.router.js')
const servicesRouter = require('./services.router.js')
const settlementRouter = require('./settlements.router.js')

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1',router)
    router.use('/auth',authRouter)
    router.use('/managment',managmentRouter)
    router.use('/services',servicesRouter)
    router.use('/settlement',settlementRouter)

}
module.exports=routerApi;
