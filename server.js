//importacion de la ruta para controlar el flujo
const routerAPI = require("./routes/index")

//Mandamos a llamar a express para iniciar el servidor
const express = require('express');
//Variable para el envio de informacion
const {send} = require('process');
//Se crea variable para llamar a las funciones de express
const app = express();
//variable para el puerto o por defecto el puerto 3000
const port =process.env.PORT || 3000;
//
const server = require('http').Server(app);
//Instalacion de cors
const cors = require('cors')

const { logErrors, errorHandle } = require('./middleware/error.handler')


app.use(cors());
app.use(express.json())
routerAPI(app);

//Aqui vamos a declarar los middlewares
app.use(logErrors);
app.use(errorHandle);


//Inicio de estaticos para poder renderizar los archivos de imagen
app.use('/descargas',express.static("imagen"));

server.listen(port,()=>{
    console.log('Servidor inicial');

})
