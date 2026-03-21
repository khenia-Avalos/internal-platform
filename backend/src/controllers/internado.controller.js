import Internado from '../models/internado.model.js';
import { manejarError } from '../utils/errorHandler.js';  // ← IMPORTAR



export const getInternadosByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const internados = await Internado.find({ pacienteId }).sort({ fechaIngreso: -1 });
    res.json(internados);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};


// Crear un nuevo internado
export const createInternado = async (req, res) => {
  try {
    const {pacienteId, fechaIngreso, fechaEgreso, medicamentos, notas, } = req.body;

    
    const newInternado = new Internado({
      pacienteId,
      fechaIngreso,
      fechaEgreso,
      medicamentos,
      notas
    });


    const savedInternado = await newInternado.save();
    
    // No enviar password en la respuesta
    const internadoResponse = savedInternado.toObject();
    
    res.status(201).json(internadoResponse);
  } catch (error) {
     const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Actualizar internado
export const updateInternado = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log("ID recibido:", id);
    console.log("Datos recibidos:", data);
    
    
    const internadoActualizado = await Internado.findByIdAndUpdate(id, data, { new: true });
    
    if (!internadoActualizado) {
      return res.status(404).json({ message: "Internado no encontrado" });
    }
    
    res.json(internadoActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Eliminar internado
export const deleteInternado = async (req, res) => {
  try {
    const { id } = req.params;
    
    const internadoEliminado = await Internado.findByIdAndDelete(id);
    
    if (!internadoEliminado) {
      return res.status(404).json({ message: "Internado no encontrado" });
    }
    
    res.json({ message: "Internado eliminado correctamente" });
  } catch (error) {
    const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Obtener un internado por ID
export const getInternadosById = async (req, res) => {
  try {
    const { id } = req.params;
    const internado = await Internado.findById(id);
    
    if (!internado) {
      return res.status(404).json({ message: "Internado no encontrado" });
    }
    
    res.json(internado);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};