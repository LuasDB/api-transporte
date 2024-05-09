//importacion de datos de trucks
const bd=require('../db/transporte.json');
//deficnicion de la clase trucks
class Truck{
    //constructor que sirve crear variables internas para todas nuestras clases
    constructor(){
        this.datos = bd.vehicles

    }
    async getAll(){
       return new Promise(resolve=> setTimeout(() => {
        resolve(this.datos)
       }, 2000))    
          
    }
    getOne(ID){
        const truck = this.datos.find(item=> item.id === ID)
        return truck;
    }
}
module.exports =Truck