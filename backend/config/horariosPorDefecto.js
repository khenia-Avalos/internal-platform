// backend/src/config/horariosPorDefecto.js

const intervalosPorEspecialidad = {
  'Groomer': 120,
  'Cirugía': 60,
  'Medicina General': 30
};

export const getHorarioPorDefecto = (especialidad) => {
  const intervalo = intervalosPorEspecialidad[especialidad] || 30;
  
  return {
    dias: [1, 2, 3, 4, 5, 6, 0], // lunes a domingo
    horaInicio: "09:00",
    horaFin: "18:00",
    intervalo: intervalo,
    activo: true
  };
};