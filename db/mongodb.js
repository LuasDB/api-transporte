const { MongoClient } = require('mongodb')

const url = process.env.URL_MONGODB
console.log('URL MONGO',url)
const client = new MongoClient(url)
const db = client.db('servicios_nuevaImagen')

module.exports = { client,db}

