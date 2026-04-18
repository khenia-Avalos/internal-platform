import User from '../models/user.model.js';
import Paciente from '../models/pacientes.model.js';
import Cita from '../models/cita.model.js'
import { manejarError } from '../utils/errorHandler.js'; 
import Horario from '../models/horario.model.js';
import Pausa from '../models/pausa.model.js';
import { sendAppointmentConfirmationEmail } from '../services/authService.js';



// Suma minutos a una hora en formato "HH:MM"
const sumarMinutos = (hora, minutos) => {
  const [horas, mins] = hora.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, mins + minutos, 0);
  return fecha.toTimeString().slice(0, 5);
};
const sumarMinutosAHora = (horaStr, minutos) => {
  const [horas, mins] = horaStr.split(':').map(Number);
  let totalMinutos = horas * 60 + mins + minutos;
  const nuevasHoras = Math.floor(totalMinutos / 60);
  const nuevosMinutos = totalMinutos % 60;
  return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
};

export const createCita = async (req, res) => {
    try {
         const { doctorId, pacienteId, fecha, horaInicio, horaFin, motivo, notas } = req.body;
            
          // Verificar que el doctor existe y es doctor
const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
if (!doctor) {
  return res.status(404).json({ message: "Doctor no encontrado" });
}
// Verificar que el paciente (mascota) existe
const paciente = await Paciente.findById(pacienteId);
if (!paciente) {
  return res.status(404).json({ message: "Paciente no encontrado" });
}

            const nuevaCita = new Cita({
              doctorId,
              pacienteId,
              fecha,
              horaInicio,
              horaFin,
             motivo,
              notas
            });
            
            const citaGuardada = await nuevaCita.save();
            res.status(201).json(citaGuardada);
            if (paciente.ownerId?.email) {
  await sendAppointmentConfirmationEmail(
    paciente.ownerId.email,
    paciente.ownerId.username,
    citaGuardada
  );
}

    }
        catch (error) {
              const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
    

        }

}

export const getCitasByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const citas = await Cita.find({ doctorId })
      .populate('pacienteId', 'nombre especie raza') // datos de la mascota
      .sort({ fecha: -1, horaInicio: 1 }); // más recientes primero
    
    res.json(citas);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const getCitasByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const citas = await Cita.find({ pacienteId })
      .populate('doctorId', 'username lastname especialidad')
      .sort({ fecha: -1, horaInicio: 1 });
    
    res.json(citas);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo, notas } = req.body;
    
    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      { estado, motivo, notas },
      { new: true }
    );
    
    if (!citaActualizada) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    res.json(citaActualizada);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    const citaEliminada = await Cita.findByIdAndDelete(id);
    
    if (!citaEliminada) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    res.json({ message: "Cita cancelada correctamente" });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const getHorariosDisponibles = async (req, res) => {
  try {
    const { doctorId, fecha, duracionCita } = req.params;
    
    console.log("========== INICIO getHorariosDisponibles ==========");
    console.log(" Parámetros recibidos:");
    console.log("   doctorId:", doctorId);
    console.log("   fecha:", fecha);
    console.log("   duracionCita:", duracionCita);
    
    const duracion = parseInt(duracionCita);// convierte la duracion a numero
    
    const ahora = new Date();
    const esHoy = new Date(fecha).toDateString() === ahora.toDateString();
const horaActual = ahora.toLocaleTimeString('en-US', { 
  timeZone: 'America/Costa_Rica', 
  hour: '2-digit', 
  minute: '2-digit', 
  hour12: false 
});
// Convertir hora actual a minutos (para comparar)
const horaActualEnMinutos = parseInt(horaActual.split(':')[0]) * 60 + parseInt(horaActual.split(':')[1]);
    
    console.log(" Fecha actual:", ahora.toISOString());
    console.log("   esHoy:", esHoy);
    console.log("   horaActual:", horaActual);
    
    const diaSemana = new Date(fecha).getDay();//determina el dia de ña semana
    console.log(" día de la semana:", diaSemana, "(0=domingo, 1=lunes...)");
    
    const horario = await Horario.findOne({ doctorId, dia: diaSemana });//busca el horario del doctor para ese dia
    
    console.log(" horario encontrado:", horario ? "SÍ" : "NO");
    if (horario) {
      console.log("   horaInicio:", horario.horaInicio);
      console.log("   horaFin:", horario.horaFin);
      console.log("   intervalo:", horario.intervalo);
      console.log("   activo:", horario.activo);
    }
    
    if (!horario) {
      console.log("No hay horario para este día, devolviendo []");
      return res.json([]);
    }
    
    if (!horario.activo) {
      console.log(" Horario inactivo, devolviendo []");
      return res.json([]);
    }
    
    const fechaSeleccionada = new Date(fecha);// convierte la fecha a objeto Date para comparar
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    console.log(" Comparación de fechas:");
    console.log("   fechaSeleccionada:", fechaSeleccionada);
    console.log("   hoy:", hoy);
    console.log("   fechaSeleccionada < hoy:", fechaSeleccionada < hoy);
    
    if (fechaSeleccionada < hoy) {// si la fecha es pasada, no hay horarios disponibles
      console.log(" Fecha pasada, devolviendo []");
      return res.json([]);
    }
const pausas = await Pausa.find({ 
  doctorId, 
  fecha: {
    $gte: new Date(fecha + "T00:00:00"),
    $lt: new Date(fecha + "T23:59:59")
  },
  activa: true
});
console.log(" Pausas activas encontradas para la fecha", fecha, ":", pausas.length);
if (pausas.length > 0) {
  console.log("   Detalle de pausas:", JSON.stringify(pausas, null, 2));
}
    
    const citas = await Cita.find({ 
      doctorId, 
      fecha: {
        $gte: new Date(fecha + "T00:00:00"),
        $lt: new Date(fecha + "T23:59:59")
      }
    });
    
    console.log(" Citas existentes para esta fecha:", citas.length);
    
    // Generar slots
    const slots = [];
    let horaActualSlot = horario.horaInicio;// hora actual del slot que se va a generar
    const intervalo = parseInt(horario.intervalo);
    
    console.log("Generando slots...");
    console.log("   duracion:", duracion);
    console.log("   intervalo:", intervalo);
    console.log("   rango:", horario.horaInicio, "-", horario.horaFin);
    
    while (sumarMinutos(horaActualSlot, duracion) <= horario.horaFin) {//bucle para generar slots mientras la hora de fin del slot sea menor o igual a la hora de fin del horario
      const horaFinSlot = sumarMinutos(horaActualSlot, duracion);// calcula la hora de fin del slot sumando la duracion a la hora de inicio del slot
      slots.push({// agrega el slot al array de slots
        inicio: horaActualSlot,
        fin: horaFinSlot
      });
      console.log(`   Slot generado: ${horaActualSlot} - ${horaFinSlot}`);
      horaActualSlot = sumarMinutos(horaActualSlot, intervalo);// actualiza la hora de inicio del siguiente slot sumando el intervalo a la hora de inicio del slot actual
    }
    
    console.log(" Total slots generados:", slots.length);
    
    if (slots.length === 0) {
      console.log(" No se generaron slots, devolviendo []");
      return res.json([]);
    }
    
const slotsDisponibles = slots.filter(slot => {//filtra los slots para quedarnos solo con los disponibles
  let disponible = true;
  let motivo = "";
  
  // 1. Horas pasadas (solo hoy, con margen de 15 minutos)
  if (esHoy) {// si es hoy, bloquea los slots que ya pasaron (con margen de 15 minutos)
    const slotInicioEnMinutos = parseInt(slot.inicio.split(':')[0]) * 60 + parseInt(slot.inicio.split(':')[1]);// convierte la hora de inicio del slot a minutos para comparar con la hora actual
    const diferencia = horaActualEnMinutos - slotInicioEnMinutos;// calcula la diferencia en minutos entre la hora actual y la hora de inicio del slot
    
    if (diferencia > 15) {// si el slot ya pasó hace más de 15 minutos, no está disponible
      disponible = false;
      motivo = `hora pasada (hace ${diferencia} minutos)`;
    }
  }

// 2. Pausas (almuerzo)
if (disponible) {
  const pausasFormateadas = pausas.map(p => {// formatea las pausas para comparar solo horas y minutos
    const inicioLocal = new Date(p.inicio).toLocaleTimeString('en-US', { 
      timeZone: 'America/Costa_Rica', // Asegura que la hora se formatee en la zona horaria correcta
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    return {
      inicio: inicioLocal,// formatea la hora de inicio de la pausa a "HH:MM"
      fin: p.fin ? new Date(p.fin).toLocaleTimeString('en-US', { // formatea la hora de fin de la pausa a "HH:MM" si existe, sino null
        timeZone: 'America/Costa_Rica', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }) : null
    };
  });
  
  const enPausa = pausasFormateadas.some(pausa => {// verifica si el slot cae dentro de alguna pausa activa
    if (!pausa.fin) {
      // Calcular hora fin del almuerzo (inicio + 60 + 15 minutos de margen)
      const [horas, minutos] = pausa.inicio.split(':').map(Number);// convierte la hora de inicio de la pausa a horas y minutos para calcular la hora de fin del almuerzo
      let minutosFin = minutos + 75; // calcula los minutos de fin sumando 60 minutos de almuerzo + 15 minutos de margen
      let horasFin = horas;//
      if (minutosFin >= 60) {
        horasFin += Math.floor(minutosFin / 60);
        minutosFin = minutosFin % 60;
      }
      const horaFinAlmuerzo = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;//formatea la hora de fin del almuerzo a "HH:MM"
      
      // Bloquear si el slot empieza después del inicio y antes del fin del almuerzo (con margen)
return slot.fin > pausa.inicio && slot.fin < horaFinAlmuerzo;    }// si la pausa no tiene hora de fin, bloquea el slot si termina después de que empiece la pausa (con margen)
    return slot.inicio >= pausa.inicio && slot.fin <= pausa.fin;// bloquea el slot si empieza o termina dentro del rango de la pausa
  });
  
  if (enPausa) {
    disponible = false;
    motivo = "almuerzo";
  }
}
  // 3. Citas existentes
  if (disponible) {
    const ocupado = citas.some(cita => {// verifica si el slot se superponecon alguna cita existente
      return (slot.inicio >= cita.horaInicio && slot.inicio < cita.horaFin) ||// el slot empieza dentro de una cita
             (slot.fin > cita.horaInicio && slot.fin <= cita.horaFin) ||// el slot termina dentro de una cita
             (slot.inicio <= cita.horaInicio && slot.fin >= cita.horaFin);// el slot envuelve completamente una cita
    });
    if (ocupado) {// si el slot se superpone con una cita existente, no está disponible
      disponible = false;
      motivo = "cita existente";
    }
  }
  
  console.log(`   Slot ${slot.inicio}-${slot.fin}: ${disponible ? "✅ DISPONIBLE" : `❌ NO DISPONIBLE (${motivo})`}`);
  return disponible;
});

console.log(" slotsDisponibles finales:", slotsDisponibles.length);
console.log("========== FIN getHorariosDisponibles ==========");

res.json(slotsDisponibles);

  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const getCitasRequest = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('doctorId', 'username lastname especialidad')
      .populate('pacienteId', 'nombre especie raza');
    res.json(citas);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

