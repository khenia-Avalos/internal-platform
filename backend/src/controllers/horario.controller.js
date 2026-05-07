

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
export const getHorariosDisponiblesPublicos = async (req, res) => {
  try {
    const { doctorId, fecha } = req.params;
    
    console.log('\n========== GET HORARIOS PUBLICOS ==========');
    console.log(`📝 Doctor ID: ${doctorId}`);
    console.log(`📝 Fecha: ${fecha}`);
    
    // Validar formato de fecha
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ message: 'Fecha inválida. Use formato YYYY-MM-DD' });
    }
    
    // Validar que el doctor existe
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      console.log('❌ Doctor no encontrado');
      return res.status(404).json({ message: 'Veterinario no encontrado' });
    }
    
    // Obtener el día de la semana
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const fechaObj = new Date(fecha);
    const diaSemana = diasSemana[fechaObj.getDay()];
    
    console.log(`📝 Día de la semana: ${diaSemana}`);
    
    // Buscar horario del doctor para ese día
    const horario = await Horario.findOne({ 
      doctorId: doctorId, 
      dia: diaSemana,
      activo: true
    });
    
    if (!horario) {
      console.log(`⚠️ No hay horario configurado para ${diaSemana}`);
      return res.json([]);
    }
    
    console.log(`📝 Horario encontrado: ${horario.horaInicio} - ${horario.horaFin}, intervalo: ${horario.intervalo} min`);
    
    // Obtener citas ya agendadas para ese día
    const citas = await Cita.find({ 
      doctorId: doctorId, 
      fecha: fecha,
      estado: { $ne: 'cancelada' }
    });
    
    console.log(`📝 Citas existentes: ${citas.length}`);
    
    // Generar bloques de horarios disponibles
    const horariosDisponibles = [];
    const [horaInicio, minInicio] = horario.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horario.horaFin.split(':').map(Number);
    const intervaloMinutos = horario.intervalo || 30;
    
    let currentMinutes = horaInicio * 60 + minInicio;
    const finMinutes = horaFin * 60 + minFin;
    
    while (currentMinutes + intervaloMinutos <= finMinutes) {
      const inicio = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`;
      const fin = `${Math.floor((currentMinutes + intervaloMinutos) / 60).toString().padStart(2, '0')}:${((currentMinutes + intervaloMinutos) % 60).toString().padStart(2, '0')}`;
      
      // Verificar si el horario está ocupado
      const ocupado = citas.some(cita => cita.horaInicio === inicio);
      
      if (!ocupado) {
        horariosDisponibles.push({
          inicio,
          fin
        });
      }
      
      currentMinutes += intervaloMinutos;
    }
    
    console.log(`✅ Horarios disponibles: ${horariosDisponibles.length}`);
    res.json(horariosDisponibles);
    
  } catch (error) {
    console.error('❌ Error en getHorariosDisponiblesPublicos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error al cargar horarios disponibles' });
  }
};