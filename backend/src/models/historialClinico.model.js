// models/historialClinico.model.js
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
    required: true,
    unique: true
  },
  motivoConsulta: {
    type: String,
    default: ''
  },
  sintomas: {
    type: String,
    default: ''
  },
  diagnostico: {
    type: String,
    default: ''
  },
  tratamiento: {
    type: String,
    default: ''
  },
  medicamentos: {
    type: String,
    default: ''
  },
  examenes: {
    type: String,
    default: ''
  },
  observaciones: {
    type: String,
    default: ''
  },
  proximaCitaSugerida: {
    type: Date
  },
  estadoConsulta: {
    type: String,
    enum: ['en_progreso', 'completada', 'pendiente'],
    default: 'completada'
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
historialClinicoSchema.index({ pacienteId: 1 });
historialClinicoSchema.index({ citaId: 1 }, { unique: true });

export default mongoose.model('HistorialClinico', historialClinicoSchema);