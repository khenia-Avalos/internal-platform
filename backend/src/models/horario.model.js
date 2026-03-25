import mongoose from 'mongoose';

const horarioSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,  
    required: true,
    ref: 'User'
  },
  dia: {
    type: Number,
    required: true,
    min: 0, 
    max: 6
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
  intervalo: {
    type: Number,
    required: true,
    default: 30, 
    min: 15, 
    max: 120
  },
  activo: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

horarioSchema.index({ doctorId: 1, dia: 1 }, { unique: true });

export default mongoose.model('Horario', horarioSchema);