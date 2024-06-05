const { db } = require('../db/firebase')
//deficnicion de la clase trucks
class Vehicle{

    constructor(){
    }
    async getAll(){
      const getVehicles = await db.collection('vehicles').get();
      const vehicles = await getVehicles.docs.map()

      return { success:true, data: }
    }
    getOne(ID){
        const truck = this.datos.find(item=> item.id === ID)
        return truck;
    }
}
module.exports =Truck
