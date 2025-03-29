
const {fechaHoraActual} = require('./../functions/funciones')
const { MongoClient,ObjectId} = require("mongodb");

const url = process.env.URL_MONGODB;
const client = new MongoClient(url);
const dbName = "servicios_nuevaImagen";

class Service {
  constructor() {
    this.client = client;
    this.db = this.client.db(dbName);
    this.collection = this.db.collection('services');
  }

    async create(data) {
      console.log('Creando...',data)
      try {
          const cliente = await this.db.collection('customers').findOne({ _id: new ObjectId(data.cliente) });
          if (!cliente) return null;
          data['clienteData'] = { id: cliente._id, ...cliente };
          console.log('Cliente',cliente)

          const unidad = await this.db.collection('vehicles').findOne({ _id: new ObjectId(data.unidad) });
          if (!unidad) return null;
          data['unidadData'] = { id: unidad._id, ...unidad };
          await this.db.collection('vehicles').updateOne({ _id: unidad._id }, { $set: { esDisponible: 'En servicio' } });
          console.log('Unidad')


          const chofer = await this.db.collection('drivers').findOne({ _id: new ObjectId(data.chofer) });
          if (!chofer) return null;
          data['choferData'] = { id: chofer._id, ...chofer };
          await this.db.collection('drivers').updateOne({ _id: chofer._id }, { $set: { esDisponible: 'En servicio' } });
          console.log('Chofer')


          const caja = await this.db.collection('boxes').findOne({ _id: new ObjectId(data.caja) });
          if (!caja) return null;
          data['cajaData'] = { id: caja._id, ...caja };
          await this.db.collection('boxes').updateOne({ _id: caja._id }, { $set: { esDisponible: 'En servicio' } });
          console.log('Caja')


          data['fechaSolicitud'] = new Date();
          data['year'] = new Date().getFullYear();
          data['pays'] = [];
          data['totalMonto'] = data.services.reduce((sum, item) => sum + parseFloat(item.monto), 0);
          data['numEstado'] = '0';
          data['deposits'] = [];
          data['estadoPagos'] = 'Pendiente';
          data['pagadoChofer'] = 'Pendiente';

          data['adeudo'] = data['totalMonto'];

          const result = await this.collection.insertOne(data);
          return result.insertedId ? { id: result.insertedId } : null;
      } catch (error) {
          throw new Error(`Error al crear el registro: ${error.message}`);
      }
  }

  async getAll() {
      try {
          const docs = await this.collection.find({ status: 'Activo' }).toArray();
          return docs.length ? docs : null;
      } catch (error) {
          throw new Error(`Error al obtener los registros: ${error.message}`);
      }
  }

  async getOne(id) {
      try {
          const doc = await this.collection.findOne({ _id: new ObjectId(id) });
          return doc || null;
      } catch (error) {
          throw new Error(`Error al obtener el registro: ${error.message}`);
      }
  }

  async updateOne(id, updates) {
      try {
          await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
          return { message: 'Actualización exitosa' };
      } catch (error) {
          throw new Error(`Error al actualizar el registro: ${error.message}`);
      }
  }

  async updateOneExpenses(id,body){
    try {
      await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { gastos: body.gastos } });
      return { message: 'Actualización exitosa' };
    } catch (error) {
      throw new Error(`Error al actualizar el registro: ${error.message}`);
    }
  }

  async deleteOne(id) {
      try {
          await this.updateOne(id, { status: 'Baja' });
          return true;
      } catch (error) {
          throw new Error(`Error al eliminar el registro: ${error.message}`);
      }
  }
  async getFormData() {
    const year = new Date().getFullYear();

    const vehicles = await this.db.collection("vehicles").find({ status: "Activo", esDisponible: "Disponible" }).toArray();
    const drivers = await this.db.collection("drivers").find({ status: "Activo", esDisponible: "Disponible" }).toArray();
    const boxes = await this.db.collection("boxes").find({ status: "Activo", esDisponible: "Disponible" }).toArray();
    const customers = await this.db.collection("customers").find({ status: "Activo" }).toArray();
    const services = await this.db.collection('services').find({ year: year }).toArray();
    return {
      customers,
      drivers,
      vehicles,
      boxes,
      folio: services.length,
    };
  }
    async deposit(id, data) {
      console.log('Estos son los depositos:',data)
      const depositos = JSON.parse(data.depositos);
      await this.db.collection(this.collection).updateOne(
        { _id: new ObjectId(id) },
        { $set: { depositos: depositos } }
      );
      return { success: true, message: "Actualizado" };
    }

    async getDeposits(id) {

      const service = await this.db.collection(this.collection).findOne({ _id: new ObjectId(id) });
      if (service) {
        return service.depositos ? { success: true, data: service.depositos } : { success: false, message: "No hay depósitos aún" };
      }
      return { success: false, message: "Servicio no encontrado" };
    }

    async finishService(id, data) {

      const service = await this.getOne(id);
      if (!service) return { success: false, message: "Servicio no encontrado" };

      await this.db.collection("drivers").updateOne(
        { _id: new ObjectId(service.chofer) },
        { $set: { esDisponible: "Disponible" }, $addToSet: { serviciosActivos: id } }
      );
      await this.db.collection("vehicles").updateOne(
        { _id: new ObjectId(service.unidad) },
        { $set: { esDisponible: "Disponible" } }
      );
      await this.db.collection("boxes").updateOne(
        { _id: new ObjectId(service.caja) },
        { $set: { esDisponible: "Disponible" } }
      );

      await this.updateOne(id, data);
      return { success: true, message: "Chofer y vehículos disponibles" };
    }

    async updateOneDeposit(id, data) {
      const service = await this.getOne(id);
      if (!service) return { success: false, message: "Servicio no encontrado" };

      await this.db.collection('services').updateOne(
        { _id: new ObjectId(id) },
        { $push: { deposits: data } }
      );

      return { success: true, data: [...service.deposits, data] };
    }

    async getAllForPay() {
      try {
        const docs = await this.db.collection('services').find({ estadoPagos: "Pendiente" }).toArray();
        return docs.length ? docs : null;
      } catch (error) {
        throw new Error(`Algo salió mal al obtener los registros: ${error.message}`);
      }
    }

    async getAllForYear(year) {
      try {
        const docs = await this.db.collection('services').find({ year: Number(year) }).toArray();
        return docs.length ? docs : [];
      } catch (error) {
        throw new Error(`Algo salió mal al obtener los registros: ${error.message}`);
      }
    }

    async getDriverPays(idDriver){
      try {
        const docs = await this.collection.find({ chofer:idDriver,pagadoChofer:'Pendiente' }).toArray()
        return docs.length ? docs : []
      } catch (error) {
        throw new Error(`Algo salió mal al obtener los registros: ${error.message}`);
      }
    }
}
module.exports =Service
