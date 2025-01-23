const { MongoClient } = require('mongodb')

const url = process.env.URL_MONGODB
const client = new MongoClient(url)

module.exports = { client }

