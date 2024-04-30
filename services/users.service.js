//importacion de los datos
const db= require('../db/users.json')
//definicion de la clase con varios objetos
class User {
    constructor(){
        this.name = "Marco"
    }
    getName(){
        return this.name
    }
    //Envio a bd nuevos datos
    createOne(data){
        console.log(data)

        return {
            newData:data,
            msg:"Usuario creado"
        }
    }
    getAll(){
        const datos = db.Users;
        return datos;

    }
    getOne(){

    }
    updateOne(){}
    delete(){}

}

module.exports = User;