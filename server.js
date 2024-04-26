const routerAPI = require("./routes/index")
const express = require('express');
const {send} = require('process');
const app = express();
const port =3000;
const server = require('http').Server(app);
//aqui se golpean los endpoints
app.get('/',(req,res)=>{
    res.send('Este es el send');
})
app.get('/inicio',(req,res)=>{
    res.send('Este es el inicio');
})
app.get('/registros',(req,res)=>{
    res.send('Se ven los registros aqui');
})
app.get('/registros2',(req,res)=>{
    res.send('Se ven los registros aqui 2');
})
app.use(express.json())
routerAPI(app);


server.listen(port,()=>{
    console.log('Servidor inicial');
    
})
