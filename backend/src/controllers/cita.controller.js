
import User from '../models/user.model.js';
import Paciente from '../models/pacientes.model.js';
import Cita from '../models/cita.model.js'
import { manejarError } from '../utils/errorHandler.js'; 
import Horario from '../models/horario.model.js';
import Pausa from '../models/pausa.model.js';

// Suma minutos a una hora en formato "HH:MM"
const sumarMinutos = (hora, minutos) => {
  const [horas, mins] = hora.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, mins + minutos, 0);
  return fecha.toTimeString().slice(0, 5);
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
    
    // Convertir duracionCita a número
    const duracion = parseInt(duracionCita);
    
    const ahora = new Date();
    const esHoy = new Date(fecha).toDateString() === ahora.toDateString();
    const horaActual = ahora.toTimeString().slice(0, 5);
    
    const diaSemana = new Date(fecha).getDay();
    const horario = await Horario.findOne({ doctorId, dia: diaSemana });
    
    if (!horario) {
      return res.json([]);  // ← Array vacío, no error 404
    }
    
    if (!horario.activo) {
      return res.json([]);
    }
    
   // Validar que la fecha no sea pasada
const fechaSeleccionada = new Date(fecha);
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
fechaSeleccionada.setHours(0, 0, 0, 0);  // ← IMPORTANTE: comparar solo días

if (fechaSeleccionada < hoy) {
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
    
    const citas = await Cita.find({ 
      doctorId, 
      fecha: {
        $gte: new Date(fecha + "T00:00:00"),
        $lt: new Date(fecha + "T23:59:59")
      }
    });
    
    // Generar slots
    const slots = [];
    let horaActualSlot = horario.horaInicio;
    const intervalo = parseInt(horario.intervalo);  // ← Asegurar número
    
    while (sumarMinutos(horaActualSlot, duracion) <= horario.horaFin) {
      const horaFinSlot = sumarMinutos(horaActualSlot, duracion);
      
      slots.push({
        inicio: horaActualSlot,
        fin: horaFinSlot
      });
      
      horaActualSlot = sumarMinutos(horaActualSlot, intervalo);
    }
    
 const slotsDisponibles = slots.filter(slot => {
  console.log("🔍 Slot evaluando:", slot.inicio, "-", slot.fin);
  console.log("   esHoy:", esHoy);
  console.log("   horaActual:", horaActual);
  console.log("   slot.fin <= horaActual:", slot.fin <= horaActual);
  
  // 1. Horas pasadas (solo hoy)
  if (esHoy && slot.fin <= horaActual) {
    console.log("   ❌ Bloqueado por hora pasada");
    return false;
  }
  

      // 2. Pausas (almuerzo)
      const enPausa = pausas.some(pausa => {
        return slot.inicio >= pausa.inicio && slot.fin <= pausa.fin;
      });
      if (enPausa) return false;
      
      // 3. Citas existentes
      const ocupado = citas.some(cita => {
        return (slot.inicio >= cita.horaInicio && slot.inicio < cita.horaFin) ||
               (slot.fin > cita.horaInicio && slot.fin <= cita.horaFin) ||
               (slot.inicio <= cita.horaInicio && slot.fin >= cita.horaFin);
      });
      if (ocupado) return false;
      
      return true;
    });
    
    res.json(slotsDisponibles);
    
  } catch (error) {
    console.error("Error en getHorariosDisponibles:", error);
    res.status(500).json({ message: "Error al obtener horarios disponibles" });
  }
};

export const getCitasRequest = async (req, res) => {  // ← Recibe req, res
  try {
    const citas = await Cita.find()  // ← Obtiene TODAS las citas
      .populate('doctorId', 'username lastname especialidad')
      .populate('pacienteId', 'nombre especie raza');
    res.json(citas);  // ← Envía respuesta
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};