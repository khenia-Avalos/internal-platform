

import mongoose from 'mongoose';

import { manejarError } from '../utils/errorHandler.js'; 
import Horario from '../models/horario.model.js';
import User from '../models/user.model.js';      // ← AGREGAR
import Cita from '../models/cita.model.js';      // ← AGREGAR



export const getHorariosByDoctorRequest = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const horarios = await Horario.find({ doctorId });
    res.json(horarios);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
}

export const createHorario = async (req, res) => {
  try {
    const { doctorId, dia, horaInicio, horaFin, intervalo, activo = true } = req.body;
    
    if (horaFin <= horaInicio) {
      return res.status(400).json({ 
        message: "La hora de fin debe ser mayor a la hora de inicio" 
      });
    }

    if (intervalo < 15 || intervalo > 120) {
      return res.status(400).json({ 
        message: "El intervalo debe estar entre 15 y 120 minutos" 
      });
    }
    
    const nuevoHorario = new Horario({
      doctorId,
      dia,
      horaInicio,
      horaFin,
      intervalo,
      activo
    });
    
    const horarioGuardado = await nuevoHorario.save();
    res.status(201).json(horarioGuardado);
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
}

export const updateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia, horaInicio, horaFin, intervalo, activo } = req.body;
    
    //  VALIDACIONES PRIMERO
    if (horaInicio && horaFin && horaFin <= horaInicio) {
      return res.status(400).json({ 
        message: "La hora de fin debe ser mayor a la hora de inicio" 
      });
    }
    
    const horarioActualizado = await Horario.findByIdAndUpdate(
      id,
      { dia, horaInicio, horaFin, intervalo, activo },
      { new: true }//hace que devuelva el documento actualizado
    );
    
    if (!horarioActualizado) {
      return res.status(404).json({ 
        message: "Horario no encontrado" 
      });
    }
    
    res.json(horarioActualizado);
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
}

export const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const horarioEliminado = await Horario.findByIdAndDelete(id);
    
    if (!horarioEliminado) {
      return res.status(404).json({ 
        message: "Horario no encontrado" 
      });
    }
    
    res.json({ 
      message: "Horario eliminado correctamente",
      horario: horarioEliminado 
    });
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};
// controllers/horario.controller.js

export const getHorariosDisponiblesPublicos = async (req, res) => {
  try {
    const { doctorId, fecha } = req.params;
    
    console.log('\n========== GET HORARIOS PUBLICOS ==========');
    console.log(` Doctor ID: ${doctorId}`);
    console.log(` Fecha: ${fecha}`);
    
    // Validar formato de fecha
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ message: 'Fecha inválida. Use formato YYYY-MM-DD' });
    }
    
    // Validar que el doctor existe
    const User = await import('../models/user.model.js').then(m => m.default);
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      console.log('❌ Doctor no encontrado');
      return res.status(404).json({ message: 'Veterinario no encontrado' });
    }
    
    // ========== CREAR FECHA EN ZONA LOCAL ==========
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    hoy.setHours(0, 0, 0, 0);
    
    console.log(` fechaSeleccionada: ${fechaSeleccionada}`);
    console.log(` hoy: ${hoy}`);
    
    // Validar que la fecha no sea pasada
    if (fechaSeleccionada < hoy) {
      console.log('❌ Fecha pasada - no se muestran horarios');
      return res.json([]);
    }
    
    // ========== VERIFICAR SI ES HOY CORRECTAMENTE ==========
    const esHoy = fechaSeleccionada.getFullYear() === hoy.getFullYear() &&
                  fechaSeleccionada.getMonth() === hoy.getMonth() &&
                  fechaSeleccionada.getDate() === hoy.getDate();
    
    // Obtener hora actual en Costa Rica
    const ahoraCR = new Date();
    const horaActualStr = ahoraCR.toLocaleTimeString('en-US', { 
      timeZone: 'America/Costa_Rica', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const horaActualEnMinutos = parseInt(horaActualStr.split(':')[0]) * 60 + parseInt(horaActualStr.split(':')[1]);
    
    console.log(` esHoy: ${esHoy}`);
    console.log(` Hora actual Costa Rica: ${horaActualStr} (${horaActualEnMinutos} minutos)`);
    
    // Obtener el NÚMERO del día
    const numeroDia = fechaSeleccionada.getDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const nombreDia = diasSemana[numeroDia];
    
    console.log(` Día: ${nombreDia} (número: ${numeroDia})`);
    
    // Buscar horario usando el NÚMERO del día
    const Horario = await import('../models/horario.model.js').then(m => m.default);
    const horario = await Horario.findOne({ 
      doctorId: doctorId, 
      dia: numeroDia,
      activo: true
    });
    
    if (!horario) {
      console.log(`❌ No hay horario configurado para ${nombreDia}`);
      return res.json([]);
    }
    
    console.log(` Horario encontrado: ${horario.horaInicio} - ${horario.horaFin}, intervalo: ${horario.intervalo} min`);
    
    // Obtener citas ya agendadas para ese día
    const Cita = await import('../models/cita.model.js').then(m => m.default);
    const citas = await Cita.find({ 
      doctorId: doctorId, 
      fecha: fecha,
      estado: { $ne: 'cancelada' }
    });
    
    console.log(` Citas existentes: ${citas.length}`);
    
    // Generar bloques de horarios disponibles
    const horariosDisponibles = [];
    const [horaInicio, minInicio] = horario.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horario.horaFin.split(':').map(Number);
    const intervaloMinutos = horario.intervalo || 30;
    
    let currentMinutes = horaInicio * 60 + minInicio;
    const finMinutes = horaFin * 60 + minFin;
    
    // Crear Set de horarios ocupados
    const horariosOcupados = new Set(citas.map(cita => cita.horaInicio));
    
    let slotsDisponibles = 0;
    
    while (currentMinutes + intervaloMinutos <= finMinutes) {
      const inicio = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`;
      const fin = `${Math.floor((currentMinutes + intervaloMinutos) / 60).toString().padStart(2, '0')}:${((currentMinutes + intervaloMinutos) % 60).toString().padStart(2, '0')}`;
      
      let horarioDisponible = true;
      
      // Si es hoy, filtrar horarios que ya pasaron (margen 15 minutos)
      if (esHoy) {
        const slotInicioEnMinutos = parseInt(inicio.split(':')[0]) * 60 + parseInt(inicio.split(':')[1]);
        // Permitir slots que empiecen al menos 15 minutos después de la hora actual
        if (slotInicioEnMinutos < horaActualEnMinutos + 15) {
          horarioDisponible = false;
          console.log(` Horario ${inicio} - ${fin} descartado: ya pasó`);
        }
      }
      
      // Si está disponible y no está ocupado
      if (horarioDisponible && !horariosOcupados.has(inicio)) {
        horariosDisponibles.push({ inicio, fin });
        slotsDisponibles++;
      }
      
      currentMinutes += intervaloMinutos;
    }
    
    console.log(` Horarios disponibles después de filtrar: ${slotsDisponibles}`);
    console.log('========== FIN GET HORARIOS PUBLICOS ==========\n');
    
    res.json(horariosDisponibles);
    
  } catch (error) {
    console.error('❌ Error en getHorariosDisponiblesPublicos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error al cargar horarios disponibles' });
  }
};