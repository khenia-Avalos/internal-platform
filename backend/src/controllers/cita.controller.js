// controllers/cita.controller.js
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
    
    // ========== VALIDACIÓN: Verificar si el paciente está fallecido ==========
    if (paciente.fallecido === true) {
      console.log(" Paciente fallecido, no se puede agendar cita");
      return res.status(400).json({ 
        message: `No se puede agendar una cita para ${paciente.nombre} porque está marcado como fallecido.`,
        field: 'pacienteId'
      });
    }
    
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

    // Generar y guardar el token
    const tokenConfirmacion = await createAccessToken({ id: citaGuardada._id }, "7d");
    citaGuardada.tokenConfirmacion = tokenConfirmacion;
    await citaGuardada.save();
    console.log(" Token generado y guardado");

    // Volver a buscar la cita con populate
    const citaConDatos = await Cita.findById(citaGuardada._id)
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email'
        }
      });
    
    // Enviar correo de confirmación
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
      .populate('doctorId', 'username lastname especialidad')
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

export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const usuario = req.user;
    const userRole = usuario?.role;
    
    console.log('=========================================');
    console.log('UPDATE CITA - CANCELACION');
    console.log(`Cita ID: ${id}`);
    console.log(`Rol usuario: ${userRole}`);
    
    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    if (data.estado === 'cancelada') {
      const fechaCitaUTC = new Date(cita.fecha);
      const año = fechaCitaUTC.getUTCFullYear();
      const mes = fechaCitaUTC.getUTCMonth();
      const dia = fechaCitaUTC.getUTCDate();
      
      const [horaInicio, minutoInicio] = cita.horaInicio.split(':').map(Number);
      const fechaCitaCR = new Date(año, mes, dia, horaInicio, minutoInicio, 0);
      
      const ahoraCR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
      const horasDiferencia = (fechaCitaCR - ahoraCR) / (1000 * 60 * 60);
      const limiteHoras = 2;
      
      console.log(`fechaCitaCR: ${fechaCitaCR}`);
      console.log(`ahoraCR: ${ahoraCR}`);
      console.log(`horasDiferencia: ${horasDiferencia}`);
      
      if (fechaCitaCR < ahoraCR) {
        return res.status(400).json({ message: "No se puede cancelar una cita que ya ha pasado" });
      }
      
      if (userRole === 'client') {
        if (horasDiferencia < limiteHoras) {
          const horasRestantes = Math.floor(horasDiferencia);
          const minutosRestantes = Math.floor((horasDiferencia % 1) * 60);
          return res.status(400).json({ 
            message: `Solo puedes cancelar la cita con al menos ${limiteHoras} horas de anticipacion. Si necesitas cancelar, por favor contacta a la clinica.`
          });
        }
      }
    }
    
    if (data.estado === 'confirmada' && cita.estado === 'cancelada') {
      return res.status(400).json({ message: "No se puede confirmar una cita cancelada" });
    }
    
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

// controllers/cita.controller.js

export const getHorariosDisponibles = async (req, res) => {
  try {
    const { doctorId, fecha } = req.params;
    
    console.log("========== INICIO getHorariosDisponibles ==========");
    console.log("   doctorId:", doctorId);
    console.log("   fecha:", fecha);
    
    // CORREGIDO: Crear fecha en zona horaria local
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    hoy.setHours(0, 0, 0, 0);
    
    console.log("   fechaSeleccionada:", fechaSeleccionada);
    console.log("   hoy:", hoy);
    
    // Validar que la fecha no sea pasada (solo si es menor a hoy)
    if (fechaSeleccionada < hoy) {
      console.log("Fecha pasada - no se muestran horarios");
      return res.json([]);
    }
    
    const esHoy = fechaSeleccionada.getTime() === hoy.getTime();
    
    // Obtener hora actual en formato HH:MM (zona local)
    const ahoraLocal = new Date();
    const horaActualStr = ahoraLocal.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const horaActualEnMinutos = parseInt(horaActualStr.split(':')[0]) * 60 + parseInt(horaActualStr.split(':')[1]);
    
    console.log("   esHoy:", esHoy);
    console.log("   horaActualStr:", horaActualStr);
    console.log("   horaActualEnMinutos:", horaActualEnMinutos);
    
    const diaSemana = fechaSeleccionada.getDay();
    const horario = await Horario.findOne({ doctorId, dia: diaSemana });
    
    if (!horario || !horario.activo) {
      console.log("No hay horario activo para este día");
      return res.json([]);
    }
    
    // Obtener pausas y citas para la fecha seleccionada
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(year, month - 1, day);
    fechaFin.setHours(23, 59, 59, 999);
    
    const pausas = await Pausa.find({ 
      doctorId, 
      fecha: {
        $gte: fechaInicio,
        $lt: fechaFin
      },
      activa: true
    });
    
    const citas = await Cita.find({ 
      doctorId, 
      fecha: {
        $gte: fechaInicio,
        $lt: fechaFin
      },
      estado: { $ne: 'cancelada' }
    });
    
    const duracion = horario.intervalo;
    
    // Generar slots
    const slots = [];
    let horaActualSlot = horario.horaInicio;
    
    while (sumarMinutos(horaActualSlot, duracion) <= horario.horaFin) {
      const horaFinSlot = sumarMinutos(horaActualSlot, duracion);
      slots.push({ inicio: horaActualSlot, fin: horaFinSlot });
      horaActualSlot = sumarMinutos(horaActualSlot, duracion);
    }
    
    // Filtrar slots disponibles
    const slotsDisponibles = slots.filter(slot => {
      let disponible = true;
      let motivo = "";
      
      // Si es hoy, filtrar slots que ya pasaron (con margen de 15 minutos)
      if (esHoy) {
        const slotInicioEnMinutos = parseInt(slot.inicio.split(':')[0]) * 60 + parseInt(slot.inicio.split(':')[1]);
        // Permitir slots que empiecen al menos 15 minutos después de la hora actual
        if (slotInicioEnMinutos < horaActualEnMinutos + 15) {
          disponible = false;
          motivo = `hora pasada (${slot.inicio})`;
        }
      }
      
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
    
    console.log(`Slots disponibles: ${slotsDisponibles.length}`);
    console.log("========== FIN getHorariosDisponibles ==========");
    
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
          select: 'username email phoneNumber'
        }
      })
      .populate('clienteTemporalId', 'username email phoneNumber estado direccion');
    
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
    
    try {
      jwt.verify(token, TOKEN_SECRET);
    } catch (error) {
      return res.status(400).send(renderizarPagina(
        'Enlace inválido',
        'El enlace de confirmación no es válido o ha caducado.',
        'error'
      ));
    }
    
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).send(renderizarPagina(
        'Cita no encontrada',
        'La cita que intentas confirmar no existe.',
        'error'
      ));
    }
    
    if (cita.tokenConfirmacion !== token) {
      return res.status(400).send(renderizarPagina(
        'Token inválido',
        'El token de confirmación no es válido.',
        'error'
      ));
    }
    
    if (cita.estado === 'cancelada') {
      return res.status(400).send(renderizarPagina(
        'Cita cancelada',
        'Esta cita ya fue cancelada y no puede ser confirmada.',
        'advertencia'
      ));
    }
    
    if (cita.estado === 'confirmada') {
      return res.send(renderizarPagina(
        'Cita ya confirmada',
        'Esta cita ya había sido confirmada anteriormente.',
        'advertencia'
      ));
    }
    
    if (cita.estado === 'completada') {
      return res.status(400).send(renderizarPagina(
        'Cita completada',
        'Esta cita ya ha sido completada.',
        'info'
      ));
    }
    
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
    
    console.log('=========================================');
    console.log('CANCELAR CITA CON TOKEN - INICIO');
    console.log(`Cita ID: ${id}`);
    
    try {
      jwt.verify(token, TOKEN_SECRET);
    } catch (error) {
      return res.status(400).send(renderizarPagina(
        'Enlace invalido',
        'El enlace de cancelacion no es valido o ha caducado.',
        'error'
      ));
    }
    
    const cita = await Cita.findById(id);
    
    if (!cita) {
      return res.status(404).send(renderizarPagina(
        'Cita no encontrada',
        'La cita que intentas cancelar no existe.',
        'error'
      ));
    }
    
    console.log(`cita.fecha (raw): ${cita.fecha}`);
    console.log(`cita.horaInicio: ${cita.horaInicio}`);
    
    if (cita.tokenConfirmacion !== token) {
      return res.status(400).send(renderizarPagina(
        'Token invalido',
        'El token de cancelacion no es valido.',
        'error'
      ));
    }
    
    if (cita.estado === 'cancelada') {
      return res.send(renderizarPagina(
        'Cita ya cancelada',
        'Esta cita ya habia sido cancelada anteriormente.',
        'advertencia'
      ));
    }
    
    if (cita.estado === 'completada') {
      return res.status(400).send(renderizarPagina(
        'Cita completada',
        'Esta cita ya ha sido completada.',
        'info'
      ));
    }
    
    const fechaCitaUTC = new Date(cita.fecha);
    const año = fechaCitaUTC.getUTCFullYear();
    const mes = fechaCitaUTC.getUTCMonth();
    const dia = fechaCitaUTC.getUTCDate();
    
    const [horaInicio, minutoInicio] = cita.horaInicio.split(':').map(Number);
    const fechaCitaCR = new Date(año, mes, dia, horaInicio, minutoInicio, 0);
    const ahoraCR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    const horasDiferencia = (fechaCitaCR - ahoraCR) / (1000 * 60 * 60);
    const limiteHoras = 2;
    
    console.log(`fechaCitaCR: ${fechaCitaCR}`);
    console.log(`ahoraCR: ${ahoraCR}`);
    console.log(`horasDiferencia: ${horasDiferencia}`);
    
    if (fechaCitaCR < ahoraCR) {
      console.log('CANCELACION DENEGADA: Cita ya pasada');
      return res.status(400).send(renderizarPagina(
        'Cita ya pasada',
        'No se puede cancelar una cita que ya ha pasado.',
        'error'
      ));
    }
    
    if (horasDiferencia < limiteHoras) {
      const horasRestantes = Math.floor(horasDiferencia);
      const minutosRestantes = Math.floor((horasDiferencia % 1) * 60);
      console.log(`CANCELACION DENEGADA: Faltan ${horasRestantes}h ${minutosRestantes}m (menos de ${limiteHoras}h)`);
      return res.status(400).send(renderizarPagina(
        'Cancelacion no permitida',
        `Solo puedes cancelar la cita con al menos ${limiteHoras} horas de anticipacion. Si necesitas cancelar, por favor contacta a la clinica.`,
        'advertencia'
      ));
    }
    
    console.log(`CANCELACION PERMITIDA: Faltan ${horasDiferencia} horas`);
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