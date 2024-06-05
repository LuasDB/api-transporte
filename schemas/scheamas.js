const { z } = require('zod')

 const schemaUsers = z.object({
  cargo:z.string(),
  correo:z.string().email(),
  nombre:z.string(),
  pass:z.string(),
  status:z.string(),
  telefono:z.string(),
  tipoUsuario:z.string(),
  usuario:z.string()
})

module.exports={schemaUsers}
