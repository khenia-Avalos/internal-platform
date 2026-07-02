import mongoose from 'mongoose';

const historialClinicoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  citaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cita',
    required: true
  },
  // Datos médicos de la consulta
  motivoConsulta: {
    type: String,
    trim: true,
    default: ''
  },
  sintomas: {
    type: String,
    trim: true,
    default: ''
  },
  diagnostico: {
    type: String,
    trim: true,
    default: ''
  },
  tratamiento: {
    type: String,
    trim: true,
    default: ''
  },
  // Medicamentos recetados
  medicamentos: [{
    nombre: {
      type: String,
      trim: true
    },
    dosis: {
      type: String,
      trim: true
    },
    frecuencia: {
      type: String,
      trim: true
    },
    duracion: {
      type: String,
      trim: true
    }
  }],
  // Exámenes realizados
  examenes: [{
    nombre: {
      type: String,
      trim: true
    },
    resultado: {
      type: String,
      trim: true
    },
    fecha: {
      type: Date
    }
  }],
  // Signos vitales
  pesoRegistrado: {
    valor: Number,
    unidad: {
      type: String,
      enum: ['kg', 'lb', 'g'],
      default: 'kg'
    }
  },
  temperaturaRegistrada: {
    type: Number
  },
  // Observaciones generales
  observaciones: {
    type: String,
    trim: true,
    default: ''
  },
  // Próxima cita sugerida
  proximaCitaSugerida: {
    type: Date
  },
  // Estado de la consulta
  estadoConsulta: {
    type: String,
    enum: ['en_progreso', 'completada', 'pendiente'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

export default mongoose.model('HistorialClinico', historialClinicoSchema);