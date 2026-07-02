import HistorialClinico from '../models/historialClinico.model.js';

// Obtener historial por cita
export const getHistorialByCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    console.log('🔍 Buscando historial para cita:', citaId);
    
    const historial = await HistorialClinico.findOne({ citaId });
    
    if (!historial) {
      return res.status(404).json({ 
        success: false,
        message: 'No hay registro clínico para esta cita' 
      });
    }
    
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener historial por paciente
export const getHistorialByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const historial = await HistorialClinico.find({ pacienteId }).sort({ createdAt: -1 });
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener historial por ID
export const getHistorialById = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await HistorialClinico.findById(id);
    
    if (!historial) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Crear historial
export const createHistorial = async (req, res) => {
  try {
    console.log('📝 Creando historial con datos:', req.body);
    
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
      proximaCitaSugerida 
    } = req.body;

    // Verificar si ya existe
    const existe = await HistorialClinico.findOne({ citaId });
    if (existe) {
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
      pesoRegistrado: pesoRegistrado || { valor: 0, unidad: 'kg' },
      temperaturaRegistrada: temperaturaRegistrada || 0,
      observaciones: observaciones || '',
      proximaCitaSugerida: proximaCitaSugerida || null,
      estadoConsulta: 'completada'
    });

    const guardado = await nuevo.save();
    console.log('✅ Historial guardado:', guardado);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registro clínico creado exitosamente',
      data: guardado 
    });
  } catch (error) {
    console.error('❌ Error al crear historial:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar historial
export const updateHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('📝 Actualizando historial:', id, data);

    const actualizado = await HistorialClinico.findByIdAndUpdate(id, data, { new: true });
    
    if (!actualizado) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    
    res.json({ success: true, message: 'Registro actualizado', data: actualizado });
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar historial
export const deleteHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await HistorialClinico.findByIdAndDelete(id);
    
    if (!eliminado) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    
    res.json({ success: true, message: 'Registro eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};