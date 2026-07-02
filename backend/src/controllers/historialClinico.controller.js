import HistorialClinico from '../models/historialClinico.model.js';
import { manejarError } from '../utils/errorHandler.js';

// Obtener historial por cita
export const getHistorialByCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    console.log('🔍 Buscando historial para cita:', citaId);
    
    const historial = await HistorialClinico.findOne({ citaId })
      .populate('pacienteId', 'nombre especie raza edad')
      .populate('citaId', 'fecha horaInicio titulo doctorId');
    
    if (!historial) {
      return res.status(404).json({ 
        success: false,
        message: 'No hay registro clínico para esta cita' 
      });
    }
    
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Obtener historial por paciente
export const getHistorialByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const historial = await HistorialClinico.find({ pacienteId })
      .populate('citaId', 'fecha horaInicio titulo estado')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: historial });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
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
      .populate('citaId', 'fecha horaInicio titulo');
    
    if (!historial) {
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    res.json({ success: true, data: historial });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};

// Crear historial
export const createHistorial = async (req, res) => {
  try {
    console.log('📝 Creando historial clínico');
    console.log('📝 Datos recibidos:', req.body);
    
    const { 
      pacienteId, 
      citaId, 
      motivoConsulta, 
      sintomas, 
      tiempoSintomas,
      diagnostico, 
      tratamiento, 
      medicamentos, 
      examenes, 
      signosVitales,
      observaciones, 
      proximaCitaSugerida,
      estadoConsulta
    } = req.body;

    // Verificar si ya existe
    const existe = await HistorialClinico.findOne({ citaId });
    if (existe) {
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe un registro clínico para esta cita' 
      });
    }

    // Procesar medicamentos si vienen como string
    let medicamentosArray = [];
    if (typeof medicamentos === 'string' && medicamentos.trim()) {
      medicamentosArray = medicamentos.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          return {
            nombre: parts[0] || '',
            dosis: parts[1] || '',
            frecuencia: parts[2] || '',
            duracion: parts[3] || '',
            via: parts[4] || ''
          };
        });
    } else if (Array.isArray(medicamentos)) {
      medicamentosArray = medicamentos;
    }

    // Procesar examenes si vienen como string
    let examenesArray = [];
    if (typeof examenes === 'string' && examenes.trim()) {
      examenesArray = examenes.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          return {
            nombre: parts[0] || '',
            resultado: parts[1] || '',
            fecha: parts[2] ? new Date(parts[2]) : null
          };
        });
    } else if (Array.isArray(examenes)) {
      examenesArray = examenes;
    }

    // Procesar signos vitales
    let signosVitalesObj = {
      peso: { valor: 0, unidad: 'kg' },
      temperatura: 0,
      frecuenciaCardiaca: 0,
      frecuenciaRespiratoria: 0,
      presionArterial: ''
    };

    if (signosVitales) {
      signosVitalesObj = {
        peso: signosVitales.peso || { valor: 0, unidad: 'kg' },
        temperatura: signosVitales.temperatura || 0,
        frecuenciaCardiaca: signosVitales.frecuenciaCardiaca || 0,
        frecuenciaRespiratoria: signosVitales.frecuenciaRespiratoria || 0,
        presionArterial: signosVitales.presionArterial || ''
      };
    }

    const nuevo = new HistorialClinico({
      pacienteId,
      citaId,
      motivoConsulta: motivoConsulta || '',
      sintomas: sintomas || '',
      tiempoSintomas: tiempoSintomas || '',
      diagnostico: diagnostico || '',
      tratamiento: tratamiento || '',
      medicamentos: medicamentosArray,
      examenes: examenesArray,
      signosVitales: signosVitalesObj,
      observaciones: observaciones || '',
      proximaCitaSugerida: proximaCitaSugerida || null,
      estadoConsulta: estadoConsulta || 'completada'
    });

    const guardado = await nuevo.save();
    console.log('✅ Historial guardado:', guardado._id);
    
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
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('📝 Actualizando historial:', id);

    // Procesar medicamentos si vienen como string
    let medicamentosArray = data.medicamentos;
    if (typeof data.medicamentos === 'string' && data.medicamentos.trim()) {
      medicamentosArray = data.medicamentos.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          return {
            nombre: parts[0] || '',
            dosis: parts[1] || '',
            frecuencia: parts[2] || '',
            duracion: parts[3] || '',
            via: parts[4] || ''
          };
        });
    }

    // Procesar examenes si vienen como string
    let examenesArray = data.examenes;
    if (typeof data.examenes === 'string' && data.examenes.trim()) {
      examenesArray = data.examenes.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          return {
            nombre: parts[0] || '',
            resultado: parts[1] || '',
            fecha: parts[2] ? new Date(parts[2]) : null
          };
        });
    }

    const datosActualizados = {
      ...data,
      medicamentos: medicamentosArray,
      examenes: examenesArray
    };

    const actualizado = await HistorialClinico.findByIdAndUpdate(
      id, 
      datosActualizados, 
      { new: true, runValidators: true }
    );
    
    if (!actualizado) {
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
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
  try {
    const { id } = req.params;
    
    const eliminado = await HistorialClinico.findByIdAndDelete(id);
    
    if (!eliminado) {
      return res.status(404).json({ 
        success: false,
        message: 'Registro clínico no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Registro clínico eliminado exitosamente' 
    });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      success: false,
      message: errorResponse.message 
    });
  }
};