// backend/src/config/horariosPorDefecto.js

const intervalosPorEspecialidad = {
  'Groomer': 120,
  'Cirugía': 60,
  'Medicina General': 30
};

export const getHorarioPorDefecto = (especialidad) => {
  //  Si es Recepcionista, horarios sin intervalo
  if (especialidad === 'Recepcionista') {
    return {
      dias: [1, 2, 3, 4, 5], // Lunes a viernes
      horaInicio: "08:00",
      horaFin: "17:00",
      intervalo: 0, // ← Sin intervalo
      activo: true
    };
  }
  
  const intervalo = intervalosPorEspecialidad[especialidad] || 30;
  
  return {
    dias: [1, 2, 3, 4, 5, 6, 0], // lunes a domingo
    horaInicio: "09:00",
    horaFin: "18:00",
    intervalo: intervalo,
    activo: true
  };
};