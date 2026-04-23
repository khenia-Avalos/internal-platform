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
    console.log("========== INICIO createCita ==========");
    console.log("📥 Body recibido:", req.body);
    
    const { doctorId, pacienteId, fecha, horaInicio, horaFin, motivo, notas, correo } = req.body;
    
    console.log("📧 Correo recibido:", correo);
    console.log("👨‍⚕️ doctorId:", doctorId);
    console.log("🐾 pacienteId:", pacienteId);
    
    // Verificar que el doctor existe y es doctor
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      console.log("❌ Doctor no encontrado");
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    console.log("✅ Doctor encontrado:", doctor.username);
    
    // Verificar que el paciente (mascota) existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      console.log("❌ Paciente no encontrado");
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    console.log("✅ Paciente encontrado:", paciente.nombre);
    
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
    console.log("✅ Cita guardada con ID:", citaGuardada._id);
    
    // Enviar correo de confirmación
    if (correo) {
      console.log("📧 Intentando enviar correo a:", correo);
      try {
        await sendAppointmentConfirmationEmail(
          correo,
          paciente.ownerId?.username || "Cliente",
          citaGuardada
        );
        console.log("✅ Correo enviado exitosamente a:", correo);
      } catch (emailError) {
        console.error("❌ Error enviando correo:", emailError.message);
        // No detenemos el proceso, la cita ya está creada
      }
    } else {
      console.log("⚠️ No se proporcionó correo, no se envió notificación");
    }
    
    console.log("========== FIN createCita ==========");
    res.status(201).json(citaGuardada);
    
  } catch (error) {
    console.error("❌ Error en createCita:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

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
    
    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado no válido" });
    }
    
    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      { estado, motivo, notas },
      { new: true, runValidators: true }
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
    const { doctorId, fecha } = req.params;
    
    console.log("========== INICIO getHorariosDisponibles ==========");
    console.log("   doctorId:", doctorId);
    console.log("   fecha:", fecha);
    
    const ahora = new Date();
    const esHoy = new Date(fecha).toDateString() === ahora.toDateString();
    const horaActual = ahora.toLocaleTimeString('en-US', { 
      timeZone: 'America/Costa_Rica', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const horaActualEnMinutos = parseInt(horaActual.split(':')[0]) * 60 + parseInt(horaActual.split(':')[1]);
    
    const diaSemana = new Date(fecha).getDay();
    const horario = await Horario.findOne({ doctorId, dia: diaSemana });
    
    if (!horario || !horario.activo) {
      console.log("No hay horario activo para este día");
      return res.json([]);
    }
    
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      console.log("Fecha pasada");
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
  },
  estado: { $ne: 'cancelada' }  // ← EXCLUIR CITAS CANCELADAS
});
    
    //  SIMPLIFICADO: usar horario.intervalo como duración
    const duracion = horario.intervalo;
    
    const slots = [];
    let horaActualSlot = horario.horaInicio;
    
    while (sumarMinutos(horaActualSlot, duracion) <= horario.horaFin) {
      const horaFinSlot = sumarMinutos(horaActualSlot, duracion);
      slots.push({ inicio: horaActualSlot, fin: horaFinSlot });
      horaActualSlot = sumarMinutos(horaActualSlot, duracion);
    }
    
    const slotsDisponibles = slots.filter(slot => {
      let disponible = true;
      let motivo = "";
      
      // 1. Horas pasadas (margen 15 min)
      if (esHoy) {
        const slotInicioEnMinutos = parseInt(slot.inicio.split(':')[0]) * 60 + parseInt(slot.inicio.split(':')[1]);
        const diferencia = horaActualEnMinutos - slotInicioEnMinutos;
        if (diferencia > 15) {
          disponible = false;
          motivo = `hora pasada`;
        }
      }
      
      // 2. Pausas
      if (disponible) {
        const enPausa = pausas.some(pausa => {
          const inicioPausa = new Date(pausa.inicio).toLocaleTimeString('en-US', { 
            timeZone: 'America/Costa_Rica', hour: '2-digit', minute: '2-digit', hour12: false 
          });
          if (!pausa.fin) {
            const finPausa = sumarMinutosAHora(inicioPausa, 75);
            return slot.fin > inicioPausa && slot.fin < finPausa;
          }
          const finPausa = new Date(pausa.fin).toLocaleTimeString('en-US', { 
            timeZone: 'America/Costa_Rica', hour: '2-digit', minute: '2-digit', hour12: false 
          });
          return slot.inicio >= inicioPausa && slot.fin <= finPausa;
        });
        if (enPausa) {
          disponible = false;
          motivo = "almuerzo";
        }
      }
      
      // 3. Citas existentes
      if (disponible) {
        const ocupado = citas.some(cita => {
          return (slot.inicio >= cita.horaInicio && slot.inicio < cita.horaFin) ||
                 (slot.fin > cita.horaInicio && slot.fin <= cita.horaFin) ||
                 (slot.inicio <= cita.horaInicio && slot.fin >= cita.horaFin);
        });
        if (ocupado) {
          disponible = false;
          motivo = "cita existente";
        }
      }
      
      console.log(`   Slot ${slot.inicio}-${slot.fin}: ${disponible ? "✅" : `❌ ${motivo}`}`);
      return disponible;
    });
    
    res.json(slotsDisponibles);
    
  } catch (error) {
    console.error("Error en getHorariosDisponibles:", error);
    res.status(500).json({ message: "Error al obtener horarios disponibles" });
  }
};

export const getCitasRequest = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email'
        }
      });
    res.json(citas);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cita = await Cita.findById(id)
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email'
        }
      });
    
    console.log("🔍 Cita encontrada:", JSON.stringify(cita, null, 2));
    
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    res.json(cita);
  } catch (error) {
    console.error("❌ Error en getCitaById:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};