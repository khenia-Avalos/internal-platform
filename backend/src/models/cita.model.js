import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  fecha: {
    type: Date,
    required: true  
  },
  horaInicio: {
    type: String,
    required: true, 
    trim: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  horaFin: {
    type: String,
    required: true,
    trim: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  motivo: {
    type: String,
    trim: true,
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    trim: true,
    default: ''
  },
  // ✅ CAMPOS AGREGADOS
  tipoCita: {
    type: String,
    enum: ['consulta', 'vacunacion', 'cirugia', 'estetica'],
    default: 'consulta'
  },
  titulo: {
    type: String,
    default: ''
  },
  descripcion: {
    type: String,
    default: ''
  },
  tokenConfirmacion: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Cita', citaSchema);