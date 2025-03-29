const { MongoClient, ObjectId } = require("mongodb");

const url = process.env.URL_MONGODB;
const client = new MongoClient(url);
const dbName = "servicios_nuevaImagen";

class Managment {
  constructor() {
    this.client = client;
    this.db = this.client.db(dbName);
  }

  async connect() {
    if (!this.client.topology || !this.client.topology.isConnected()) {
      await this.client.connect();
      console.log("MongoDB Connected");
    }
  }

  async create(collection, data) {
    try {
      await this.connect();
      data.createdAt = new Date().toISOString();

      const result = await this.db.collection(collection).insertOne(data);
      return { id: result.insertedId };
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async getAll(collection) {
    try {
      await this.connect();
      const docs = await this.db.collection(collection).find({}).toArray();
      return docs.length > 0 ? docs : null;
    } catch (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
  }

  async getOne(collection, id) {
    try {
      console.log('desde getOne',collection,id)
      await this.connect();
      const doc = await this.db.collection(collection).findOne({ _id: new ObjectId(id) });
      return doc || null;
    } catch (error) {
      throw new Error(`Error fetching document: ${error.message}`);
    }
  }

  async update(collection, id, updates) {
    try {
      await this.connect();
      const result = await this.db.collection(collection).updateOne(
        { _id: id },
        { $set: updates }
      );

      return result.modifiedCount > 0 ? this.getOne(collection, id) : null;
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async getAllCollections() {
    console.log('-----------------------------');
    const collections = ['users', 'vehicles', 'drivers', 'boxes'];
    const results = await Promise.all(collections.map(col => this.getAll(col)));
    return Object.fromEntries(collections.map((col, i) => [col, results[i] || []]));
  }

  async delete(collection, id) {
    try {
      await this.connect();
      const result = await this.db.collection(collection).updateOne(
        { _id: id },
        { $set: { status: "Baja" } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async close() {
    await this.client.close();
    console.log("MongoDB Connection Closed");
  }
}

module.exports = Managment;
