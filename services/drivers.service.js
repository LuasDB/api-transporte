//importacion de la base de firestore
const { experimentalSetDeliveryMetricsExportedToBigQueryEnabled } = require('firebase/messaging/sw');
const { db } = require('../db/firebase');
//definicion de la clase con varios objetos
class Driver {
  constructor(){

  }

/*****************************************************************************************************************
 * SUPER IMPORTANTE
 *Cada metodo de nuestra clase User devolvera algo para indicar si se llevo a cabo o no la logica de nogocio
 *
 * Para estandarizar usaremos las siguientes variables, que siempre seran las mismas cuando aplique:
 * success: true o false --> esta variable indicara si se realizo correctamentye la acción
 * message: 'Mensaje que indique algo importante'
 * data: objeto --> cuando se trate de datos que se deben retornar se enviartan en esta variable
 *
 *
******************************************************************************************************************/



  //Metodo de la calse para la creacion de un nuevo usuario
  async create(data){
    console.log('Lega:',data)
    const addNewUser = await db.collection('drivers').add(data);
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
    const getUsers = await db.collection('drivers').where('status','==','Activo').get();

    const users = getUsers.docs.map(item => ({id:item.id,...item.data()}))
    return {
      success:true,
      data: users
    }
  }
  async getOne(id){
    const getUser = await db.collection('drivers').doc(id).get();

    if(!getUser.exists){
      return { success:false,message:'No encontrado'}
    }
    return {
      success:true,
      data:getUser.data()
    }


  }
  async updateOne(id,newData){
    const update = await db.collection('drivers').doc(id).update(newData);
    console.log(update)
    return { success:true, message:'Actualizado',data:update}
  }
  async deleteOne(id){
     await this.updateOne(id,{status:'Baja'})
     return { success:true, message:'Eliminado'}
  }

}

module.exports = Driver;
