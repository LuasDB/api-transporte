// Importamos las funciones necesarias para la comunicación con FIREBASE
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
////Como se utilizan variables de entorno se llama dotenv para facilitar el llamado a las variables
require('dotenv').config();

//Variables donde colocaremos las credenciales para la comunicación con FIREBASE, en el archivo README esta la
//Estructura de las variables
const apiKey = process.env.API_KEY;
const authDomain = process.env.AUTH_DOMAIN;
const projectId = process.env.PROJECT_ID;
const storageBucket = process.env.STORAGE_BUCKET;
const messagingSenderId = process.env.MESSAGING_SENDER_ID;
const appId = process.env.APP_ID;
//Configuración de la app
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

// Inicialización de la app
const app = initializeApp(firebaseConfig);
//Esta variable contiene la información de la base de datos dde  firestore y la usaremos siempre para mandar a llamarla
const db2 = getFirestore(app);
//Se envia desde aqui el servidor, ya que est eva a depender si esta corriendo en local o si ya existe un dominio cuando este en produccion
const server = process.env.URL_SERVER



//** OTRO MODO PARA UTILIZAR FIREBASE */
const admin = require('firebase-admin');
const serviceAccount = require('./paginasaul-eabef-firebase-adminsdk-3o5l4-71f2ad441d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


module.exports = {db,server,db2}



