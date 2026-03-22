
import { manejarError } from '../utils/errorHandler.js'; 
import Horario from '../models/horario.model.js';

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