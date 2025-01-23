// Middleware para identificar errores en consola
function logErrors(err,req,res,next){
  console.error('[LOG ERROR]:', err);
  next(err);
}

// Middleware para enviar al cliente
function errorHandle(err,req,res,next){
  console.error('[ERROR HANDLE]:', err);
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

module.exports = {logErrors,errorHandle}


