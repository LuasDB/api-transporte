// const { db } = require('./../db/firebase');
const { client,db } = require('./../db/mongodb')
const { restablecerPass } = require('./../functions/restablecer-pass')
 const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { decode } = require('punycode');
const { Console } = require('console');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// const htmlTemplatePath = path.join(__dirname,'./../machoteCorreos.html');
// let htmlToSend = fs.readFileSync(htmlTemplatePath, 'utf8');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true, // true para port 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class Auth {
  constructor() {
    this.database = 'servicios_nuevaImagen'
    this.collection = 'users';
  }

  async create(data) {

    const { nombre, tipoUsuario, correo } = data;

    if (!nombre || !tipoUsuario || !correo ) {
      throw new Error('Todos los campos son requeridos');
    }
    try {
      await client.connect();
      const user = await db.collection('users').findOne({ correo: correo });

      if (user) {
        return { success:false, message:'Este correo ya fue registrado'}
      }
      const newUser = {
        ...data,
        status: 'Activo',
      };
      const result = await db.collection('users').insertOne(newUser)

      if(result.insertedId){
      const resetToken = jwt.sign({ userId:result.insertedId, correo: correo }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      const htmlToSend = restablecerPass(resetToken,process.env.URL_APP)
      let mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Registro en plataforma',
      html: htmlToSend,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
        };

      // Enviar el correo electrónico
      await transporter.sendMail(mailOptions,(error, info) => {
      console.log('Enviando correo...')
      if(error){
        console.error('Error al enviar correo :',error)
      }else{
        console.log('Correo enviado',info.response)
      }
      });

      return { success:true, id:result.insertedId, message:'Creado correctamente' }
      }

    } catch (error) {
      throw new Error('Error al crear el usuario error',error.message)
    }finally{
      client.close()
    }
  }

  async resetPassword(data){
    const {token, newPassword} = data
    console.log('[PASO 1]',data)

    try {
      await client.connect()
      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.error('[ERROR JWT]', error);
        return { success: false, status: 401, message: 'Token inválido o expirado' };
      }

    console.log('[PASO 2]',decoded)

    const userId = decoded.userId;


    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[PASO 3]',hashedPassword)

    const result = await db.collection('users').updateOne(
      { correo:decoded.correo },
      { $set: { password: hashedPassword } }
    );
    console.log('[PASO 4]', result);
    if (result.modifiedCount === 0) {
      return { success: false, status: 404, message: 'Usuario no encontrado' };
    }

    return { success: true, message: 'Contraseña reestablecida', result };



    } catch (error) {
    return { success:false, status:500, message:'Algo salio mal'}

    }finally{await client.close()}
  }

  async updateOne(id, newData) {
    try {

      await client.connect()
      const result = await db.collection('users').updateOne(
        { _id: ObjectId(id) },
        { $set:newData}
      )


      return { success: true, status: 200, message: 'Actualización correcta',result };
    }finally{
      await client.close()
    }
  }

  async solPassword(data){
    const { correo } = data
    console.log('SE SOLICITO CAMBIO PASS',data.correo)
    try{
      await client.connect()
      const user = await db.collection('users').findOne({correo:correo})
      console.log(user)
      if(!user){
        throw new Error('Usuario no encontrado')
      }
      // Generar token JWT para restablecimiento de contraseña
      const resetToken = jwt.sign({ userId: user._id, correo: user.correo }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
      });

      const htmlToSend = restablecerPass(resetToken,process.env.URL_APP)
      let mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Registro en plataforma',
      html: htmlToSend,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
        };

      // Enviar el correo electrónico
      await transporter.sendMail(mailOptions,(error, info) => {
      console.log('Enviando correo...')
      if(error){
        console.error('Error al enviar correo :',error)
      }else{
        console.log('Correo enviado',info.response)
      }
      });



    }finally{
      await client.close()
    }
  }

  async login(data) {
    const { correo, password } = data;

    // Validación de datos
    if (!correo || !password) {
      return { success: false, status: 400, message: 'Se requieren todos los datos' };
    }

    try {
      await client.connect()

      const user = await db.collection('users').findOne(
        { correo:correo }
      )
      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, status: 401, message: 'Credenciales inválidas' };
      }

      delete user.password
      // Generar token JWT
      const token = jwt.sign({ userId: user._id,user}, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return { success: true, status: 200, data: { token } };
    }catch (error) {
      console.error('[ERROR GENERAL]', error);
      return { success: false, status: 500, message: 'Algo salió mal' };
    } finally{
      await client.close()
    }
  }

  // async getAll() {
  //   try {
  //     const usersQuery = await db.collection(this.collection).where('status', '==', 'Activo').get();
  //     const users = usersQuery.docs.map((item) => ({ id: item.id, ...item.data() }));

  //     return { success: true, status: 200, data: users };
  //   } catch (error) {
  //     return { success: false, status: 500, message: 'Error al obtener usuarios', error };
  //   }
  // }

  // async getOne(id) {
  //   try {
  //     const userQuery = await db.collection(this.collection).doc(id).get();
  //     if (!userQuery.exists) {
  //       return { success: false, status: 404, message: 'Usuario no encontrado' };
  //     }

  //     const { password, ...data } = userQuery.data();
  //     return { success: true, status: 200, data };
  //   } catch (error) {
  //     return { success: false, status: 500, message: 'Error al obtener el usuario', error };
  //   }
  // }







  // async prueba(){

  //   console.log(process.env.EMAIL_USER)
  //   console.log(process.env.EMAIL_PASS)


  //      // Configurar el correo electrónico
  //    let mailOptions = {
  //     from: process.env.EMAIL_USER,
  //     to:'saul.delafuente@siradiacion.com.mx',
  //     subject: 'Prueba de plantillas de correo',
  //     html: htmlToSend,
  //     headers: {
  //       'X-Priority': '1 (Highest)',
  //       'X-MSMail-Priority': 'High',
  //       Importance: 'High',
  //     },
  //       };


  //        // Enviar el correo electrónico
  //    await transporter.sendMail(mailOptions,(error, info) => {
  //     console.log('[ERROR MAIL]',error)
  //     console.log('[INFO MAIL]',info)
  //    });


  // }

}

module.exports = Auth;
