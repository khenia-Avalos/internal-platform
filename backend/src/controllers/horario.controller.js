

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
    
    console.log('\n= GET HORARIOS PUBLICOS =');
    console.log(` doctor id: ${doctorId}`);
    console.log(` fecha recibida: ${fecha}`);
    
    // validar formato de fecha
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ message: 'Fecha inválida. Use formato YYYY-MM-DD' });
    }
    
    // validar que el doctor existe
    const User = await import('../models/user.model.js').then(m => m.default);
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      console.log('doctor no encontrado');
      return res.status(404).json({ message: 'Veterinario no encontrado' });
    }
    
    // obtener hoy en zona horaria de costa rica
    const hoyCR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    const hoyStr = hoyCR.toLocaleDateString('en-CA');
    
    console.log(` fecha recibida: ${fecha}`);
    console.log(` hoy cr: ${hoyStr}`);
    console.log(` fecha < hoy cr: ${fecha < hoyStr}`);
    
    // validar que la fecha no sea pasada (usando strings)
    if (fecha < hoyStr) {
      console.log('fecha pasada - no se muestran horarios');
      return res.json([]);
    }
    
    // verificar si es hoy (en costa rica)
    const esHoy = fecha === hoyStr;
    console.log(` esHoy: ${esHoy}`);
    
    // obtener hora actual en costa rica
    const ahoraCR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    const horaActualStr = ahoraCR.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const horaActualEnMinutos = parseInt(horaActualStr.split(':')[0]) * 60 + parseInt(horaActualStr.split(':')[1]);
    
    console.log(` hora actual costa rica: ${horaActualStr} (${horaActualEnMinutos} minutos)`);
    
    // obtener el numero del dia (en costa rica)
    const fechaObj = new Date(fecha);
    const numeroDia = fechaObj.getDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const nombreDia = diasSemana[numeroDia];
    
    console.log(` dia: ${nombreDia} (numero: ${numeroDia})`);
    
    // buscar horario usando el numero del dia
    const Horario = await import('../models/horario.model.js').then(m => m.default);
    const horario = await Horario.findOne({ 
      doctorId: doctorId, 
      dia: numeroDia,
      activo: true
    });
    
    if (!horario) {
      console.log(`no hay horario configurado para ${nombreDia}`);
      return res.json([]);
    }
    
    console.log(` horario encontrado: ${horario.horaInicio} - ${horario.horaFin}, intervalo: ${horario.intervalo} min`);
    
    // obtener citas ya agendadas para ese dia
    const Cita = await import('../models/cita.model.js').then(m => m.default);
    const citas = await Cita.find({ 
      doctorId: doctorId, 
      fecha: fecha,
      estado: { $ne: 'cancelada' }
    });
    
    console.log(` citas existentes: ${citas.length}`);
    
    // generar bloques de horarios disponibles
    const horariosDisponibles = [];
    const [horaInicio, minInicio] = horario.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horario.horaFin.split(':').map(Number);
    const intervaloMinutos = horario.intervalo || 30;
    
    let currentMinutes = horaInicio * 60 + minInicio;
    const finMinutes = horaFin * 60 + minFin;
    
    // crear set de horarios ocupados
    const horariosOcupados = new Set(citas.map(cita => cita.horaInicio));
    
    let slotsDisponibles = 0;
    
    while (currentMinutes + intervaloMinutos <= finMinutes) {
      const inicio = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`;
      const fin = `${Math.floor((currentMinutes + intervaloMinutos) / 60).toString().padStart(2, '0')}:${((currentMinutes + intervaloMinutos) % 60).toString().padStart(2, '0')}`;
      
      let horarioDisponible = true;
      
      // si es hoy, filtrar horarios que ya pasaron (margen 15 minutos)
      if (esHoy) {
        const slotInicioEnMinutos = parseInt(inicio.split(':')[0]) * 60 + parseInt(inicio.split(':')[1]);
        if (slotInicioEnMinutos < horaActualEnMinutos + 15) {
          horarioDisponible = false;
          console.log(` horario ${inicio} - ${fin} descartado: ya paso`);
        }
      }
      
      // si esta disponible y no esta ocupado
      if (horarioDisponible && !horariosOcupados.has(inicio)) {
        horariosDisponibles.push({ inicio, fin });
        slotsDisponibles++;
      }
      
      currentMinutes += intervaloMinutos;
    }
    
    console.log(` horarios disponibles despues de filtrar: ${slotsDisponibles}`);
    console.log(' fin get horarios publicos \n');
    
    res.json(horariosDisponibles);
    
  } catch (error) {
    console.error('error en getHorariosDisponiblesPublicos:', error);
    console.error('stack:', error.stack);
    res.status(500).json({ message: 'Error al cargar horarios disponibles' });
  }
};