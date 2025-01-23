const { db } = require('./../db/firebase');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// const htmlTemplatePath = path.join(__dirname,'./../machoteCorreos.html');
// let htmlToSend = fs.readFileSync(htmlTemplatePath, 'utf8');

const transporter = nodemailer.createTransport({
  host: 'mail.samar-technologies.com',
  port: 465,
  secure: true, // true para port 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class Auth {
  constructor() {
    this.collection = 'users';
  }

  async create(data) {
    const { nombre, tipoUsuario, correo } = data;

    // Validación de datos
    if (!nombre || !tipoUsuario || !email ) {
      throw new Error('Todos los campos son requeridos');
    }

    try {
      // Verificar si el usuario ya existe
      const userSnapshot = await db.collection(this.collection).where('email', '==', email).get();

      if (!userSnapshot.empty) {
        return { success: false, status: 409, message: 'El usuario ya existe' };
      }



      // Guardar el nuevo usuario en Firestore
      const newUser = {
        nombre,
        tipoUsuario,
        email,
        createdAt: new Date().toISOString(),
        status: 'Activo',
      };

      const userRef = await db.collection(this.collection).add(newUser);

      // Generar token JWT para restablecimiento de contraseña
      const resetToken = jwt.sign({ userId: userRef.id, email: email }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
      });

      // Enlace de restablecimiento de contraseña
      const resetLink = `${process.env.CLIENT_URL}reset-password?token=${resetToken}`;


      const htmlToSend =`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007BFF;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .container {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  background-color: #f9f9f9;
              }
              .header {
                  font-size: 24px;
                  margin-bottom: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">Establecer Contraseña</div>
              <p>Hola ${nombre},</p>
              <p>Te has registrado exitosamente. Por favor, restablece tu contraseña usando el siguiente enlace:</p>
              <p><a href="${resetLink}" style="display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffff;
                background-color: #007BFF;
                text-decoration: none;
                border-radius: 5px;">Restablecer Contraseña</a></p>
              <p>Saludos,<br>Equipo de Soporte</p>
          </div>
      </body>
      </html>
      `
       // Configurar el correo electrónico
       let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
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
        console.log('[ERROR MAIL]',error)
        console.log('[INFO MAIL]',info)
       });

      return { success: true, status: 201, message: 'El usuario se creó correctamente se le envio un correo' };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al crear el usuario', error };
    }
  }

  async login(data) {
    const { email, password } = data;

    // Validación de datos
    if (!email || !password) {
      return { success: false, status: 400, message: 'Se requieren todos los datos' };
    }

    try {
      const userSnapshot = await db.collection(this.collection).where('email', '==', email).get();
      if (userSnapshot.empty) {
        return { success: false, status: 401, message: 'Credenciales inválidas',data: userSnapshot};
      }

      // Obtener el usuario
      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, status: 401, message: 'Credenciales inválidas' };
      }


      // Generar token JWT
      const token = jwt.sign({ userId: userDoc.id,user}, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return { success: true, status: 200, data: { token } };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al iniciar sesión', error };
    }
  }

  async getAll() {
    try {
      const usersQuery = await db.collection(this.collection).where('status', '==', 'Activo').get();
      const users = usersQuery.docs.map((item) => ({ id: item.id, ...item.data() }));

      return { success: true, status: 200, data: users };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al obtener usuarios', error };
    }
  }

  async getOne(id) {
    try {
      const userQuery = await db.collection(this.collection).doc(id).get();
      if (!userQuery.exists) {
        return { success: false, status: 404, message: 'Usuario no encontrado' };
      }

      const { password, ...data } = userQuery.data();
      return { success: true, status: 200, data };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al obtener el usuario', error };
    }
  }

  async updateOne(id, newData) {
    try {
      await db.collection(this.collection).doc(id).update(newData);
      console.log('Se actualizo')
      return { success: true, status: 200, message: 'Actualización correcta' };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al actualizar el usuario', error };
    }
  }

  async resetPassword(data){
    const {token, newPassword} = data
    console.log('[PASO 1]',data)

    try {
       // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('[PASO 2]',decoded)


    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[PASO 3]',hashedPassword)

     const update = await this.updateOne(userId,{password:hashedPassword})

    console.log(update)
    return { success:true, status:200, message:'Contraseña actualizada'}


    } catch (error) {
      return { success:false, status:500, message:'Algo salio mal'}

    }
  }

  async solPassword(data){
    console.log('SE SOLICITO CAMBIO PASS',data.email)
    // Verificar si el usuario existe
    const userSnapshot = await db.collection(this.collection).where('email', '==', data.email).get();


    if(userSnapshot.empty){
      return { success:false, message:'Este correo no se encuentra registrado',status:404}
    }
    const user = {id:userSnapshot.docs[0].id,...userSnapshot.docs[0].data()}
    console.log(user)
     // Generar token JWT para restablecimiento de contraseña
     const resetToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h', // El token expira en 1 hora
    });

    // Enlace de restablecimiento de contraseña
    const resetLink = `${process.env.CLIENT_URL}reset-password?token=${resetToken}`;
    console.log(resetLink)


    const htmlToSend =`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>

            .container {

            }
            .header {

            }
        </style>
    </head>
    <body>
        <div  style=" font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 600px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;">
            <div style=" font-size: 24px;
                margin-bottom: 20px;">Restablecimiento de Contraseña</div>
            <p>Hola ${user.nombre},</p>
            <p>Has solicitado un reestablecimiento de contraseña. Por favor, restablece tu contraseña usando el siguiente enlace:</p>
            <p><a href="${resetLink}" style="display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffff;
                background-color: #007BFF;
                text-decoration: none;
                border-radius: 5px;">Restablecer Contraseña</a></p>
            <p>Saludos,<br>Equipo de Soporte</p>
        </div>
    </body>
    </html>
    `
     // Configurar el correo electrónico
     let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Solicitud de Restablecimiento de contraseña',
      html: htmlToSend,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
        };

     // Enviar el correo electrónico
     await transporter.sendMail(mailOptions,(error, info) => {
      console.log('[ERROR MAIL]',error)
      console.log('[INFO MAIL]',info)
     });

    return { success: true, status: 201, message: 'Solicitud aceptada, te enviamos un correo con las instucciones' };




  }

  async prueba(){

    console.log(process.env.EMAIL_USER)
    console.log(process.env.EMAIL_PASS)


       // Configurar el correo electrónico
     let mailOptions = {
      from: process.env.EMAIL_USER,
      to:'saul.delafuente@siradiacion.com.mx',
      subject: 'Prueba de plantillas de correo',
      html: htmlToSend,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
        };


         // Enviar el correo electrónico
     await transporter.sendMail(mailOptions,(error, info) => {
      console.log('[ERROR MAIL]',error)
      console.log('[INFO MAIL]',info)
     });


  }

}

module.exports = Auth;
