import HistorialClinico from '../models/historialClinico.model.js';
import { manejarError } from '../utils/errorHandler.js';

// Obtener historial por ID de cita
export const getHistorialByCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    
    const historial = await HistorialClinico.findOne({ citaId })
      .populate('pacienteId', 'nombre especie raza')
      .populate('citaId', 'fecha horaInicio titulo');
    
    if (!historial) {
      return res.status(404).json({ message: 'No hay registro clínico para esta cita' });
    }
    
    res.json(historial);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Obtener historial por ID de paciente (todos los registros)
export const getHistorialByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const historial = await HistorialClinico.find({ pacienteId })
      .populate('citaId', 'fecha horaInicio titulo estado')
      .sort({ createdAt: -1 });
    
    res.json(historial);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Crear nuevo registro clínico
export const createHistorial = async (req, res) => {
  try {
    const { 
      pacienteId, 
      citaId, 
      motivoConsulta, 
      sintomas, 
      diagnostico, 
      tratamiento, 
      medicamentos, 
      examenes, 
      pesoRegistrado, 
      temperaturaRegistrada, 
      observaciones, 
      proximaCitaSugerida,
      estadoConsulta
    } = req.body;

    // Verificar si ya existe un historial para esta cita
    const existeHistorial = await HistorialClinico.findOne({ citaId });
    if (existeHistorial) {
      return res.status(400).json({ 
        message: 'Ya existe un registro clínico para esta cita' 
      });
    }

    const newHistorial = new HistorialClinico({
      pacienteId,
      citaId,
      motivoConsulta,
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos,
      examenes,
      pesoRegistrado,
      temperaturaRegistrada,
      observaciones,
      proximaCitaSugerida,
      estadoConsulta: estadoConsulta || 'completada'
    });

    const savedHistorial = await newHistorial.save();
    
    // Populate para respuesta
    const historialCompleto = await HistorialClinico.findById(savedHistorial._id)
      .populate('pacienteId', 'nombre especie raza')
      .populate('citaId', 'fecha horaInicio titulo');

    res.status(201).json(historialCompleto);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Actualizar registro clínico
export const updateHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar si el historial existe
    const historialExistente = await HistorialClinico.findById(id);
    if (!historialExistente) {
      return res.status(404).json({ message: 'Registro clínico no encontrado' });
    }

    const historialActualizado = await HistorialClinico.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    )
    .populate('pacienteId', 'nombre especie raza')
    .populate('citaId', 'fecha horaInicio titulo');

    res.json(historialActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Eliminar registro clínico
export const deleteHistorial = async (req, res) => {
  try {
    const { id } = req.params;

    const historialEliminado = await HistorialClinico.findByIdAndDelete(id);
    
    if (!historialEliminado) {
      return res.status(404).json({ message: 'Registro clínico no encontrado' });
    }

    res.json({ message: 'Registro clínico eliminado exitosamente' });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Obtener historial por ID
export const getHistorialById = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await HistorialClinico.findById(id)
      .populate('pacienteId', 'nombre especie raza')
      .populate('citaId', 'fecha horaInicio titulo estado');

    if (!historial) {
      return res.status(404).json({ message: 'Registro clínico no encontrado' });
    }

    res.json(historial);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};