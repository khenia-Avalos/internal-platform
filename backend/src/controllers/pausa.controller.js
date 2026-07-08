import { manejarError } from '../utils/errorHandler.js'; 
import Pausa from '../models/pausa.model.js';

export const iniciarPausa = async (req, res) => {
  try {
    const { doctorId, motivo } = req.body;
    
    const nuevaPausa = new Pausa({
      doctorId,
      motivo: motivo || "almuerzo",
      fecha: new Date(),
      inicio: new Date(),
      fin: null,
      activa: true
    });
    
    const pausaGuardada = await nuevaPausa.save();
    res.status(201).json(pausaGuardada);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const terminarPausa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pausaActualizada = await Pausa.findByIdAndUpdate(
      id,
      { 
        fin: new Date(),  
        activa: false   
      },
      { new: true }
    );
    
    if (!pausaActualizada) {
      return res.status(404).json({ 
        message: "Pausa no encontrada" 
      });
    }
    
    res.json(pausaActualizada);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const getPausasActivas = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("Buscando pausas activas para doctorId:", doctorId);
    
    const pausas = await Pausa.find({ doctorId, activa: true });
    
    console.log("Pausas encontradas:", pausas.length);
    console.log("Datos:", pausas);
    
    res.json(pausas);
  } catch (error) {
    console.error("Error en getPausasActivas:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

//  Obtener historial completo de pausas (activas e inactivas)
export const getHistorialPausas = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("Buscando historial de pausas para doctorId:", doctorId);
    
    // Obtener todas las pausas del doctor, ordenadas por fecha descendente
    const pausas = await Pausa.find({ doctorId }).sort({ inicio: -1 });
    
    console.log("Pausas encontradas en historial:", pausas.length);
    
    res.json(pausas);
  } catch (error) {
    console.error("Error en getHistorialPausas:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Obtener historial con filtro por fecha
export const getHistorialPausasPorFecha = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    
    const query = { doctorId };
    
    if (fechaInicio || fechaFin) {
      query.inicio = {};
      if (fechaInicio) {
        query.inicio.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        query.inicio.$lte = new Date(fechaFin);
      }
    }
    
    const pausas = await Pausa.find(query).sort({ inicio: -1 });
    res.json(pausas);
  } catch (error) {
    console.error("Error en getHistorialPausasPorFecha:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};