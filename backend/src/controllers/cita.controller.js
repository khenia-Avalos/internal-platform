
import User from '../models/user.model.js';
import Paciente from '../models/pacientes.model.js';
import Cita from '../models/cita.model.js'
import { manejarError } from '../utils/errorHandler.js'; 

// Suma minutos a una hora en formato "HH:MM"
const sumarMinutos = (hora, minutos) => {
  const [horas, mins] = hora.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, mins + minutos, 0);
  return fecha.toTimeString().slice(0, 5);
};


export const crearCita = async (req, res) => {
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
    const { doctorId, fecha, duracionCita } = req.params; // ← duracionCita viene del frontend
    
    const diaSemana = new Date(fecha).getDay();
    const horario = await Horario.findOne({ doctorId, dia: diaSemana });
    
    if (!horario) {
      return res.status(404).json({ message: "No hay horario configurado para este día" });
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
    
    // Generar slots con duración variable
    const slots = [];
    let horaActual = horario.horaInicio;// Inicializar con la hora de inicio del horario y let porque se va a modificar
    
    while (sumarMinutos(horaActual, duracionCita) <= horario.horaFin) {
      const horaFinSlot = sumarMinutos(horaActual, duracionCita);
      
      slots.push({
        inicio: horaActual,
        fin: horaFinSlot
      });
      
      horaActual = sumarMinutos(horaActual, horario.intervalo);
    }
    
    // Filtrar slots ocupados por pausas
    const slotsSinPausas = slots.filter(slot => {
      return !pausas.some(pausa => {
        return slot.inicio >= pausa.inicio && slot.fin <= pausa.fin;
      });
    });
    
    // Filtrar slots ocupados por citas
    const slotsDisponibles = slotsSinPausas.filter(slot => {
      return !citas.some(cita => {
        return slot.inicio >= cita.horaInicio && slot.fin <= cita.horaFin;
      });
    });
    
    res.json(slotsDisponibles);
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};