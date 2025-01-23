function fechaHoraActual(){
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Mes empieza desde 0
  const dia = fecha.getDate().toString().padStart(2, '0');
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');

  return `${anio}-${mes}-${dia}T${horas}:${minutos}`;

}


module.exports = {fechaHoraActual}
