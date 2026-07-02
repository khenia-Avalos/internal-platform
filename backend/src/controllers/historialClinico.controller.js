import HistorialClinico from '../models/historialClinico.model.js';
import { manejarError } from '../utils/errorHandler.js';

// Obtener historial por cita
export const getHistorialByCita = async (req, res) => {
  console.log('🔥🔥🔥 getHistorialByCita EJECUTÁNDOSE 🔥🔥🔥');
  console.log('📝 citaId recibido:', req.params.citaId);
  
  try {
    const { citaId } = req.params;
    console.log('🔍 Buscando historial para cita:', citaId);
    
    const historial = await HistorialClinico.findOne({ citaId })
      .populate('pacienteId', 'nombre especie raza edad')
      .populate('citaId', 'fecha horaInicio titulo doctorId');
    
    console.log('📊 Resultado de búsqueda:', historial ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    if (!historial) {
      console.log('❌ No hay registro clínico para esta cita');
      return res.status(404).json({ 
        success: false,
        message: 'No hay registro clínico para esta cita' 
      });
    }
    
    console.log('✅ Historial encontrado, enviando respuesta');
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error en getHistorialByCita:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Obtener historial por paciente
export const getHistorialByPaciente = async (req, res) => {
  console.log('🔥 getHistorialByPaciente LLAMADO');
  try {
    const { pacienteId } = req.params;
    console.log('🔍 Buscando historial para paciente:', pacienteId);
    
    const historial = await HistorialClinico.find({ pacienteId })
      .populate('citaId', 'fecha horaInicio titulo estado')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Encontrados ${historial.length} registros`);
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error en getHistorialByPaciente:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Obtener historial por ID
export const getHistorialById = async (req, res) => {
  console.log('🔥 getHistorialById LLAMADO');
  try {
    const { id } = req.params;
    console.log('🔍 Buscando historial por ID:', id);
    
    const historial = await HistorialClinico.findById(id)
      .populate('pacienteId', 'nombre especie raza')
      .populate('citaId', 'fecha horaInicio titulo');
    
    if (!historial) {
      console.log('❌ Registro no encontrado');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('✅ Registro encontrado');
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error en getHistorialById:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Crear historial
export const createHistorial = async (req, res) => {
  console.log('🔥🔥🔥 createHistorial LLAMADO 🔥🔥🔥');
  console.log('📝 Datos recibidos:', JSON.stringify(req.body, null, 2));
  
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

    // Verificar campos obligatorios
    if (!pacienteId || !citaId) {
      console.log('❌ Faltan campos obligatorios: pacienteId o citaId');
      return res.status(400).json({ 
        success: false,
        message: 'pacienteId y citaId son obligatorios' 
      });
    }

    // Verificar si ya existe
    const existe = await HistorialClinico.findOne({ citaId });
    if (existe) {
      console.log('❌ Ya existe un registro para esta cita');
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
      medicamentos: medicamentos || [],
      examenes: examenes || [],
      observaciones: observaciones || '',
      proximaCitaSugerida: proximaCitaSugerida || null,
      estadoConsulta: 'completada'
    });

    console.log('💾 Guardando historial...');
    const guardado = await nuevo.save();
    console.log('✅ Historial guardado con ID:', guardado._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registro clínico creado exitosamente',
      data: guardado 
    });
  } catch (error) {
    console.error('❌ Error al crear historial:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Actualizar historial
export const updateHistorial = async (req, res) => {
  console.log('🔥 updateHistorial LLAMADO');
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('📝 Actualizando historial ID:', id);
    console.log('📝 Datos a actualizar:', JSON.stringify(data, null, 2));

    const actualizado = await HistorialClinico.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    );
    
    if (!actualizado) {
      console.log('❌ Registro no encontrado para actualizar');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('✅ Registro actualizado:', actualizado._id);
    res.json({ 
      success: true, 
      message: 'Registro actualizado exitosamente',
      data: actualizado 
    });
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Eliminar historial
export const deleteHistorial = async (req, res) => {
  console.log('🔥 deleteHistorial LLAMADO');
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando historial ID:', id);
    
    const eliminado = await HistorialClinico.findByIdAndDelete(id);
    
    if (!eliminado) {
      console.log('❌ Registro no encontrado para eliminar');
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    console.log('✅ Registro eliminado:', eliminado._id);
    res.json({ 
      success: true, 
      message: 'Registro clínico eliminado exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};S