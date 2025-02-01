const { db,updateArrays } = require('../db/firebase')
const {fechaHoraActual} = require('./../functions/funciones')

class Service{
    constructor(){
      this.collection = 'services'
    }

    async create(data){
      console.log('Lega:',data)

      try {
      const cliente = await db.collection('customers').doc(data.cliente).get()
      if(!cliente.exists){
        return null;
      }
      data['clienteData']={id:cliente.id,...cliente.data()}

      const unidad = await db.collection('vehicles').doc(data.unidad).get()
      if(!unidad.exists){
        return null;
      }
      data['unidadData']={id:unidad.id,...unidad.data()}
      await db.collection('vehicles').doc(data.unidad).update({esDisponible:'En servicio'})

      const chofer = await db.collection('drivers').doc(data.chofer).get()
      if(!chofer.exists){
        return null;
      }
      data['choferData']={id:chofer.id,...chofer.data()}
      await db.collection('drivers').doc(data.chofer).update({esDisponible:'En servicio'})

      console.log('-------INFO CAJA-------')
      console.log('ID:',data.caja)

      const caja = await db.collection('boxes').doc(data.caja).get()
      if(!caja.exists){
        return null
      }
      console.log('data',caja)
      data['cajaData'] = {id:caja.id,...caja.data()}
      await db.collection('boxes').doc(data.caja).update({esDisponible:'En servicio'})



      data['fechaSolicitud'] = fechaHoraActual()
      data['year'] = new Date().getFullYear()
      data['pays'] = []
      data['totalMonto'] =  data.services.reduce((sum, item) => {
        return sum + parseFloat(item.monto);
      }, 0);
      data['numEstado']='0'
      data['deposits'] =[]
      data['estadoPagos'] ='Pendiente'
      data['adeudo'] =  data.services.reduce((sum, item) => {
        return sum + parseFloat(item.monto);
      }, 0);

      const newDoc = await db.collection(this.collection).add(data)
      if(newDoc.id){
        return {
          id:newDoc.id
        }
      }else{
        return null
      }


      } catch (error) {
        throw new Error(`Algo salio mal al Crear el registro: ${error.message}`);
      }
    }
    async getAll(){

      try {
        const docs = await db.collection(this.collection).where('status','==','Activo').get();
        if(docs.empty){
          return null
        }
        const data = docs.docs.map(item=>({id:item.id,...item.data()}))
        return [...data];
      } catch (error) {
        throw new Error(`Algo salio mal al obtener los registros: ${error.message}`);
      }

    }
    async getOne(id){
      try {
        const doc = await db.collection(this.collection).doc(id).get();
        if (!doc.exists) {
          return null;
        }
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        throw new Error(`Algo salio mal al obtener el registro:${error.message}`);
      }
    }
    async updateOne(id,updates){

      console.log(id)
      try {
        const docRef = db.collection(this.collection).doc(id);
        console.log(docRef)
        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
          return null;
        }
        return { data:'doto bien' };
      } catch (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }
    }
    async deleteOne(id){
      try {
        const docRef = db.collection(collection).doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
          return null;
        }
        await this.update(id,{status:'Baja'});
        return true;
      } catch (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
    }
    async getFormData(){
      const year = new Date().getFullYear()
      const vehicles = await db.collection('vehicles').where('status','==','Activo').where('esDisponible','==','Disponible').get()
      const drivers = await db.collection('drivers').where('status','==','Activo').where('esDisponible','==','Disponible').get()
      const boxes = await db.collection('boxes').where('status','==','Activo').where('esDisponible','==','Disponible').get()
      const customers = await db.collection('customers').where('status','==','Activo').get()
      const services = await db.collection(this.collection).where('year','==',year).get()

      return {
        customers:customers.docs.map(item => ({id:item.id,...item.data()})),
        drivers:drivers.docs.map(item => ({id:item.id,...item.data()})),
        vehicles:vehicles.docs.map(item => ({id:item.id,...item.data()})),
        boxes:boxes.docs.map(item => ({id:item.id,...item.data()})),
        folio:services.size
      }

    }
    async deposit(id,data){
      const depositos = JSON.parse(data.depositos)
      const res = await db.collection(this.collection).doc(id).update({depositos:depositos}).then(()=> { return {success:true, message:'Actualizado'}})
      return res
    }
    async getDeposits(id){
      const deposits = await db.collection(this.collection).doc(id).get()
      if(deposits.exists){
        const data = deposits.data()
        if('depositos' in data){
          return { success:true, data: data.depositos }
        }else{
          return { success:false,message:'No hay depositos aun'}
        }
      }

    }
    async finishService(id,data){
      console.log('---Se recibio la finalizacion--')

      const service = await this.getOne(id);

      await db.collection('drivers').doc(service.chofer).update({
        esDisponible:'Disponible',
        serviciosActivos: updateArrays.arrayUnion(id)
    });
      await db.collection('vehicles').doc(service.unidad).update({esDisponible:'Disponible'})
      await db.collection('boxes').doc(service.caja).update({esDisponible:'Disponible'})
      await this.updateOne(id,data)



      return { success:true, message:'Chofer y vehiculos disponibles'}

    }
    async updateOneDeposit(id,data){
      console.log(data)
      const service = await this.getOne(id)
      service.deposits.push(data)
      await this.updateOne(id,{deposits:service.deposits})
      return {data:service.deposits}

    }



    async getAllForPay(){
      try {
        const docs = await db.collection(this.collection).where('estadoPagos','==','Pendiente').get();
        if(docs.empty){
          return null
        }
        const data = docs.docs.map(item=>({id:item.id,...item.data()}))
        return [...data];
      } catch (error) {
        throw new Error(`Algo salio mal al obtener los registros: ${error.message}`);
      }

    }

    async getAllForYear(year){
      console.log('Entrando a',year)
      try {
        const docs = await db.collection(this.collection).where('year','==',Number(year)).get();
        if(docs.empty){
          return []
        }
        const data = docs.docs.map(item=>({id:item.id,...item.data()}))
        return [...data];
      } catch (error) {
        throw new Error(`Algo salio mal al obtener los registros: ${error.message}`);
      }
    }
}
module.exports =Service
