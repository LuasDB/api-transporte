const { db } = require('../db/firebase')
//deficnicion de la clase trucks
class Service{
    constructor(){
      this.collection = 'services'
    }

    async create(data){
      console.log('Lega:',data)
      const addNewUser = await db.collection(this.collection).add(data);
      console.log(addNewUser)
      if(addNewUser.id){
        return {
          data:{
            ...data,id:addNewUser.id
          },
          success:true,
          message:'Creado con exito'
      }
      }else{
        return {success:false,message:'No creado'}
      }
    }
    async getAll(){
      const getUsers = await db.collection(this.collection).where('status','==','Activo').get();

      const users = getUsers.docs.map(item => ({id:item.id,...item.data()}))
      return {
        success:true,
        data: users
      }
    }
    async getOne(id){
      const getUser = await db.collection(this.collection).doc(id).get();

      if(!getUser.exists){
        return { success:false,message:'No encontrado'}
      }
      return {
        success:true,
        data:getUser.data()
      }


    }
    async updateOne(id,newData){
      console.log('Recibido para Update:',newData)
      const update = await db.collection(this.collection).doc(id).update(newData);
      return { success:true, message:'Actualizado',data:update}
    }
    async deleteOne(id){
       await this.updateOne(id,{status:'Baja'})
       return { success:true, message:'Eliminado'}
    }

    async getAggregate(){
      const vehicles = await db.collection('vehicles').where('status','==','Activo').get()
      const drivers = await db.collection('drivers').where('status','==','Activo').get()
      const customers = await db.collection('customers').where('status','==','Activo').get()

      const data = {
        customers:customers.docs.map(item => ({id:item.id,...item.data()})),
        drivers:drivers.docs.map(item => ({id:item.id,...item.data()})),
        vehicles:vehicles.docs.map(item => ({id:item.id,...item.data()})),
      }
      return { success:true,data:data,message:'Recolectado' }


    }
}
module.exports =Service
