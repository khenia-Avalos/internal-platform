import User from '../models/user.model.js';
import Paciente from '../models/pacientes.model.js';
import Cita from '../models/cita.model.js'
import { manejarError } from '../utils/errorHandler.js'; 
import Horario from '../models/horario.model.js';
import Pausa from '../models/pausa.model.js';
import { sendAppointmentConfirmationEmail } from '../services/authService.js';
import { createAccessToken } from '../libs/jwt.js';
import { FRONTEND_URL } from '../config.js';
import { renderizarPagina } from '../utils/htmlRenderer.js';


import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';


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
    console.log(" Body recibido:", req.body);
    
    const { doctorId, pacienteId, fecha, horaInicio, horaFin, motivo, notas, correo, tipoCita, titulo, descripcion } = req.body;
    
    console.log("Correo recibido:", correo);
    console.log(" doctorId:", doctorId);
    console.log(" pacienteId:", pacienteId);
    console.log(" tipoCita:", tipoCita);
    console.log(" titulo:", titulo);
    
    // Verificar que el doctor existe y es doctor
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      console.log(" Doctor no encontrado");
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    console.log(" Doctor encontrado:", doctor.username);
    
    // Verificar que el paciente (mascota) existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      console.log(" Paciente no encontrado");
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    console.log(" Paciente encontrado:", paciente.nombre);
    
    const nuevaCita = new Cita({
      doctorId,
      pacienteId,
      fecha,
      horaInicio,
      horaFin,
      motivo,
      notas,
      tipoCita,
      titulo,
      descripcion
    });
    
    const citaGuardada = await nuevaCita.save();
    console.log(" Cita guardada con ID:", citaGuardada._id);

    // . PRIMERO: Generar y guardar el token
    const tokenConfirmacion = await createAccessToken({ id: citaGuardada._id }, "7d");
    citaGuardada.tokenConfirmacion = tokenConfirmacion;
    await citaGuardada.save();
    console.log(" Token generado y guardado");

    //  SEGUNDO: Volver a buscar la cita con populate (AHORA con token incluido)
    const citaConDatos = await Cita.findById(citaGuardada._id)
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email'
        }
      });
    
    // . TERCERO: Enviar correo de confirmación
    if (correo) {
      console.log(" Intentando enviar correo a:", correo);
      try {
        await sendAppointmentConfirmationEmail(
          correo,
          paciente.ownerId?.username || "Cliente",
          citaConDatos
        );
        console.log(" Correo enviado exitosamente a:", correo);
      } catch (emailError) {
        console.error(" Error enviando correo:", emailError.message);
      }
    } else {
      console.log(" No se proporcionó correo, no se envió notificación");
    }
    
    console.log("========== FIN createCita ==========");
    res.status(201).json(citaGuardada);
    
  } catch (error) {
    console.error(" Error en createCita:", error);
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
      .populate('doctorId', 'username lastname especialidad') //  AGREGAR ESTO
      .populate('pacienteId', 'nombre especie raza')
      .sort({ fecha: -1, horaInicio: 1 });
    
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
      .populate('pacienteId', 'nombre especie raza') //  AGREGADO: para mostrar nombre de la mascota
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
    const data = req.body;
    
    // Obtener la cita actual
    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    // Si se intenta CANCELAR desde el dashboard (admin/doctor pueden cancelar sin restriccion de tiempo)
    if (data.estado === 'cancelada') {
      // Obtener fecha y hora actual en Costa Rica
      const ahoraCR = new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' });
      const ahora = new Date(ahoraCR);
      
      // cita.fecha es un objeto Date, extraer año, mes, dia
      const fechaCitaObj = new Date(cita.fecha);
      const anio = fechaCitaObj.getUTCFullYear();
      const mes = fechaCitaObj.getUTCMonth();
      const dia = fechaCitaObj.getUTCDate();
      
      // Obtener hora de la cita
      const [horaInicio, minutoInicio] = cita.horaInicio.split(':').map(Number);
      
      // Crear fecha de la cita en hora local Costa Rica
      const fechaCitaCR = new Date(anio, mes, dia, horaInicio, minutoInicio, 0);
      
      console.log(`Fecha cita CR: ${fechaCitaCR}`);
      console.log(`Fecha actual CR: ${ahora}`);
      console.log(`Diferencia en minutos: ${(fechaCitaCR - ahora) / (1000 * 60)}`);
      
      // Verificar si la cita ya pasó
      if (fechaCitaCR < ahora) {
        return res.status(400).json({ message: "No se puede cancelar una cita que ya ha pasado" });
      }
      
      // Admin y doctor pueden cancelar sin importar el tiempo restante
      // No hay validacion de 2 horas aqui
    }
    
    // Si se intenta CONFIRMAR, verificar que no este cancelada
    if (data.estado === 'confirmada' && cita.estado === 'cancelada') {
      return res.status(400).json({ message: "No se puede confirmar una cita cancelada" });
    }
    
    // Si se intenta COMPLETAR, verificar que no este cancelada
    if (data.estado === 'completada' && cita.estado === 'cancelada') {
      return res.status(400).json({ message: "No se puede completar una cita cancelada" });
    }
    
    const citaActualizada = await Cita.findByIdAndUpdate(id, data, { new: true });
    res.json(citaActualizada);
    
  } catch (error) {
    console.error("Error en updateCita:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
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
    
    // Primero obtener la cita con todos los populates
    const cita = await Cita.findById(id)
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email phoneNumber'
        }
      })
      .populate('clienteTemporalId', 'username email phoneNumber estado direccion'); // ← Asegurar que trae estos campos
    
    console.log(" Cita encontrada:", JSON.stringify(cita, null, 2));
    console.log(" clienteTemporalId:", cita?.clienteTemporalId);
    
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    res.json(cita);
  } catch (error) {
    console.error(" Error en getCitaById:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const confirmarCitaConToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    // Verificar el token
    try {
      jwt.verify(token, TOKEN_SECRET);
    } catch (error) {
      return res.status(400).send(renderizarPagina(
        'Enlace inválido',
        'El enlace de confirmación no es válido o ha caducado.',
        'error'
      ));
    }
    
    // Buscar la cita
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).send(renderizarPagina(
        'Cita no encontrada',
        'La cita que intentas confirmar no existe.',
        'error'
      ));
    }
    
    // Verificar que el token coincida
    if (cita.tokenConfirmacion !== token) {
      return res.status(400).send(renderizarPagina(
        'Token inválido',
        'El token de confirmación no es válido.',
        'error'
      ));
    }
    
    // Verificar si ya está cancelada
    if (cita.estado === 'cancelada') {
      return res.status(400).send(renderizarPagina(
        'Cita cancelada',
        'Esta cita ya fue cancelada y no puede ser confirmada.',
        'advertencia'
      ));
    }
    
    // Verificar si ya está confirmada
    if (cita.estado === 'confirmada') {
      return res.send(renderizarPagina(
        'Cita ya confirmada',
        'Esta cita ya había sido confirmada anteriormente.',
        'advertencia'
      ));
    }
    
    // Verificar si ya está completada
    if (cita.estado === 'completada') {
      return res.status(400).send(renderizarPagina(
        'Cita completada',
        'Esta cita ya ha sido completada.',
        'info'
      ));
    }
    
    // Confirmar la cita
    cita.estado = 'confirmada';
    await cita.save();
    
    res.send(renderizarPagina(
      'Cita Confirmada',
      'Tu cita ha sido confirmada exitosamente.',
      'exito'
    ));
    
  } catch (error) {
    console.error("Error en confirmarCitaConToken:", error);
    res.status(500).send(renderizarPagina(
      'Error',
      'Ocurrió un error al confirmar la cita.',
      'error'
    ));
  }
};

export const cancelarCitaConToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    // Verificar el token
    try {
      jwt.verify(token, TOKEN_SECRET);
    } catch (error) {
      return res.status(400).send(renderizarPagina(
        'Enlace invalido',
        'El enlace de cancelacion no es valido o ha caducado.',
        'error'
      ));
    }
    
    // Buscar la cita
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).send(renderizarPagina(
        'Cita no encontrada',
        'La cita que intentas cancelar no existe.',
        'error'
      ));
    }
    
    // Verificar que el token coincida
    if (cita.tokenConfirmacion !== token) {
      return res.status(400).send(renderizarPagina(
        'Token invalido',
        'El token de cancelacion no es valido.',
        'error'
      ));
    }
    
    // Verificar si ya esta cancelada
    if (cita.estado === 'cancelada') {
      return res.send(renderizarPagina(
        'Cita ya cancelada',
        'Esta cita ya habia sido cancelada anteriormente.',
        'advertencia'
      ));
    }
    
    // Verificar si ya esta completada
    if (cita.estado === 'completada') {
      return res.status(400).send(renderizarPagina(
        'Cita completada',
        'Esta cita ya ha sido completada.',
        'info'
      ));
    }
    
    // Crear la fecha y hora de la cita en Costa Rica
    const fechaCitaStr = cita.fecha.toISOString().split('T')[0]; // "2026-06-03"
    const fechaHoraCitaStr = `${fechaCitaStr}T${cita.horaInicio}:00-06:00`; // "2026-06-03T16:30:00-06:00"
    const fechaCitaCR = new Date(fechaHoraCitaStr);
    
    // Fecha actual en Costa Rica
    const ahoraCR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    
    const horasDiferencia = (fechaCitaCR - ahoraCR) / (1000 * 60 * 60);
    const limiteHoras = 2;
    
    console.log('=== CANCELAR CITA CON TOKEN ===');
    console.log(`fechaHoraCitaStr: ${fechaHoraCitaStr}`);
    console.log(`fechaCitaCR: ${fechaCitaCR}`);
    console.log(`ahoraCR: ${ahoraCR}`);
    console.log(`horasDiferencia: ${horasDiferencia}`);
    
    // Si la cita ya paso
    if (fechaCitaCR < ahoraCR) {
      return res.status(400).send(renderizarPagina(
        'Cita ya pasada',
        'No se puede cancelar una cita que ya ha pasado.',
        'error'
      ));
    }
    
    // Si faltan menos de 2 horas
    if (horasDiferencia < limiteHoras) {
      const horasRestantes = Math.floor(horasDiferencia);
      const minutosRestantes = Math.floor((horasDiferencia % 1) * 60);
      return res.status(400).send(renderizarPagina(
        'Cancelacion no permitida',
        `Solo puedes cancelar la cita con al menos ${limiteHoras} horas de anticipacion. Faltan ${horasRestantes} horas y ${minutosRestantes} minutos. Si necesitas cancelar, por favor contacta a la clinica.`,
        'advertencia'
      ));
    }
    
    // Cancelar la cita
    cita.estado = 'cancelada';
    await cita.save();
    
    res.send(renderizarPagina(
      'Cita Cancelada',
      'Tu cita ha sido cancelada exitosamente.',
      'exito'
    ));
    
  } catch (error) {
    console.error("Error en cancelarCitaConToken:", error);
    res.status(500).send(renderizarPagina(
      'Error',
      'Ocurrio un error al cancelar la cita.',
      'error'
    ));
  }
};