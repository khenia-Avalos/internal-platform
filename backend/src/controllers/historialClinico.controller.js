// controllers/historialClinico.controller.js
import HistorialClinico from '../models/historialClinico.model.js';
import Paciente from '../models/pacientes.model.js';
import { manejarError } from '../utils/errorHandler.js';

// obtener historial por cita
export const getHistorialByCita = async (req, res) => {
  console.log('getHistorialByCita ejecutandose');
  console.log('citaId recibido:', req.params.citaId);
  
  try {
    const { citaId } = req.params;
    console.log('buscando historial para cita:', citaId);
    
    const historial = await HistorialClinico.findOne({ citaId })
      .populate('pacienteId', 'nombre especie raza edad fallecido')
      .populate('citaId', 'fecha horaInicio titulo doctorId');
    
    console.log('resultado de busqueda:', historial ? 'encontrado' : 'no encontrado');
    
    if (!historial) {
      console.log('no hay registro clinico para esta cita');
      return res.status(404).json({ 
        success: false,
        message: 'No hay registro clínico para esta cita' 
      });
    }
    
    console.log('historial encontrado, enviando respuesta');
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('error en getHistorialByCita:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// obtener historial por paciente
export const getHistorialByPaciente = async (req, res) => {
  console.log('getHistorialByPaciente llamado');
  try {
    const { pacienteId } = req.params;
    console.log('buscando historial para paciente:', pacienteId);
    
    const historial = await HistorialClinico.find({ pacienteId })
      .populate('pacienteId', 'nombre especie raza fallecido')
      .populate('citaId', 'fecha horaInicio titulo estado')
      .sort({ createdAt: -1 });
    
    console.log(`encontrados ${historial.length} registros`);
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('error en getHistorialByPaciente:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// obtener historial por id
export const getHistorialById = async (req, res) => {
  console.log('getHistorialById llamado');
  try {
    const { id } = req.params;
    console.log('buscando historial por id:', id);
    
    const historial = await HistorialClinico.findById(id)
      .populate('pacienteId', 'nombre especie raza fallecido')
      .populate('citaId', 'fecha horaInicio titulo');
    
    if (!historial) {
      console.log('registro no encontrado');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('registro encontrado');
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('error en getHistorialById:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// crear historial
export const createHistorial = async (req, res) => {
  console.log('createHistorial llamado');
  console.log('datos recibidos:', JSON.stringify(req.body, null, 2));
  
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
      observaciones, 
      proximaCitaSugerida
    } = req.body;

    // verificar campos obligatorios
    if (!pacienteId || !citaId) {
      console.log('faltan campos obligatorios: pacienteId o citaId');
      return res.status(400).json({ 
        success: false,
        message: 'pacienteId y citaId son obligatorios' 
      });
    }

    // validacion: verificar si el paciente esta fallecido
    console.log('verificando estado del paciente:', pacienteId);
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      console.log('paciente no encontrado');
      return res.status(404).json({ 
        success: false,
        message: 'Paciente no encontrado' 
      });
    }
    
    console.log(`paciente: ${paciente.nombre}, fallecido: ${paciente.fallecido}`);
    
    if (paciente.fallecido === true) {
      console.log('paciente fallecido, no se puede crear registro clinico');
      return res.status(400).json({ 
        success: false,
        message: `No se puede crear un registro clínico para ${paciente.nombre} porque está marcado como fallecido.`,
        field: 'pacienteId'
      });
    }

    // verificar si ya existe un registro para esta cita
    const existe = await HistorialClinico.findOne({ citaId });
    if (existe) {
      console.log('ya existe un registro para esta cita');
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe un registro clínico para esta cita' 
      });
    }

    const nuevo = new HistorialClinico({
      pacienteId,
      citaId,
      motivoConsulta: motivoConsulta || '',
      sintomas: sintomas || '',
      diagnostico: diagnostico || '',
      tratamiento: tratamiento || '',
      medicamentos: medicamentos || '', // String
      examenes: examenes || '',         // String
      observaciones: observaciones || '',
      proximaCitaSugerida: proximaCitaSugerida || null,
      estadoConsulta: 'completada'
    });

    console.log('guardando historial...');
    const guardado = await nuevo.save();
    console.log('historial guardado con id:', guardado._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registro clínico creado exitosamente',
      data: guardado 
    });
  } catch (error) {
    console.error('error al crear historial:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// actualizar historial
export const updateHistorial = async (req, res) => {
  console.log('updateHistorial llamado');
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('actualizando historial id:', id);
    console.log('datos a actualizar:', JSON.stringify(data, null, 2));

    // validacion: verificar si el paciente esta fallecido
    const historialExistente = await HistorialClinico.findById(id);
    if (!historialExistente) {
      console.log('registro no encontrado');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('verificando estado del paciente:', historialExistente.pacienteId);
    const paciente = await Paciente.findById(historialExistente.pacienteId);
    
    if (paciente && paciente.fallecido === true) {
      console.log('paciente fallecido, no se puede actualizar registro clinico');
      return res.status(400).json({ 
        success: false,
        message: `No se puede actualizar el registro clínico porque el paciente está marcado como fallecido.`,
        field: 'pacienteId'
      });
    }

    const actualizado = await HistorialClinico.findByIdAndUpdate(
      id, 
      {
        motivoConsulta: data.motivoConsulta || '',
        sintomas: data.sintomas || '',
        diagnostico: data.diagnostico || '',
        tratamiento: data.tratamiento || '',
        medicamentos: data.medicamentos || '', // String
        examenes: data.examenes || '',         // String
        observaciones: data.observaciones || '',
        proximaCitaSugerida: data.proximaCitaSugerida || null
      },
      { new: true, runValidators: true }
    );
    
    if (!actualizado) {
      console.log('registro no encontrado para actualizar');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('registro actualizado:', actualizado._id);
    res.json({ 
      success: true, 
      message: 'Registro actualizado exitosamente',
      data: actualizado 
    });
  } catch (error) {
    console.error('error al actualizar:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// eliminar historial
export const deleteHistorial = async (req, res) => {
  console.log('deleteHistorial llamado');
  try {
    const { id } = req.params;
    console.log('eliminando historial id:', id);
    
    // verificar si existe
    const historialExistente = await HistorialClinico.findById(id);
    if (!historialExistente) {
      console.log('registro no encontrado para eliminar');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    // eliminar
    const eliminado = await HistorialClinico.findByIdAndDelete(id);
    
    console.log('registro eliminado:', eliminado._id);
    res.json({ 
      success: true, 
      message: 'Registro clínico eliminado exitosamente' 
    });
  } catch (error) {
    console.error('error al eliminar:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// funcion adicional: verificar si un paciente esta fallecido
export const verificarPacienteFallecido = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    console.log('verificando si paciente esta fallecido:', pacienteId);
    
    const paciente = await Paciente.findById(pacienteId).select('nombre fallecido fechaFallecimiento');
    
    if (!paciente) {
      return res.status(404).json({ 
        success: false,
        message: 'Paciente no encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: paciente._id,
        nombre: paciente.nombre,
        fallecido: paciente.fallecido || false,
        fechaFallecimiento: paciente.fechaFallecimiento || null
      }
    });
  } catch (error) {
    console.error('error en verificarPacienteFallecido:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};