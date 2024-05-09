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
//aqui se golpean los endpoints
app.get('/',(req,res)=>{
    res.send('Este es el send');
})
//Endpoint de inicio
app.get('/inicio',(req,res)=>{
    res.send('Este es el inicio');
})
//Endpoint de registros
app.get('/registros',(req,res)=>{
    res.send('Se ven los registros aqui');
})
app.get('/registros2',(req,res)=>{
    res.send('Se ven los registros aqui 2');
})
app.use(express.json())
routerAPI(app);


//Inicio de estaticos para poder renderizar los archivos de imagen
app.use('/descargas',express.static("imagen"));

server.listen(port,()=>{
    console.log('Servidor inicial');
    
})
