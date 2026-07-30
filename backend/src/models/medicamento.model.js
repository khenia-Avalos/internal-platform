// backend/src/models/medicamento.model.js
import mongoose from 'mongoose';

const medicamentoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  foto: {
    type: String,
    default: ''
  },
  via: {
    type: String,
    required: true,
    enum: ['Oral', 'Intramuscular', 'Intravenosa', 'Subcutánea', 'Tópica', 'Inhalatoria', 'Oftálmica', 'Ótica'],
    default: 'Oral'
  },
  presentacion: {
    type: String,
    required: true,
    trim: true
  },
  paraQueSirve: {
    type: String,
    required: true,
    trim: true
  },
  // Campos adicionales útiles
  dosis: {
    type: String,
    default: ''
  },
  contraindicaciones: {
    type: String,
    default: ''
  },
  efectosSecundarios: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas
medicamentoSchema.index({ nombre: 'text', paraQueSirve: 'text' });

export default mongoose.model('Medicamento', medicamentoSchema);