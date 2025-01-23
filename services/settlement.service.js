const { db,server } = require('../db/firebase')

class Settlement{
  constructor(){

  }

  async getData(){
    try {
      const drivers = await db.collection('drivers').where('status','==','Activo').get()

      return drivers.docs.map(item=>({id:item.id,...item.data()}))
    } catch (error) {
      return null
    }
  }


}

module.exports = Settlement
