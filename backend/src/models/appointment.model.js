import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Información de la cita
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // HH:mm formato 24h
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  
  // Estado y tipo
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consulta', 'vacunacion', 'cirugia', 'grooming', 'urgencia', 'seguimiento', 'otros'],
    default: 'consulta'
  },
  
  // Relaciones
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información adicional
  service: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Recordatorios
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para búsqueda por fecha y estado
appointmentSchema.index({ appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ veterinarian: 1 });

export default mongoose.model('Appointment', appointmentSchema);